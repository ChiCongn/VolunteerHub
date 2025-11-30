import express, { Request, Response, NextFunction } from "express";
import { authRoutes } from "./presentation/routes/auth.routes";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());

// Health check / base route
app.get("/", (_req: Request, res: Response) => {
  res.send("🚀 Server is running successfully!");
});

// API routes
app.use("/api/v1/auth", authRoutes);

// Global error handler (must be last)
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("💥 Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
  console.log(`→ API: http://localhost:${PORT}/api/v1/auth/login`);
});

export { app };
