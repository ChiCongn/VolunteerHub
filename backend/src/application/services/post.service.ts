import { IPostRepository } from "../../domain/repositories/post.irepository";
import { Post } from "../../domain/entities/post.entity";
import { CreatePostDto, UpdatePostDto, PostView } from "../dtos/post.dto";
import { Pagination } from "../dtos/pagination.dto";
import { SortOption } from "../dtos/sort-option.dto";
import { ListResult } from "../dtos/list-result.dto";
import { eventRepo, postRepo } from "../../infrastructure/repositories";
import logger from "../../logger";
import { IEventRepository } from "../../domain/repositories/event.irepository";

export class PostService {
    constructor(
        private readonly postRepo: IPostRepository,
        private readonly eventRepo: IEventRepository
    ) {}

    // ================= Core CRUD =================
    async createPost(data: CreatePostDto): Promise<Post> {
        return this.postRepo.create(data);
    }

    async getPostById(id: string): Promise<Post> {
        return this.postRepo.findById(id);
    }

    async updatePost(id: string, changes: UpdatePostDto): Promise<Post> {
        return this.postRepo.update(id, changes);
    }

    async softDeletePost(id: string): Promise<void> {
        return this.postRepo.softDelete(id);
    }

    async restorePost(id: string): Promise<void> {
        return this.postRepo.restore(id);
    }

    // ================= Public Views =================
    async getPostsByEvent(
        eventId: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PostView>> {
        await this.eventRepo.checkExistedAndApprovedEvent(eventId);

        const sortableFields = new Set(["created_at", "author_id"]);

        const sortField = sort && sortableFields.has(sort.field) ? sort.field : "created_at";
        const sortOrder = sort?.order?.toLowerCase() === "asc" ? "asc" : "desc";
        const normalizedSort: SortOption = {
            field: sortField,
            order: sortOrder,
        };

        const page = Math.max(1, Number(pagination?.page) || 1);
        const limit = Math.max(1, Number(pagination?.limit) || 10);
        const normalizedPagination: Pagination = { page, limit };

        return this.postRepo.findByEventId(eventId, normalizedPagination, normalizedSort);
    }

    async findFeedByUser(userId: string, limit = 20) {
        logger.debug(
            { userId, limit, action: "findFeedByUser" },
            "[PostService] Find feed for user"
        );
        const safeLimit = Math.min(Math.max(limit, 1), 50);

        return this.postRepo.findFeedByUser(userId, safeLimit);
    }

    async getPostsByAuthor(
        authorId: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PostView>> {
        const sortableFields = new Set(["created_at", "event_id"]);

        const sortField = sort && sortableFields.has(sort.field) ? sort.field : "created_at";
        const sortOrder = sort?.order?.toLowerCase() === "asc" ? "asc" : "desc";
        const normalizedSort: SortOption = {
            field: sortField,
            order: sortOrder,
        };

        const page = Math.max(1, Number(pagination?.page) || 1);
        const limit = Math.max(1, Number(pagination?.limit) || 10);
        const normalizedPagination: Pagination = { page, limit };

        return this.postRepo.findByAuthor(authorId, normalizedPagination, normalizedSort);
    }

    async searchPosts(
        eventId: string,
        keyword: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PostView>> {
        await this.eventRepo.checkExistedAndApprovedEvent(eventId);

        const sortableFields = new Set(["created_at", "author_id"]);

        const sortField = sort && sortableFields.has(sort.field) ? sort.field : "created_at";
        const sortOrder = sort?.order?.toLowerCase() === "asc" ? "asc" : "desc";
        const normalizedSort: SortOption = {
            field: sortField,
            order: sortOrder,
        };

        const page = Math.max(1, Number(pagination?.page) || 1);
        const limit = Math.max(1, Number(pagination?.limit) || 10);
        const normalizedPagination: Pagination = { page, limit };

        return this.postRepo.search(eventId, keyword, normalizedPagination, normalizedSort);
    }

    // ================= Stats =================
    async countPostsByEvent(eventId: string): Promise<number> {
        return this.postRepo.countByEventId(eventId);
    }

    async countPostsByUser(userId: string): Promise<number> {
        return this.postRepo.countByUserId(userId);
    }

    // ================= Utils =================
    async findAuthorId(postId: string) {
        logger.debug(
            { postId, action: "findAuthorId" },
            "[PostService] Fetching author id of this post"
        );
        return this.postRepo.findAuthorId(postId);
    }

    async findEventIdByPostId(postId: string) {
        logger.debug(
            { postId, action: "findEventId" },
            "[PostService] Fetching event id that this post belong to"
        );
        return this.postRepo.findEventIdByPostId(postId);
    }
}

export const postService = new PostService(postRepo, eventRepo);
