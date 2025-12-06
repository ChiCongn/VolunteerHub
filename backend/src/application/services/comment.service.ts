import { ICommentRepository } from '../../domain/repositories/comment.irepository';
import { Comment } from '../../domain/entities/comment.entity';
import { 
    CreateCommentDto, 
    UpdateCommentDto, 
    CommentView 
} from '../dtos/comment.dto';
import { Pagination } from '../dtos/pagination.dto';
import { SortOption } from '../dtos/sort-option.dto';
import { ListResult } from '../dtos/list-result.dto';
import { commentRepo } from '../../infrastructure/repositories'; 

export class CommentService {
    constructor(private readonly commentRepo: ICommentRepository) {}

    // ================= Core CRUD =================
    async createComment(data: CreateCommentDto): Promise<Comment> {
        // Có thể thêm logic validate authorId hoặc postId tồn tại ở đây nếu cần thiết
        return this.commentRepo.create(data);
    }

    async getCommentById(id: string): Promise<Comment | null> {
        const comment = await this.commentRepo.findById(id);
        if (!comment) {
            throw new Error(`Comment with id ${id} not found`);
        }
        return comment;
    }

    async updateComment(id: string, changes: UpdateCommentDto): Promise<Comment> {
        await this.getCommentById(id);
        return this.commentRepo.update(id, changes);
    }

    async deleteComment(id: string): Promise<void> {
        await this.getCommentById(id);
        return this.commentRepo.delete(id);
    }

    // ================= Public Views =================
    async getCommentsByPost(
        postId: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<CommentView>> {
        return this.commentRepo.findByPostId(postId, pagination, sort);
    }

    // ================= Stats (Optional) =================
    async countCommentsInPost(postId: string): Promise<number> {
        return this.commentRepo.countByPostId(postId);
    }
}

export const commentService = new CommentService(commentRepo);