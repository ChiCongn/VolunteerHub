import type { CommentView } from "@/types/comment.type";

export const mockComments: CommentView[] = [
  {
    id: "cmt-001",
    author: {
      id: "user-001",
      username: "Ngiyawn",
      avatarUrl: "https://i.pravatar.cc/150?img=3",
      role: "volunteer",
    },
    content: "This event looks amazing! Definitely joining 🙌",
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: "cmt-002",
    author: {
      id: "user-002",
      username: "John Mark",
      avatarUrl: "https://i.pravatar.cc/150?img=8",
      role: "event_manager",
    },
    content: "Thanks everyone for the interest. See you this weekend!",
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "cmt-003",
    author: {
      id: "admin-001",
      username: "Admin",
      avatarUrl: "https://i.pravatar.cc/150?img=12",
      role: "admin",
    },
    content: "Please keep the discussion respectful.",
    createdAt: new Date(Date.now() - 1000 * 60 * 2),
  },
];
