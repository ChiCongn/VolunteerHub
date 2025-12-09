import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import type { Post } from "../lib/mockData";
import { getUserById } from "../lib/mockData";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";

interface PostCardProps {
    post: Post;
    onLike?: (postId: string) => void;
    onComment?: (postId: string) => void;
}

export function PostCard({ post, onLike, onComment }: PostCardProps) {
    const author = getUserById(post.authorId);
    const [isLiked, setIsLiked] = useState(false);
    const [localLikes, setLocalLikes] = useState(post.likes);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLocalLikes(isLiked ? localLikes - 1 : localLikes + 1);
        onLike?.(post.id);
    };

    const timeAgo = (timestamp: string) => {
        const now = new Date();
        const postTime = new Date(timestamp);
        const diffInHours = Math.floor(
            (now.getTime() - postTime.getTime()) / (1000 * 60 * 60)
        );

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return "Yesterday";
        return `${diffInDays}d ago`;
    };

    if (!author) return null;

    return (
        <div className="bg-card rounded-lg border border-border shadow-sm p-4 space-y-3 animate-fade-in">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={author.avatar} alt={author.name} />
                        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium">{author.name}</p>
                            {post.type === "announcement" && (
                                <Badge variant="secondary" className="text-xs">
                                    Announcement
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {timeAgo(post.timestamp)}
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </div>

            <div className="space-y-3">
                <p className="whitespace-pre-wrap">{post.content}</p>

                {post.image && (
                    <div className="rounded-lg overflow-hidden">
                        <ImageWithFallback
                            src={post.image}
                            alt="Post image"
                            className="w-full h-auto max-h-96 object-cover"
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 ${isLiked ? "text-[#F44336]" : ""}`}
                        onClick={handleLike}
                    >
                        <Heart
                            className={`w-4 h-4 ${
                                isLiked ? "fill-current" : ""
                            }`}
                        />
                        <span>{localLikes}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => onComment?.(post.id)}
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments.length}</span>
                    </Button>
                </div>

                <Button variant="ghost" size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                </Button>
            </div>

            {post.comments.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border">
                    {post.comments.slice(0, 2).map((comment) => {
                        const commentAuthor = getUserById(comment.authorId);
                        if (!commentAuthor) return null;

                        return (
                            <div key={comment.id} className="flex gap-2">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage
                                        src={commentAuthor.avatar}
                                        alt={commentAuthor.name}
                                    />
                                    <AvatarFallback>
                                        {commentAuthor.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-muted rounded-lg p-2">
                                    <p className="text-sm font-medium">
                                        {commentAuthor.name}
                                    </p>
                                    <p className="text-sm">{comment.content}</p>
                                </div>
                            </div>
                        );
                    })}

                    {post.comments.length > 2 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary"
                            onClick={() => onComment?.(post.id)}
                        >
                            View all {post.comments.length} comments
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

// import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
// import { Button } from "./ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { Badge } from "./ui/badge";
// import { ImageWithFallback } from "./figma/ImageWithFallback";
// import { useState } from "react";
// import type { Post } from "../lib/mockData";
// import { getUserById } from "../lib/mockData";
// import { CommentSection } from "./CommentSection";

// interface PostCardProps {
//     post: Post;
//     isPreview?: boolean; // Biến cờ quan trọng
//     onLike?: (postId: string) => void;
//     // onComment?: ... bỏ đi hoặc giữ lại để handle focus
// }

// export function PostCard({ post, isPreview = false, onLike }: PostCardProps) {
//     const author = getUserById(post.authorId);
//     const [isLiked, setIsLiked] = useState(false);
//     const [localLikes, setLocalLikes] = useState(post.likes);

//     const handleLike = (e: React.MouseEvent) => {
//         e.stopPropagation();
//         setIsLiked(!isLiked);
//         setLocalLikes(isLiked ? localLikes - 1 : localLikes + 1);
//         onLike?.(post.id);
//     };

//     // Hàm helper tính thời gian
//     const timeAgo = (timestamp: string) => {
//         /* logic cũ */ return "2h ago";
//     };

//     if (!author) return null;

//     return (
//         <div
//             className={`bg-card rounded-lg border border-border shadow-sm p-4 space-y-3 transition-colors ${
//                 isPreview ? "hover:bg-accent/50" : ""
//             }`}
//         >
//             {/* HEADER & CONTENT GIỮ NGUYÊN */}
//             <div className="flex items-start justify-between">
//                 {/* ... Render Author info ... */}
//             </div>

//             <div className="space-y-3">
//                 {/* ... Render Content & Image ... */}
//             </div>

//             {/* ACTIONS */}
//             <div className="flex items-center justify-between pt-2 border-t border-border">
//                 <div className="flex items-center gap-1">
//                     <Button
//                         variant="ghost"
//                         size="sm"
//                         className={`gap-2 ${isLiked ? "text-[#F44336]" : ""}`}
//                         onClick={handleLike}
//                     >
//                         <Heart
//                             className={`w-4 h-4 ${
//                                 isLiked ? "fill-current" : ""
//                             }`}
//                         />
//                         <span>{localLikes}</span>
//                     </Button>

//                     <Button
//                         variant="ghost"
//                         size="sm"
//                         className="gap-2"
//                         // Nếu click comment ở mode Preview, nó sẽ nổi bọt sự kiện lên cha để mở trang chi tiết
//                         // Nếu ở Detail, nó chỉ focus (xử lý tùy ý)
//                     >
//                         <MessageCircle className="w-4 h-4" />
//                         {/* Hiển thị số lượng comment lấy từ props post ban đầu */}
//                         <span>{post.comments?.length || 0} Comments</span>
//                     </Button>
//                 </div>

//                 <Button variant="ghost" size="sm" className="gap-2">
//                     <Share2 className="w-4 h-4" />
//                     <span>Share</span>
//                 </Button>
//             </div>

//             {/* --- LOGIC QUAN TRỌNG: CHỈ HIỆN COMMENT KHI Ở CHI TIẾT --- */}
//             {!isPreview && <CommentSection postId={post.id} />}
//         </div>
//     );
// }
