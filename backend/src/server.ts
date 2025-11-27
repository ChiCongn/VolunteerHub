import express from "express";
import { authRoutes } from "./presentation/routes/auth.routes";

const app = express();
const PORT = 8000;

// Middleware (optional test)
app.use(express.json());

// Simple test route
app.get("/", (req, res) => {
    res.send("🚀 Server is running successfully!");
});

app.use("/api/v1/auth", authRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server started on http://localhost:${PORT}`);
    console.log(`→ API: http://localhost:${PORT}/api/v1/auth/login`);
});
