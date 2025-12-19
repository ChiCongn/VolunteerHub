import { Router } from "express";
import { postController } from "../controllers/posts.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";

export const postRouter = Router();

postRouter.post("/", postController.createPost.bind(postController));
postRouter.get("/feed", authenticate, postController.findFeed);
postRouter.get("/:id", postController.getPostById.bind(postController));
postRouter.put("/:id", postController.updatePost.bind(postController));
postRouter.delete("/:id", postController.deletePost.bind(postController));
postRouter.patch("/:id/restore", postController.restorePost.bind(postController));

postRouter.get("/event/:eventId", postController.getPostsByEvent.bind(postController));
postRouter.get("/event/:eventId/search", postController.searchPosts.bind(postController));
