import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Trash2, Edit2, MoreHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { commentService } from "../services/comment.service";
import type { Comment } from "../types/comment.type";
import { useUserStore } from "../stores/user.store"; // Store lấy user hiện tại
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface CommentSectionProps {
    postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
    // --- STATE ---
    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null); // ID comment đang sửa
    const [editContent, setEditContent] = useState("");

    // Lấy user hiện tại từ store để check quyền sửa/xóa
    // Nếu chưa setup store, bạn có thể mock tạm: const user = { id: '1', ... }
    const { user } = useUserStore();

    // --- EFFECTS ---
    useEffect(() => {
        fetchComments();
    }, [postId]);

    // --- HANDLERS ---

    // 2. Trong hàm fetchComments, đảm bảo dữ liệu trả về là mảng
    const fetchComments = async () => {
        try {
            const data = await commentService.getByPostId(postId);
            // Nếu API trả về null/undefined, gán fallback là []
            setComments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch comments", error);
            setComments([]); // Fallback khi lỗi
        }
    };

    const handleCreate = async () => {
        if (!content.trim()) return;
        setIsLoading(true);
        try {
            const newComment = await commentService.create({ postId, content });

            // Nếu backend chưa trả về populate author ngay lập tức,
            // ta có thể merge thủ công user hiện tại vào để hiển thị ngay (Optimistic UI)
            const displayComment = {
                ...newComment,
                author: newComment.author || {
                    id: user?.id || "",
                    name: user?.username || "Me",
                    avatar: user?.avatarUrl || "",
                },
            };

            setComments((prev) => [displayComment as Comment, ...prev]);
            setContent("");
            toast.success("Comment added!");
        } catch (error) {
            toast.error("Failed to add comment");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        // Confirm dialog đơn giản
        if (!window.confirm("Delete this comment?")) return;

        try {
            await commentService.delete(id);
            setComments((prev) => prev.filter((c) => c.id !== id));
            toast.success("Comment deleted");
        } catch (error) {
            toast.error("Failed to delete comment");
        }
    };

    const startEdit = (comment: Comment) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
    };

    const handleUpdate = async (id: string) => {
        if (!editContent.trim()) return;
        try {
            const updated = await commentService.update(id, {
                content: editContent,
            });
            setComments((prev) =>
                prev.map((c) =>
                    c.id === id ? { ...c, content: updated.content } : c
                )
            );
            setEditingId(null);
            toast.success("Comment updated");
        } catch (error) {
            toast.error("Failed to update comment");
        }
    };

    // --- RENDER ---
    return (
        <div className="pt-4 border-t border-border space-y-4 animate-in fade-in slide-in-from-top-2">
            {/* INPUT SECTION */}
            <div className="flex gap-3 items-start">
                <Avatar className="w-8 h-8 mt-1">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                    <Input
                        placeholder="Write a comment..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === "Enter" && !isLoading && handleCreate()
                        }
                        disabled={isLoading}
                    />
                    <Button
                        size="icon"
                        onClick={handleCreate}
                        disabled={!content.trim() || isLoading}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* LIST SECTION */}
            <div className="space-y-4 pl-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                {comments.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                        No comments yet.
                    </p>
                )}

                {/* Thêm Array.isArray hoặc dùng ?.map */}
                {Array.isArray(comments) &&
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                            {/* ... nội dung comment ... */}
                        </div>
                    ))}

                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group">
                        <Avatar className="w-8 h-8">
                            {/* Xử lý fallback nếu author undefined */}
                            <AvatarImage src={comment.author?.avatar} />
                            <AvatarFallback>
                                {comment.author?.name?.charAt(0) || "?"}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-1">
                            {editingId === comment.id ? (
                                // Edit Mode
                                <div className="flex gap-2 items-center">
                                    <Input
                                        value={editContent}
                                        onChange={(e) =>
                                            setEditContent(e.target.value)
                                        }
                                        autoFocus
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleUpdate(comment.id)}
                                    >
                                        <Send className="w-4 h-4 text-green-600" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setEditingId(null)}
                                    >
                                        <X className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            ) : (
                                // View Mode
                                <div className="flex items-start justify-between">
                                    <div className="bg-muted/50 rounded-2xl px-4 py-2 inline-block max-w-[90%]">
                                        <p className="text-sm font-semibold text-foreground/90">
                                            {comment.author?.name || "Unknown"}
                                        </p>
                                        <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    </div>

                                    {/* Action Menu (Chỉ hiện nếu là chủ comment) */}
                                    {user?.id === comment.authorId && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        startEdit(comment)
                                                    }
                                                >
                                                    <Edit2 className="mr-2 h-4 w-4" />{" "}
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleDelete(comment.id)
                                                    }
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />{" "}
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-4 px-4 text-xs text-muted-foreground">
                                {/* Nếu cần tính timeAgo thực tế hãy dùng library date-fns */}
                                <span>
                                    {new Date(
                                        comment.createdAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
