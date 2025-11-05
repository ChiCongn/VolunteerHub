import { Comment } from "../entities/comment.entity";
import { CreateCommentDto, UpdateCommentDto } from "../../application/dtos/comment.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { ListResult } from "../../application/dtos/list-result.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";

export interface ICommentRepository {
    create(comment: CreateCommentDto): Promise<Comment>;
    findById(id: string): Promise<Comment>;
    update(id: string, data: UpdateCommentDto): Promise<Comment>;
    softDelete(id: string): Promise<void>;
    restore(id: string): Promise<void>;

    findByPostId(
        postId: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<Comment>>;
    countByPostId(postId: string): Promise<number>;
}
