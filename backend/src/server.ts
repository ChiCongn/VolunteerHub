import express from "express";
import { authRoutes } from "./presentation/routes/auth.routes";
import { PrismaClient } from "./infrastructure/prisma/generated/client";

import { UserRepository } from "./infrastructure/repositories/user.repository";
import { EventRepository } from "./infrastructure/repositories/event.repository";
import { PostRepository } from "./infrastructure/repositories/post.repository";

import { PostService } from "./application/services/post.service";
import { PostsController } from "./presentation/controllers/posts.controller";
import { createPostRoutes } from "./presentation/routes/posts.routes";

const app = express();
const PORT = 8000;

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

// Auth
app.use("/api/v1/auth", authRoutes);

// Posts (correct)
app.use("/api/v1/posts", postRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`➡ Server: http://localhost:${PORT}`);
});
