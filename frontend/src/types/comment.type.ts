//import { User } from "../lib/mockData"; // Hoặc import từ types/user.ts nếu đã có

// DTO cho việc hiển thị (View Model)
export interface Comment {
    id: string;
    content: string;
    postId: string;
    authorId: string;
    // Backend nên trả về object author đã được populate để hiển thị UI
    author?: {
        id: string;
        name: string;
        avatar: string;
    };
    createdAt: string; // ISO String
    updatedAt?: string;
}

// DTO cho việc tạo mới (Data Transfer Object)
export interface CreateCommentDto {
    content: string;
    postId: string;
}

// DTO cho việc cập nhật
export interface UpdateCommentDto {
    content: string;
}
