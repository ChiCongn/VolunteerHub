import { ListResult } from "../../application/dtos/list-result.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { AddReactionDto, UpdateReactionDto } from "../../application/dtos/reaction.dto";
import { Reaction } from "../entities/reaction.entity";

export interface IReactionRepository {
    addReaction(reaction: AddReactionDto): Promise<Reaction>;
    findByPostId(postId: string, pagination?: Pagination): Promise<ListResult<Reaction> | null>;
    findByUserIdAndPostId(userId: string, postId: string): Promise<Reaction | null>;
    countByPostId(postId: string): Promise<number>;
    update(id: string, data: UpdateReactionDto): Promise<Reaction>;
    delete(id: string): Promise<void>;
}
