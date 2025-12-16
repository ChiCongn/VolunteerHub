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
            `/v1/posts/event/${eventId}`
        );

        // Map để sửa lỗi chính tả từ backend (nếu có)
        // Dùng any tạm thời cho item để tránh lỗi TS khi truy cập field sai
        const items = response.data.items.map((item: any) => ({
            ...item,
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
        const response = await apiClient.post("/v1/posts", data);
        return response.data;
    },
};
