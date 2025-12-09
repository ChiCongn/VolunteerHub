import express, { Request, Response, NextFunction } from "express";
import { authRouter } from "./presentation/routes/auth.routes";
import { userRouter } from "./presentation/routes/user.route";
import { eventRouter } from "./presentation/routes/event.route";
import { postRouter } from "./presentation/routes/posts.routes";
import { commentRouter } from "./presentation/routes/comment.routes";

import cors from "cors";

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

// Mount event routes
app.use("/api/events", eventRouter);
// API routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);

// Global error handler (must be last)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("💥 Error:", err);
    return res.status(500).json({ message: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server started on http://localhost:${PORT}`);
});

export { app };
