import { Post } from "../entities/post.entity";
import { CreatePostDto } from "../../application/dtos/post.dto";
import { UpdatePostDto } from "../../application/dtos/post.dto";

import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListResult } from "../../application/dtos/list-result.dto";

export interface IPostRepository {
    create(post: CreatePostDto): Promise<Post>;
    findById(id: string): Promise<Post | null>;
    update(id: string, data: UpdatePostDto): Promise<Post>;
    softDelete(id: string): Promise<void>;
    restore(id: string): Promise<void>;

    findByEventId(
        eventId?: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<Post>>;
    findByUserId(userId?: string, pagination?: Pagination): Promise<ListResult<Post>>;
    search(keyword: string, pagination?: Pagination): Promise<ListResult<Post>>;

    countByEventId(eventId: string): Promise<number>;
    countByUserId(userId: string): Promise<number>;
}
