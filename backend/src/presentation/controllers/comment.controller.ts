import { Request, Response } from "express";
import { CommentService, commentService } from "../../application/services/comment.service";

export class CommentController {
    private commentService: CommentService;

    constructor(commentService: CommentService) {
        this.commentService = commentService;
    }

    // Create Comment
    createComment = async (req: Request, res: Response) => {
        try {
            const { postId, content, authorId } = req.body;

            const result = await this.commentService.createComment({
                postId,
                authorId,
                content,
            });

            return res.status(201).json({
                message: "Comment created successfully",
                data: result,
            });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    };

    // Update Comment
    updateComment = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { content } = req.body; 
            const updated = await this.commentService.updateComment(id, { content });

            return res.status(200).json({
                message: "Comment updated successfully",
                data: updated,
            });
        } catch (error: any) {
            const status = error.message.includes("not found") ? 404 : 400;
            return res.status(status).json({ error: error.message });
        }
    };

    // Delete Comment
    deleteComment = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this.commentService.deleteComment(id);

            return res.status(200).json({
                message: "Comment deleted successfully",
            });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    };

    // Get Comments by Post (Filter & Pagination included)
    getCommentsByPost = async (req: Request, res: Response) => {
        try {
            const { postId } = req.params;
            const { page, size, sortBy, sortOrder } = req.query;

            const pagination = {
                page: Number(page) || 1,
                limit: Number(size) || 10,
            };

            const sort = {
                field: String(sortBy || "createdAt"),
                order: (String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc") as
                    | "asc"
                    | "desc",
            };

            const result = await this.commentService.getCommentsByPost(postId, pagination, sort);

            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    };
}

export const commentController = new CommentController(commentService);
