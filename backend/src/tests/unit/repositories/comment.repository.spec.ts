import { PrismaClient, Prisma } from "../../../infrastructure/prisma/generated/client";
import { UserRepository } from '../../../infrastructure/repositories/user.repository';
import { EventRepository } from '../../../infrastructure/repositories/event.repository';
import {
    CommentNotFoundError,
    NotCommentAuthorError,
    CommentOnUnapprovedEventError,
    InvalidCommentContentError,
} from '../../../domain/errors/comment.error';
import { PostNotFoundError, NotPostAuthorError, PostInUnapprovedEventError } from "../../../domain/errors/post.error";

import { Pagination } from "../../../application/dtos/pagination.dto";
import { SortOption } from "../../../application/dtos/sort-option.dto";
import { ListResult } from "../../../application/dtos/list-result.dto";
import { UserStatus } from "../../../domain/entities/enums";
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { restoreSnapshot } from "../../setup/test-db";
import { CommentRepository } from "../../../infrastructure/repositories/comment.repository";
import { PostRepository } from "../../../infrastructure/repositories/post.repository";

const approvedEventId = 'b923efe9-6cf3-4241-8147-d5829f557084';
const unapprovedEventId = 'c889bc1d-0b1a-4ec0-917c-0c9f72235ccc';
const authorId = '44d9da63-6118-4441-b1b0-c09681a3886f';
const anotherUserId = '2d033de0-7370-48aa-8f60-8aebfeae1118';
const nonExistentPostId = '3e5f1c2d-1234-5678-9101-112131415161';
const postId = 'b1367579-7927-495c-91b9-f215d2361d70';

const prisma = new PrismaClient();
const userRepo = new UserRepository(prisma);
const eventRepo = new EventRepository(prisma, userRepo);
const postRepo = new PostRepository(prisma, eventRepo, userRepo);
const repo = new CommentRepository(prisma, userRepo, postRepo);

beforeAll(() => {
    restoreSnapshot();
})

beforeEach(() => {
    restoreSnapshot();
});

afterAll(async () => {
    await prisma.$disconnect();
});

async function createComment(overrides = {}) {
    return await repo.create({
        authorId: authorId,
        postId: postId,
        content: 'This is a test comment',
        ...overrides,
    });
}
describe('CommentRepository', () => {
    // 01: create
    describe('create', () => {
        it('should successfully create a comment with valid DTO', async () => {
            const comment = await createComment();
            console.log(comment);
            expect(comment).toBeDefined();
            expect(comment.authorId).toBe(authorId);
            expect(comment.postId).toBe(postId);
        });

        it('should throw PostNotFound if comment in non existed post', async () => {
            await expect(createComment({ postId: nonExistentPostId })).rejects.toThrow(PostNotFoundError);
        });
    });

    // 02: findById
    describe('findById', () => {
        it('should return comment if found', async () => {
            const comment = await createComment();
            const result = await repo.findById(comment.id);
            expect(result).toEqual(comment);
        });

        it('should throw error if comment not found', async () => {
            await expect(repo.findById(nonExistentPostId)).rejects.toThrow(CommentNotFoundError);
        });
    });

    // 03: update
    describe('update', () => {
        it('should successfully update comment content', async () => {
            const changes = { content: 'Updated comment' };
            const comment = await createComment();
            const updatedComment = await repo.update(comment.id, changes);
            expect(updatedComment.content).toBe('Updated comment');
        });

        it('should throw CommentNotFoundError if comment does not exist', async () => {
            await expect(repo.update(nonExistentPostId, { content: 'x' })).rejects.toThrow(CommentNotFoundError);
        });
    });

    // 04: delete
    describe('delete', () => {
        it('should successfully delete a comment', async () => {
            const comment = await createComment();
            await expect(repo.delete(comment.id)).resolves.toBeUndefined();
        });

        it('should throw CommentNotFoundError if comment not found', async () => {
            await expect(repo.delete(nonExistentPostId)).rejects.toThrow(CommentNotFoundError);
        });
    });

    // 05: findByPostId
    describe('findByPostId', () => {
        it('should return paginated list of comments for a post', async () => {
            const commentCreate = 5;
            for (let i = 0; i < commentCreate; i++) {
                await createComment({ content: `This is comment ${i}` })
            }
            const pagination: Pagination = { page: 1, limit: 2 };
            const res = await repo.findByPostId(postId, pagination);
            expect(res.items).toHaveLength(2);
            expect(res.total).toBe(commentCreate);
        });

        it('should return empty list if no comments on post', async () => {
            const res = await repo.findByPostId(postId);
            expect(res.items).toHaveLength(0);
        });
    });

    // 06: countByPostId
    describe('countByPostId', () => {
        it('should return correct count of comments on a post', async () => {
            const commentCreate = 5;
            for (let i = 0; i < commentCreate; i++) {
                await createComment({ content: `This is comment ${i}` })
            }
            const count = await repo.countByPostId(postId);
            expect(count).toBe(5);
        });

        it('should return 0 if no comments or post not found', async () => {
            const count = await repo.countByPostId(postId);
            expect(count).toBe(0);
        });
    });
});