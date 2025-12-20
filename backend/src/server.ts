import express, { Request, Response, NextFunction } from "express";
import { authRouter } from "./presentation/routes/auth.routes";
import { userRouter } from "./presentation/routes/user.route";
import { eventRouter } from "./presentation/routes/event.route";
import { postRouter } from "./presentation/routes/posts.routes";
import { commentRouter } from "./presentation/routes/comment.routes";

import cors from "cors";
import { statsRouter } from "./presentation/routes/stats.routes";
import { registrationRouter } from "./presentation/routes/registration.routes";
import { notificationRouter } from "./presentation/routes/notification.route";

import path from "path";
import multer from 'multer';
import { notificationRouter } from "./presentation/routes/notification.route";

const app = express();
const PORT = 8000;

app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    })
);

// Test
app.get("/", (req, res) => {
    res.send("🚀 Server is running successfully!");
});
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// Mount event routes
app.use("/api/v1/events", eventRouter);
// API routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/stats", statsRouter);
app.use("/api/v1/registrations", registrationRouter);
app.use("/api/v1/notifications", notificationRouter)

// Global error handler (must be last)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    // Handle Multer/File Filter Errors
    if (err instanceof multer.MulterError || err.message.includes("formats are allowed")) {
        return res.status(400).json({
            message: err.message,
        });
    }

    // Handle Zod Validation Errors
    if (err.name === "ZodError") {
        return res.status(400).json({
            message: "Bad Request! Validation failed",
            errors: err.message,
        });
    }
    console.error("💥 Error:", err);
    return res.status(500).json({ message: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server started on http://localhost:${PORT}`);
});

export { app };
