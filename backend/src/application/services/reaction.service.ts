import { IReactionRepository } from "../../domain/repositories/reaction.irepository";
import { IPostRepository } from "../../domain/repositories/post.irepository";
import { AddReactionDto, UpdateReactionDto } from "../dtos/reaction.dto";
import { ReactionNotFoundError, ReactionAlreadyExistsError } from "../../domain/errors/reaction.error";
import { PostNotFoundError } from "../../domain/errors/post.error";
import { reactionRepo, postRepo } from "../../infrastructure/repositories";

export class ReactionService {
    constructor(
        private readonly reactionRepo: IReactionRepository,
        private readonly postRepo: IPostRepository
    ) {}

    async toggleReaction(userId: string, postId: string, emoji: any) {
        // 1. Kiểm tra post tồn tại
        const post = await this.postRepo.findById(postId);
        if (!post) throw new PostNotFoundError(postId);

        // 2. Kiểm tra reaction đã tồn tại chưa
        const existing = await this.reactionRepo.findByUserIdAndPostId(userId, postId);

        if (existing) {
            if (existing.emoji === emoji) {
                // Nếu cùng emoji thì xóa (Unlike/Remove reaction)
                await (this.reactionRepo as any).delete(postId, userId);
                return { action: "removed" };
            } else {
                // Nếu khác emoji thì cập nhật
                const updated = await (this.reactionRepo as any).updateByPostAndUser(postId, userId, { emoji });
                return { action: "updated", data: updated };
            }
        }

        // 3. Thêm mới
        const created = await this.reactionRepo.addReaction({ userId, postId, emoji });
        return { action: "added", data: created };
    }

    async getReactionsByPost(postId: string) {
        const post = await this.postRepo.findById(postId);
        if (!post) throw new PostNotFoundError(postId);
        
        return this.reactionRepo.findByPostId(postId);
    }
}

export const reactionService = new ReactionService(reactionRepo, postRepo);