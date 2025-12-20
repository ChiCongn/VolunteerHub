import { Request, Response } from "express";
import { postService, PostService } from "../../application/services/post.service";
import logger from "../../logger";

export class PostsController {
    private postService: PostService;

    constructor(postService: PostService) {
        this.postService = postService;
    }

    //req.user.sub

    // Create Post
    createPost = async (req: Request, res: Response) => {
        try {
            const result = await this.postService.createPost(req.body);
            return res.status(201).json({
                message: "Post created successfully",
                data: result,
            });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    };

    uploadPostImage = async (req: Request, res: Response) => {
        const userId = req.user?.sub;
        const file = req.file as Express.Multer.File;

        logger.info({ userId, action: "uploadPostImage" }, "[PostController] Uploading post image");

        try {
            if (!file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            return res.status(200).json({
                url: file.path,
            });
        } catch (err: any) {
            logger.error(
                { userId, error: err.message },
                "[PostController] Post image upload failed"
            );
            return res.status(500).json({ message: "Upload failed" });
        }
    };

    // Get post by ID
    getPostById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const post = await this.postService.getPostById(id);

            return res.status(200).json({ data: post });
        } catch (error: any) {
            return res.status(404).json({ error: error.message });
        }
    };

    // Update Post
    updatePost = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updated = await this.postService.updatePost(id, req.body);

            return res.status(200).json({
                message: "Post updated successfully",
                data: updated,
            });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    };

    // Soft Delete
    deletePost = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this.postService.softDeletePost(id);

            return res.status(200).json({
                message: "Post deleted successfully",
            });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    };

    // Restore
    restorePost = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this.postService.restorePost(id);

            return res.status(200).json({
                message: "Post restored successfully",
            });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    };

    // Get posts in an event
    getPostsByEvent = async (req: Request, res: Response) => {
        const { eventId } = req.params;

        const { page, size, sortBy, sortOrder } = req.query;
        logger.info(
            { eventId, page, size, sortBy, sortOrder, action: "getPostsByEvent" },
            "[PostController] Fetching posts by event"
        );
        try {
            const posts = await this.postService.getPostsByEvent(eventId);

            return res.status(200).json(posts);
        } catch (error) {
            logger.error({ eventId, error }, "[PostController] Failed to fetch posts");
            return res.status(500).json({ message: "Failed to fetch posts" });
        }
    };

    findFeed = async (req: Request, res: Response) => {
        try {
            const userId = req.user.sub;
            const posts = await this.postService.findFeedByUser(userId);
            return res.status(200).json(posts);
        } catch (error: any) {
            logger.error({ error }, "[PostController] Find feed posts");
            return res.status(400).json({ error: error.message });
        }
    };

    // Search
    searchPosts = async (req: Request, res: Response) => {
        try {
            const { eventId } = req.params;
            const { q } = req.query;

            const posts = await this.postService.searchPosts(eventId, q as string);

            return res.status(200).json(posts);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    };
}

export const postController = new PostsController(postService);
