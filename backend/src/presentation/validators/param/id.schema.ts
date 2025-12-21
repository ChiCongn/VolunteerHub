import { z } from "zod";

export const UserIdSchema = z.string().uuid("Invalid user ID");
export const EventIdSchema = z.string().uuid("Invalid event ID");
export const RegistrationIdSchema = z.string().uuid("Invalid registration ID");
export const PostIdSchema = z.string().uuid("Invalid post ID");
export const CommentIdSchema = z.string().uuid("Invalid comment ID");
export const ReactionIdSchema = z.string().uuid("Invalid reaction ID");
export const ReportIdsSchema = z.string().uuid("Invalid report ID");
export const NotificationIdsSchema = z.string().uuid("Invalid notification ID");

