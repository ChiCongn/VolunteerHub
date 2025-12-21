export const STORAGE_KEYS = {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
} as const;

// newfront/src/lib/constants.ts hoặc ngay trong file PostActions
export const EMOJIS = [
    { id: "like", label: "Like", icon: "👍", color: "text-blue-500" },
    { id: "haha", label: "Haha", icon: "😆", color: "text-yellow-500" },
    { id: "wow", label: "Wow", icon: "😮", color: "text-yellow-500" },
    { id: "sad", label: "Sad", icon: "😢", color: "text-yellow-500" },
    { id: "angry", label: "Angry", icon: "😡", color: "text-red-500" },
];
