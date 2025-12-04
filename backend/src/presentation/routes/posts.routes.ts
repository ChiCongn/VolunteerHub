import { Router } from "express";
import { PostsController } from "../controllers/posts.controller";

export function createPostRoutes(controller: PostsController) {
    const router = Router();

    router.post("/", controller.createPost.bind(controller));
    router.get("/:id", controller.getPostById.bind(controller));
    router.put("/:id", controller.updatePost.bind(controller));
    router.delete("/:id", controller.deletePost.bind(controller));
    router.patch("/:id/restore", controller.restorePost.bind(controller));

    router.get("/event/:eventId", controller.getPostsByEvent.bind(controller));
    router.get("/event/:eventId/search", controller.searchPosts.bind(controller));

    return router;
}
