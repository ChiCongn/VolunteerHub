// services/comment.service.ts
import apiClient from "@/lib/api-client";

export interface Comment {
    _id: string; // Frontend dùng _id
    content: string;
    postId: string;
    author: {
        _id: string; // Frontend dùng _id
        username: string;
        avatarUrl?: string;
        role?: string;
    };
    createdAt: string;
    parentId?: string;
}

// Interface định nghĩa response trả về từ Backend (khớp với JSON bạn cung cấp)
interface CommentResponse {
    items: {
        id: string; // Backend trả về id
        content: string;
        author: {
            id: string; // Backend trả về id
            username: string;
            avatarUrl: string;
            role: string;
        };
        createdAt: string;
    }[];
    total: number;
    page: number;
    limit: number;
}

export const commentService = {
    getCommentsByPost: async (postId: string) => {
        // Gọi API
        const response = await apiClient.get<CommentResponse>(
            `/comments/post/${postId}`
        );

        // --- XỬ LÝ DỮ LIỆU ---
        // 1. Lấy mảng từ .items (vì backend trả về dạng phân trang)
        // 2. Map để đổi 'id' thành '_id' cho đúng với Component

        const comments = response.data.items.map((item) => ({
            ...item,
            _id: item.id, // Map id -> _id
            postId: postId, // <--- THÊM DÒNG NÀY: Lấy từ tham số hàm bỏ vào
            author: {
                ...item.author,
                _id: item.author.id, // Map author.id -> author._id
            },
        }));

        return comments as Comment[];
    },

    // createComment: async (data: {
    //     postId: string;
    //     content: string;
    //     parentId?: string;
    // }) => {
    //     const response = await apiClient.post("/comments", data);
    //     const newItem = response.data;

    //     return {
    //         ...newItem,
    //         _id: newItem.id || newItem._id,
    //         // Đảm bảo có postId, nếu backend không trả về thì lấy từ data gửi đi
    //         postId: newItem.postId || data.postId,
    //         author: {
    //             ...newItem.author,
    //             _id: newItem.author?.id || newItem.author?._id,
    //         },
    //     } as Comment;
    // },

    createComment: async (data: {
        postId: string;
        content: string;
        authorId: string; // <--- Add this
        parentId?: string;
    }) => {
        // The 'data' object now includes authorId
        const response = await apiClient.post("/comments", data);
        const newItem = response.data;

        return {
            ...newItem,
            _id: newItem.id || newItem._id,
            postId: newItem.postId || data.postId,
            author: {
                ...newItem.author,
                _id: newItem.author?.id || newItem.author?._id,
            },
        } as Comment;
    },
};
