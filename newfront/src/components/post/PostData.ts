export type PostFeedView = {
    id: string;
    author: {
        id: string;
        name: string;
        avatar: string;
    };
    content: string;
    image?: string;
    createdAt: Date;
    likeCount: number;
    commentCount: number;
};

export const mockPosts: PostFeedView[] = [
    {
        id: "post-001",
        author: {
            id: "user-001",
            name: "Ngiyawn",
            avatar: "https://i.pravatar.cc/150?img=3",
        },
        content:
            "When you want to study law but you realize you've got more potential as the criminal 😼",
        image: "https://images.unsplash.com/photo-1595433562696-19b8a1b6f4a2?q=80&w=1200",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        likeCount: 1240,
        commentCount: 326,
    },
    {
        id: "post-002",
        author: {
            id: "user-002",
            name: "John Mark",
            avatar: "https://i.pravatar.cc/150?img=8",
        },
        content:
            "Sometimes you have to break the rules to understand how the system really works.",
        image: "https://images.unsplash.com/photo-1507149833265-60c372daea22?q=80&w=1200",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        likeCount: 532,
        commentCount: 98,
    },
    {
        id: "post-003",
        author: {
            id: "user-003",
            name: "Bella Carter",
            avatar: "https://i.pravatar.cc/150?img=12",
        },
        content:
            "Why choose one path when you can explore both? Learning never stops.",
        createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        likeCount: 87,
        commentCount: 12,
    },
];
