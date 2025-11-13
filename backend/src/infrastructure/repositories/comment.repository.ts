import { CommentView, CreateCommentDto, UpdateCommentDto } from "../../application/dtos/comment.dto";
import { ICommentRepository } from "../../domain/repositories/comment.irepository";
import { Comment } from "../../domain/entities/comment.entity";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListResult } from "../../application/dtos/list-result.dto";


export class CommentRepository implements ICommentRepository {
    // Core CRUD
    async create(comment: CreateCommentDto): Promise<Comment> {
        // Implementation here
        return {} as Comment;
    }
    async findById(id: string): Promise<Comment> {
        // Implementation here
        return {} as Comment;
    }
    async update(id: string, changes: UpdateCommentDto): Promise<Comment> {
        // Implementation here
        return {} as any;
    }
    async delete(id: string): Promise<void> {
        // Implementation here
    }

    // Public view
    async findByPostId(
        postId: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<CommentView>> {
        // Implementation here
        return {} as any;
    }

    async countByPostId(postId: string): Promise<number> {
        // Implementation here
        return 0;
    }
}