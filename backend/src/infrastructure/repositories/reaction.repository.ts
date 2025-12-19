import { PrismaClient } from "../prisma/generated/client";
import { IReactionRepository } from "../../domain/repositories/reaction.irepository";
import { Reaction } from "../../domain/entities/reaction.entity";
import { AddReactionDto, UpdateReactionDto } from "../../application/dtos/reaction.dto";
import { ListResult } from "../../application/dtos/list-result.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { EmojiType } from "../../domain/entities/enums";

export class ReactionRepository implements IReactionRepository {
    constructor(private readonly prisma: PrismaClient) {}

    private mapToEntity(data: any): Reaction {
        return new Reaction({
            postId: data.post_id,
            authorId: data.user_id,
            emoji: data.reaction as EmojiType
        });
    }

    async addReaction(reaction: AddReactionDto): Promise<Reaction> {
        const created = await this.prisma.reactions.create({
            data: {
                post_id: reaction.postId,
                user_id: reaction.userId,
                reaction: reaction.emoji as any
            }
        });
        return this.mapToEntity(created);
    }

    async findByPostId(postId: string, pagination?: Pagination): Promise<ListResult<Reaction>> {
        const skip = pagination ? (pagination.page - 1) * pagination.limit : 0;
        const take = pagination ? pagination.limit : 10;

        const [items, total] = await Promise.all([
            this.prisma.reactions.findMany({
                where: { post_id: postId },
                skip,
                take,
                orderBy: { created_at: 'desc' }
            }),
            this.prisma.reactions.count({ where: { post_id: postId } })
        ]);

        return {
            items: items.map(this.mapToEntity),
            total,
            page: pagination?.page || 1,
            limit: take
        };
    }

    async findByUserIdAndPostId(userId: string, postId: string): Promise<Reaction | null> {
        const reaction = await this.prisma.reactions.findUnique({
            where: {
                post_id_user_id: { post_id: postId, user_id: userId }
            }
        });
        return reaction ? this.mapToEntity(reaction) : null;
    }

    async countByPostId(postId: string): Promise<number> {
        return this.prisma.reactions.count({ where: { post_id: postId } });
    }

    async update(id: string, data: UpdateReactionDto): Promise<Reaction> {
        // Giả định id ở đây là userId (vì service sẽ gọi theo cặp postId-userId)
        // Hoặc truyền logic cập nhật cụ thể qua service
        throw new Error("Sử dụng phương thức cập nhật theo cặp postId-userId trong Service");
    }

    async updateByPostAndUser(postId: string, userId: string, data: UpdateReactionDto): Promise<Reaction> {
        const updated = await this.prisma.reactions.update({
            where: { post_id_user_id: { post_id: postId, user_id: userId } },
            data: { reaction: data.emoji as any }
        });
        return this.mapToEntity(updated);
    }

    async delete(postId: string, userId: string): Promise<void> {
        await this.prisma.reactions.delete({
            where: { post_id_user_id: { post_id: postId, user_id: userId } }
        });
    }

    // Implement phương thức delete cũ để khớp interface nếu cần
    async deleteById(id: string): Promise<void> {
         throw new Error("Cần postId và userId để xóa");
    }
}