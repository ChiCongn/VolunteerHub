import { IPostRepository } from '../../domain/repositories/post.irepository';
import { PrismaClient } from '../prisma/generated/client';
import { Post } from '../../domain/entities/post.entity';
import {
    CreatePostDto,
    UpdatePostDto,
    PostView
} from '../../application/dtos/post.dto';
import { Pagination } from '../../application/dtos/pagination.dto';
import { SortOption } from '../../application/dtos/sort-option.dto';
import { ListResult } from '../../application/dtos/list-result.dto';

export class PostRepository implements IPostRepository {
    constructor(private readonly prisma: PrismaClient) { }

    // Core CRUD
    async create(post: CreatePostDto): Promise<Post> {
        return null;
    }
    async findById(id: string): Promise<Post | null> {
        return null;    
    }
    async update(id: string, changes: UpdatePostDto): Promise<Post> {
        return null;
    }
    async softDelete(id: string): Promise<void> {
        return Promise.resolve();
    }

    async restore(id: string): Promise<void> {
        return Promise.resolve();
    }

    // Public view
    async findByEventId(
        eventId?: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PostView>> {
        
    }

    async findByAuthor(
        authorId: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PostView>> {

    }

    // Search by keyword
    async search(
        keyword: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PostView>> {

    }

    // Stats
    async countByEventId(eventId: string): Promise<number> {

    }
    async countByUserId(userId: string): Promise<number> {
        
    }
}
