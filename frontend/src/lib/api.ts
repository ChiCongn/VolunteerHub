import type { Post } from "../lib/mockData";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export async function getPosts(): Promise<Post[]> {
    const res = await fetch(`${BACKEND_URL}/posts`);
    return res.json();
}

export async function createPost(content: string): Promise<Post> {
    const res = await fetch(`${BACKEND_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
    }); 
    return res.json();
}

export async function likePost(postId: string): Promise<Post> {
    const res = await fetch(`${BACKEND_URL}/posts/${postId}/like`, {
        method: "PATCH",
    });

    if (!res.ok) throw new Error("Failed to like post");
    return res.json(); // phải trả về Post
}

export async function getEvents() {
    const res = await fetch(`${BACKEND_URL}/events`);
    return res.json();
}
