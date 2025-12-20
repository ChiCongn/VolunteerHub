import { Router } from "express";
import { postController } from "../controllers/posts.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";

import { reactionController } from "../controllers/reaction.controller";
import { validate } from "../../middlewares/validation.middleware";
import { AddReactionSchema } from "../validators/reaction/add-reaction.schema";
import { uploadLocal } from "../../infrastructure/config/cloudinary.config";
import { CreatePostSchema } from "../validators/post/create-post.schema";
import { authorize } from "../../middlewares/authorize.middleware";
import { PostPolicy } from "../../application/policies/post.policy";
import { UpdatePostSchema } from "../validators/post/update-post.schema";

export const postRouter = Router();

// postRouter.post(
//     "/",
//     authenticate,
//     validate(CreatePostSchema),
//     //authorize(PostPolicy.participant),
//     postController.createPost.bind(postController)
// );
postRouter.get("/feed", authenticate, postController.findFeed);

postRouter.post(
    "/upload-image",
    authenticate,
    uploadLocal("posts").single("image"),
    postController.uploadPostImage
);

postRouter.get("/:id", authenticate, postController.getPostById.bind(postController));
postRouter.put(
    "/:id",
    authenticate,
    validate(UpdatePostSchema),
    authorize(PostPolicy.editor),
    postController.updatePost.bind(postController)
);
postRouter.delete(
    "/:id",
    authenticate,
    authorize(PostPolicy.editor),
    postController.deletePost.bind(postController)
);
postRouter.patch(
    "/:id/restore",
    authenticate,
    authorize(PostPolicy.editor),
    postController.restorePost.bind(postController)
);

// postRouter.get("/event/:eventId", postController.getPostsByEvent.bind(postController));
// postRouter.get("/event/:eventId/search", postController.searchPosts.bind(postController));

postRouter.post(
    "/:postId/reactions",
    authenticate,
    validate(AddReactionSchema),
    reactionController.handleToggleReaction
);

// Endpoint: GET /posts/:postId/reactions
postRouter.get("/:postId/reactions", authenticate, reactionController.getReactions);
