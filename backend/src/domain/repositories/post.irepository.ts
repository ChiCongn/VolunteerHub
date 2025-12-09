import { Post } from "../entities/post.entity";
import { 
    CreatePostDto, 
    UpdatePostDto,
    PostView
} from "../../application/dtos/post.dto";

import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListResult } from "../../application/dtos/list-result.dto";

export interface IPostRepository {
    // Core CRUD
    create(post: CreatePostDto): Promise<Post>;
    findById(id: string): Promise<Post>;
    update(id: string, changes: UpdatePostDto): Promise<Post>;
    softDelete(id: string): Promise<void>;
    restore(id: string): Promise<void>;

    // Public view
    findByEventId(
        eventId: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PostView>>;

    findByAuthor(
        authorId: string, 
        pagination?: Pagination, 
        sort?: SortOption
    ): Promise<ListResult<PostView>>;

    // Search by keyword
    search(
        eventId: string,
        keyword: string,
        pagination?: Pagination, 
        sort?: SortOption
    ): Promise<ListResult<PostView>>;

    // Stats
    countByEventId(eventId: string): Promise<number>;
    countByUserId(userId: string): Promise<number>;
}
