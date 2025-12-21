import { IReactionRepository } from "../../domain/repositories/reaction.irepository";
import { IPostRepository } from "../../domain/repositories/post.irepository";
import { AddReactionDto, UpdateReactionDto } from "../dtos/reaction.dto";
import {
    ReactionNotFoundError,
    ReactionAlreadyExistsError,
} from "../../domain/errors/reaction.error";
import { PostNotFoundError } from "../../domain/errors/post.error";
import { reactionRepo, postRepo } from "../../infrastructure/repositories";
import { userService } from "./user.service";
import { notificationService } from "./notification.service";
import logger from "../../logger";

export class ReactionService {
    constructor(
        private readonly reactionRepo: IReactionRepository,
        private readonly postRepo: IPostRepository
    ) {}

    async toggleReaction(userId: string, postId: string, emoji: any) {
        const post = await this.postRepo.findById(postId);
        if (!post) throw new PostNotFoundError(postId);

        const existing = await this.reactionRepo.findByUserIdAndPostId(userId, postId);

        if (existing) {
            if (existing.emoji === emoji) {
                await (this.reactionRepo as any).delete(postId, userId);
                return { action: "removed" };
            } else {
                await (this.reactionRepo as any).updateByPostAndUser(postId, userId, { emoji });
                return { action: "updated" };
            }
        }

        const created = await this.reactionRepo.addReaction({ userId, postId, emoji });

        try {
            const postAuthorId = await this.postRepo.findAuthorId(postId);
            const sender = await userService.fetchCurrentUser(userId);

            if (postAuthorId && postAuthorId !== userId && sender) {
                await notificationService.notifyUserInteraction(
                    postAuthorId,
                    sender.username,
                    "đã bày tỏ cảm xúc về bài viết của bạn",
                    postId
                );
            }
        } catch (err) {
            logger.error("[ReactionService] Notification failed", err);
        }

        return { action: "added", data: created };
    }

    async getReactionsByPost(postId: string) {
        const post = await this.postRepo.findById(postId);
        if (!post) throw new PostNotFoundError(postId);

        return this.reactionRepo.findByPostId(postId);
    }
}

export const reactionService = new ReactionService(reactionRepo, postRepo);
