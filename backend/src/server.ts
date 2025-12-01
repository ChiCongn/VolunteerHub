import "dotenv/config";
import express from "express";
import pool from "./infrastructure/database/pool";
import eventRouter from "./presentation/routes/event.route";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;

// Middleware
app.use(express.json());

// Mock auth middleware for development/testing
if (process.env.USE_MOCK_AUTH === "true") {
    app.use((req, res, next) => {
        // Gán mock user vào req để test
        (req as any).user = {
            id: "070af172-fd68-480b-895a-72b801ccb2b3", // Mock user ID
            email: "test@example.com",
            role: "admin",
            status: "active",
        };
        next();
    });
}

// Test route
app.get("/", (req, res) => {
    res.send("🚀 Server is running successfully!");
});

// Mount event routes
app.use("/api/events", eventRouter);

// Start server
app.listen(PORT, async () => {
    console.log(`✅ Server started on http://localhost:${PORT}`);

    try {
        console.log("⏳ Đang thử kết nối database...");
        const client = await pool.connect(); // Thử tạo một kết nối
        console.log("🎉 Kết nối Database thành công!"); // Log bạn cần tìm
        client.release(); // Trả kết nối về pool
    } catch (err) {
        console.error("❌ Lỗi kết nối Database:", err);
    }
});
