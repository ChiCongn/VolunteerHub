import prisma from "../prisma/client";
import { CommentRepository } from "./comment.repository";
import { EventRepository } from "./event.repository";
import { NotificationRepository } from "./notificatiion.repository";
import { PostRepository } from "./post.repository";
import { RefreshTokenRepository } from "./refresh-token.repository";
import { StatsRepository } from "./stats.repository";
import { UserRepository } from "./user.repository";

console.log('export all repo');
export const userRepo = new UserRepository(prisma);
export const eventRepo = new EventRepository(prisma, userRepo);
export const postRepo = new PostRepository(prisma, eventRepo, userRepo);
export const commentRepo = new CommentRepository(prisma, userRepo, postRepo);
export const notificationRepo = new NotificationRepository(prisma);
export const refreshRepo = new RefreshTokenRepository(prisma);
export const statsRepo = new StatsRepository(prisma);