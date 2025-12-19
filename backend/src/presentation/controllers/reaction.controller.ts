// backend/src/presentation/controllers/reaction.controller.ts
import { Request, Response } from "express";
import { reactionService } from "../../application/services/reaction.service";

export class ReactionController {
    async handleToggleReaction(req: Request, res: Response) {
        try {
            //const userId = req.user.sub; // Lấy từ middleware authenticate
            const userId = "52778341-f7a8-4a68-957c-8fe6364e3f2b";
            const { postId } = req.params;
            const { emoji } = req.body;

            const result = await reactionService.toggleReaction(userId, postId, emoji);

            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async getReactions(req: Request, res: Response) {
        try {
            const { postId } = req.params;
            const reactions = await reactionService.getReactionsByPost(postId);
            return res.status(200).json(reactions);
        } catch (error: any) {
            return res.status(404).json({ error: error.message });
        }
    }
}

export const reactionController = new ReactionController();
