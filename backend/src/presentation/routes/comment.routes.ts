import { Router } from "express";
import { commentController } from "../controllers/comment.controller";

export const commentRouter = Router();

// Create new comment
commentRouter.post("/", commentController.createComment.bind(commentController));

// Update & Delete specific comment by ID
commentRouter.put("/:id", commentController.updateComment.bind(commentController));
commentRouter.delete("/:id", commentController.deleteComment.bind(commentController));

// Get all comments of a specific Post
commentRouter.get("/post/:postId", commentController.getCommentsByPost.bind(commentController));