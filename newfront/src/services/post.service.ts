import apiClient from "@/lib/api-client";
import type { Post } from "@/types";

// Định nghĩa response type cho API list
interface PostListResponse {
    items: Post[];
    total: number;
    page: number;
    limit: number;
}

export const postService = {
    getPostsByEvent: async (eventId: string) => {
        const response = await apiClient.get<PostListResponse>(
            `/posts/event/${eventId}`
        );

        // Dùng any tạm thời cho item để tránh lỗi TS khi truy cập field sai
        const items = response.data.items.map((item: any) => ({
            ...item,
            _id: item._id || item.id,
            createdAt:
                item.createdAt || item.createddAt || new Date().toISOString(),
        }));

        return items as Post[];
    },

    // POST /api/v1/posts
    createPost: async (data: {
        eventId: string;
        content: string;
        imageUrl?: string;
    }) => {
        const response = await apiClient.post("/posts", data);
        return response.data;
    },

    // GET /api/v1/posts/:id
    getPostById: async (id: string) => {
        const response = await apiClient.get(`/posts/${id}`);

        // 1. Lấy đúng object từ lớp vỏ "data"
        const rawData = response.data.data;

        // 2. Map dữ liệu thủ công (Mapping)
        const mappedPost = {
            _id: rawData.id,

            content: rawData._content,
            imageUrl: rawData._imageUrl,
            createdAt: rawData._createdAt,

            // Map Likes (Nếu backend chưa có thì gán mặc định 0)
            likes: [],
            commentsCount: 0,

            // 3. Xử lý Author (Backend chỉ trả về authorId -> Tạo object giả)
            author: {
                _id: rawData.authorId,
                username: "User ", // Fake tên tạm thời
                avatarUrl: "https://github.com/shadcn.png", // Fake avatar
                role: "member",
            },

            // 4. Xử lý Event (Backend chỉ trả về eventId -> Tạo object giả)
            event: {
                _id: rawData.eventId,
                name: "Event ID: " + rawData.eventId.slice(0, 6), // Fake tên event
                description: "Loading description...",
            },
        };

        return mappedPost as unknown as Post;
    },
};
