import { Comment } from "../entities/comment.entity";
import { 
    CreateCommentDto, 
    UpdateCommentDto,
    CommentView 
} from "../../application/dtos/comment.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { ListResult } from "../../application/dtos/list-result.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";

export interface ICommentRepository {
    // Core CRUD
    create(comment: CreateCommentDto): Promise<Comment>;
    findById(id: string): Promise<Comment | null>;
    update(id: string, changes: UpdateCommentDto): Promise<Comment>;
    delete(id: string): Promise<void>;

    // Public view
    findByPostId(
        postId: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<CommentView>>;

    countByPostId(postId: string): Promise<number>;
}
