import apiClient from "@/lib/api-client";
import { type ListResult } from "@/types/paging";
import type { Post } from "@/types/post.type";

export const postService = {
    // POST /api/v1/posts
    // TODO: remove authorId
    createPost: async (data: {
        eventId: string;
        content: string;
        imageUrl?: string;
    }) => {
        const response = await apiClient.post(`/events/${data.eventId}/posts`, data);
        return response.data;
    },

    // GET /api/v1/posts/:id
    getPostById: async (id: string) => {
        const response = await apiClient.get(`/posts/${id}`);

        const rawData = response.data.data;

        const mappedPost = {
            _id: rawData.id,

            content: rawData._content,
            imageUrl: rawData._imageUrl,
            createdAt: rawData._createdAt,
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

    // TODO: Implement infinite scrolling (pagination).
    // Load the next batch of posts when the user reaches the end of the current list
    // to avoid loading all posts at once.
    async getPostsByEvent(eventId: string) {
        const { data } = await apiClient.get<ListResult<Post>>(
            `/events/${eventId}/posts`
        );
        return data;
    },

    // TODO: Implement infinite scrolling (pagination).
    // Load the next batch of posts when the user reaches the end of the current list
    // to avoid loading all posts at once.
    async getFeedPosts() {
        const { data } = await apiClient.get<Post[]>("/posts/feed");
        return data;
    },

    async searchPostInEvent(eventId: string, keyword: string) {
        const { data } = await apiClient.get<ListResult<Post>>(
            `/events/${eventId}/search`,
            {
                params: {
                    keyword,
                },
            }
        );
        return data;
    },

    async restorePost(postId: string) {
        await apiClient.patch(`/posts/${postId}/restore`);
    },

    async deletePost(postId: string) {
        await apiClient.delete(`/posts/${postId}`);
    },

    async updatedPost(
        postId: string,
        newContent?: string,
        newImageUrl?: string
    ) {
        // Validate that at least one field is provided
        if (newContent === undefined && newImageUrl === undefined) {
            throw new Error(
                "At least one field (content or image) must be provided."
            );
        }

        // Validate content length if it is being updated
        if (newContent !== undefined && newContent.trim().length <= 1) {
            throw new Error("Content must be longer than 1 character.");
        }

        // Perform the PATCH request
        // We only include properties that are defined
        const { data } = await apiClient.patch<Post>(`/posts/${postId}`, {
            ...(newContent !== undefined && { content: newContent }),
            ...(newImageUrl !== undefined && { imageUrl: newImageUrl }),
        });
        return data;
    },

    toggleReaction: async (postId: string, emoji: string) => {
        const response = await apiClient.post(`/posts/${postId}/reactions`, {
            postId,
            emoji,
        });
        return response.data;
    },

    getReactions: async (postId: string) => {
        const response = await apiClient.get(`/posts/${postId}/reactions`);
        return response.data; // Giả định trả về { items: Reaction[], total: number }
    },
};
