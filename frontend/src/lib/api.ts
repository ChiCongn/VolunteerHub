const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export async function getPosts() {
    const res = await fetch(`${BACKEND_URL}/posts`);
    return res.json();
}

export async function createPost(content: string) {
    const res = await fetch(`${BACKEND_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
    });
    return res.json();
}

export async function likePost(id: string) {
    await fetch(`${BACKEND_URL}/posts/${id}/like`, { method: "POST" });
}

export async function getEvents() {
    const res = await fetch(`${BACKEND_URL}/events`);
    return res.json();
}
