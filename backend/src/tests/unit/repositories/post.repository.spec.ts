import { PrismaClient, Prisma } from "../../../infrastructure/prisma/generated/client";
import { UserRepository } from '../../../infrastructure/repositories/user.repository';
import { EventRepository } from '../../../infrastructure/repositories/event.repository';
import { PostRepository } from '../../../infrastructure/repositories/post.repository';
import { Post } from "../../../domain/entities/post.entity";
import {
    CreatePostDto,
    UpdatePostDto,
    PostView
} from "../../../application/dtos/post.dto";
import { Pagination } from "../../../application/dtos/pagination.dto";
import { SortOption } from "../../../application/dtos/sort-option.dto";
import { ListResult } from "../../../application/dtos/list-result.dto";
import { PostNotFoundError, NotPostAuthorError, PostInUnapprovedEventError } from "../../../domain/errors/post.error";
import { UserStatus } from "../../../domain/entities/enums";
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { restoreSnapshot } from "../../setup/test-db";
import { EventNotFoundError } from "../../../domain/errors/event.error";

const approvedEventId = '5c3c235b-1e94-4e3b-bacd-2dfa2ea56736';
const unapprovedEventId = 'c889bc1d-0b1a-4ec0-917c-0c9f72235ccc';
const authorId = '14548dfc-0b11-4308-bb71-f19d2b994049';
const anotherUserId = '2d033de0-7370-48aa-8f60-8aebfeae1118';
const nonExistentPostId = '3e5f1c2d-1234-5678-9101-112131415161';

const prisma = new PrismaClient();
const userRepo = new UserRepository(prisma);
const eventRepo = new EventRepository(prisma, userRepo);
const repo = new PostRepository(prisma, eventRepo, userRepo);

beforeAll(() => {
    restoreSnapshot();
})

beforeEach(() => {
    restoreSnapshot();
});

afterAll(async () => {
    await prisma.$disconnect();
});

async function createPost(overrides = {}) {
    return await repo.create({
        authorId,
        eventId: approvedEventId,
        content: 'This is a test post',
        imageUrl: 'http://example.com/image.jpg',
        ...overrides,
    });
}

async function createPostWithMissingOptionalFields(overrides = {}) {
    return await repo.create({
        authorId,
        eventId: approvedEventId,
        content: 'This is a test post without imageUrl',
        ...overrides,
    });
}

describe('PostRepository', () => {
    // 01: create
    describe('create', () => {
        it('should successfully create a post with valid DTO', async () => {
            
            const post = await createPost();
            expect(post).toBeDefined();
            expect(post.id).toBeDefined();
            expect(post.authorId).toBe(authorId);
            expect(post.eventId).toBe(approvedEventId);
            expect(post.content).toBe('This is a test post');
            expect(post.imageUrl).toBe('http://example.com/image.jpg');
        });

        it('should throw PostInUnapprovedEventError if event is unapproved', async () => {
            await expect(createPost({eventId: unapprovedEventId})).rejects.toThrow(PostInUnapprovedEventError);
        });

        it('should handle missing optional fields (e.g., no imageUrl)', async () => {
            const post = await createPostWithMissingOptionalFields();
            expect(post).toBeDefined();
            expect(post.id).toBeDefined();
            expect(post.authorId).toBe(authorId);
            expect(post.eventId).toBe(approvedEventId);
            expect(post.content).toBe('This is a test post without imageUrl');
        });
    });

    // 02: findById
    describe('findById', () => {
        it('should return the post if found', async () => {
            const mockPost = await createPost();
            const result = await repo.findById(mockPost.id);
            expect(result).toEqual(mockPost);
        });

        it('should trhow error if post not found', async () => {
            expect(repo.findById(nonExistentPostId)).rejects.toThrow(PostNotFoundError);
        });
    });

    // 03: update
    describe('update', () => {
        it('should successfully update a post with valid changes', async () => {
            const mockPost = await createPost();
            const changes: UpdatePostDto = {
                content: 'Updated content',
                imageUrl: 'http://new-image.com'
            };

            const result = await repo.update(mockPost.id, changes);
            expect(result.content).toBe('Updated content');
            expect(result.imageUrl).toBe('http://new-image.com');
        });

        it('should throw PostNotFoundError if post does not exist', async () => {
            await expect(repo.update(nonExistentPostId, {})).rejects.toThrow(PostNotFoundError);
        });

        it('should handle partial updates (only content)', async () => {
            const mockPost = await createPost();
            const changes: UpdatePostDto = { content: 'Partial update' };

            const result = await repo.update(mockPost.id, changes);;
            expect(result.content).toBe('Partial update');
            expect(result.imageUrl).toBe(mockPost.imageUrl); // Assuming original has it
        });
    });

    // 04: softDelete
    describe('softDelete', () => {
        it('should successfully soft-delete a post', async () => {
            const mockPost = await createPost();
            await expect(repo.softDelete(mockPost.id)).resolves.toBeUndefined();
        });

        it('should throw PostNotFoundError if post does not exist', async () => {
            await expect(repo.softDelete(nonExistentPostId)).rejects.toThrow(PostNotFoundError);
        });
    });

    // 05: restore
    describe('restore', () => {
        it('should successfully restore a soft-deleted post', async () => {
            const mockPost = await createPost();
            await repo.softDelete(mockPost.id);
            await expect(repo.restore(mockPost.id)).resolves.toBeUndefined();
            await expect(repo.findById(mockPost.id)).resolves.toBeDefined();
        });

        it('should throw PostNotFoundError if post does not exist or not deleted', async () => {
            await expect(repo.restore(nonExistentPostId)).rejects.toThrow(PostNotFoundError);
        });

        it('should handle already active post (no-op or error)', async () => {
            const mockPost = await createPost();
            await expect(repo.restore(mockPost.id)).resolves.toBeUndefined();
        });
    });

    // 06: findByEventId
    describe('findByEventId', () => {
        it('should return paginated list of posts for a specific event', async () => {
            const pagination: Pagination = { page: 1, limit: 2 };
            const postsToCreate = 5;
            for (let i = 0; i < postsToCreate; i++) {
                await createPost({ content: `Post ${i + 1}` });
            }

            const res = await repo.findByEventId(approvedEventId, pagination);
            expect(res.items).toHaveLength(2);
            expect(res.total).toBe(postsToCreate);
        });

        it('should throw error if eventId is undefined', async () => {
            await expect(repo.findByEventId(unapprovedEventId)).rejects.toThrow(EventNotFoundError);
        });

        it('should handle no posts found (empty list)', async () => {
            const res = await repo.findByEventId(approvedEventId);
            expect(res.items).toHaveLength(0);
        });

        it('should apply default pagination and sort if not provided', async () => {
            const postsToCreate = 5;
            for (let i = 0; i < postsToCreate; i++) {
                await createPost({ content: `Post ${i + 1}` });
            }

            const res = await repo.findByEventId(approvedEventId);
            expect(res.items).toHaveLength(5);
            expect(res.total).toBe(postsToCreate);
        });
    });

    // 07: findByAuthor
    describe('findByAuthor', () => {
        it('should return paginated list of posts by author', async () => {
            const pagination: Pagination = { page: 1, limit: 4 };
            const postsToCreate = 5;
            for (let i = 0; i < postsToCreate; i++) {
                await createPost({ content: `Post ${i + 1}` });
            }
            const res = await repo.findByAuthor(authorId, pagination);
            expect(res.items).toHaveLength(4);
            expect(res.total).toBe(postsToCreate);
        });

        it('should handle no posts found for author (empty list)', async () => {
            const res = await repo.findByAuthor(anotherUserId);
            expect(res.items).toHaveLength(0);
        });
    });

    // 08: search
    describe('search', () => {
        it('should return paginated list of posts matching keyword', async () => {
            const pagination: Pagination = { page: 1, limit: 2 };
            const postsToCreate = 5;
            for (let i = 0; i < postsToCreate; i++) {
                await createPost({ content: `Post ${i + 1}` });
            }

            const res = await repo.search(approvedEventId, 'post',pagination);
            expect(res.items).toHaveLength(2);
            expect(res.total).toBe(postsToCreate);
        });

        it('should handle no matches (empty list)', async () => {
            const pagination: Pagination = { page: 1, limit: 2 };
            const postsToCreate = 5;
            for (let i = 0; i < postsToCreate; i++) {
                await createPost({ content: `Post ${i + 1}` });
            }

            const res = await repo.search(approvedEventId, 'hahaha',pagination);
            expect(res.items).toHaveLength(0);
            expect(res.total).toBe(0);
        });

        it('should handle empty keyword (return all or error)', async () => {
            const pagination: Pagination = { page: 1, limit: 8 };
            const postsToCreate = 5;
            for (let i = 0; i < postsToCreate; i++) {
                await createPost({ content: `Post ${i + 1}` });
                await createPost({ content: `Another content ${i + 1}` });
            }

            const res = await repo.search(approvedEventId, '',pagination);
            expect(res.items).toHaveLength(8);
            expect(res.total).toBe(10);
        });
    });

    // 09: Stats - countByEventId & countByUserId
    describe('countByEventId', () => {
        it('should return the count of posts for an event', async () => {
            const postsToCreate = 5;
            for (let i = 0; i < postsToCreate; i++) {
                await createPost({ content: `Post ${i + 1}` });
            }
            const count = await repo.countByEventId(approvedEventId);
            expect(count).toBe(5);
        });

        it('should return 0 if no posts or event not found', async () => {
            const count = await repo.countByEventId(approvedEventId);
            expect(count).toBe(0);
        });
    });

    describe('countByUserId', () => {
        it('should return the count of posts by a user', async () => {
            const postsToCreate = 5;
            for (let i = 0; i < postsToCreate; i++) {
                await createPost({ content: `Post ${i + 1}` });
            }

            const count = await repo.countByUserId(authorId);
            expect(count).toBe(postsToCreate);
        });

        it('should return 0 if no posts or user not found', async () => {
            const count = await repo.countByUserId(unapprovedEventId);
            expect(count).toBe(0);
        });
    });
});