import { IPostRepository } from "../../domain/repositories/post.irepository";
import { postRepo } from "../../infrastructure/repositories";
import logger from "../../logger";

export class PostService {
    constructor(private readonly postRepo: IPostRepository) {}

    async findAuthorId(postId: string) {
        logger.debug(
            { postId, action: "findAuthorId" },
            "[PostService] Fetching author id of this post"
        );
        return this.postRepo.findAuthorId(postId);
    }

    async findEventIdByPostId(postId: string) {
        logger.debug(
            { postId, action: "findEventId" },
            "[PostService] Fetching event id that this post belong to"
        );
        return this.postRepo.findEventIdByPostId(postId);
    }
}

export const postService = new PostService(postRepo);
