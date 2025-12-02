import express, { Request, Response, NextFunction } from "express";
import { authRouter } from "./presentation/routes/auth.routes";
import { userRouter } from "./presentation/routes/user.route";
import { eventRouter } from "./presentation/routes/event.route";

const app = express();
const PORT = 8000;

// Middleware
app.use(express.json());

// Simple test route
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

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server started on http://localhost:${PORT}`);
});

export { app };
