import express, { Request, Response, NextFunction } from "express";
import { authRouter } from "./presentation/routes/auth.routes";
import { userRouter } from "./presentation/routes/user.route";
import { eventRouter } from "./presentation/routes/event.route";

import { PrismaClient } from "./infrastructure/prisma/generated/client";

import { UserRepository } from "./infrastructure/repositories/user.repository";
import { EventRepository } from "./infrastructure/repositories/event.repository";
import { PostRepository } from "./infrastructure/repositories/post.repository";

import { PostService } from "./application/services/post.service";
import { PostsController } from "./presentation/controllers/posts.controller";
import { createPostRoutes } from "./presentation/routes/posts.routes";

const app = express();
const PORT = 8000;

// Middleware
const prisma = new PrismaClient();

// Build repositories
const userRepo = new UserRepository(prisma);
const eventRepo = new EventRepository(prisma, userRepo);
const postRepo = new PostRepository(prisma, eventRepo, userRepo);

// Build service
const postService = new PostService(postRepo);

// Build controller
const postsController = new PostsController(postService);

// Build injected routes
const postRoutes = createPostRoutes(postsController);

app.use(express.json());

// Test
app.get("/", (req, res) => {
    res.send("🚀 Server is running successfully!");
});

// Mount event routes
app.use("/api/events", eventRouter);
// API routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

// Global error handler (must be last)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("💥 Error:", err);
    return res.status(500).json({ message: "Internal server error" });
});
// Auth
app.use("/api/v1/auth", authRouter);

// Posts (correct)
app.use("/api/v1/posts", postRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server started on http://localhost:${PORT}`);
});

export { app };
