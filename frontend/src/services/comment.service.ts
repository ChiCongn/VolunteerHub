import { api } from "../lib/axios"; // Sử dụng instance axios đã cấu hình
import type { Comment, CreateCommentDto, UpdateCommentDto } from "../types/comment.type";

// Định nghĩa base URL cho comment (tùy backend của bạn)
const BASE_URL = "/comments"; 

export const commentService = {
    // 1. Lấy danh sách comment theo bài viết
    getByPostId: async (postId: string): Promise<Comment[]> => {
        // Giả sử API endpoint là GET /posts/:id/comments hoặc GET /comments?postId=:id
        // Ở đây mình dùng cấu trúc RESTful chuẩn:
        const response = await api.get<Comment[]>(`${BASE_URL}/post/${postId}`);
        return response.data;
    },

    // 2. Tạo comment mới
    create: async (data: CreateCommentDto): Promise<Comment> => {
        const response = await api.post<Comment>(BASE_URL, data);
        return response.data;
    },

    // 3. Cập nhật comment
    update: async (id: string, data: UpdateCommentDto): Promise<Comment> => {
        const response = await api.put<Comment>(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    // 4. Xóa comment (Soft delete hoặc Hard delete tùy backend)
    delete: async (id: string): Promise<void> => {
        await api.delete(`${BASE_URL}/${id}`);
    }
};