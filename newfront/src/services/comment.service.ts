import apiClient from "@/lib/api-client";

export interface Comment {
    _id: string;
    content: string;
    postId: string;
    author: {
        _id: string;
        username: string;
        avatarUrl?: string;
        role: string;
    };
    createdAt: string;
    parentId?: string;
}

interface CommentResponse {
    items: {
        id: string;
        content: string;
        author: {
            id: string;
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
        const response = await apiClient.get<CommentResponse>(
            `/comments/post/${postId}`
        );

        const comments = response.data.items.map((item) => ({
            ...item,
            _id: item.id,
            postId: postId,
            author: {
                ...item.author,
                _id: item.author.id,
            },
        }));

        return comments as Comment[];
    },

    createComment: async (data: {
        postId: string;
        content: string;
        authorId: string;
        parentId?: string;
    }) => {
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
