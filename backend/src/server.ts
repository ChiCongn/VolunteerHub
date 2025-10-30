import express from "express";

const app = express();
const PORT = 8000;

// Middleware (optional test)
app.use(express.json());

// Simple test route
app.get("/", (req, res) => {
    res.send("🚀 Server is running successfully!");
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server started on http://localhost:${PORT}`);
});
