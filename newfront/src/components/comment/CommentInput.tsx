import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { commentService, type Comment } from "@/services/comment.service";
import { useUserStore } from "@/stores/user.store";
import { useAuthState } from "@/hooks/useAuthState";

interface Props {
  postId: string;
  onCommentCreated: (newComment: Comment) => void;
}

export default function CommentInput({ postId, onCommentCreated }: Props) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuthState();

  //   const handleSubmit = () => {
  //     if (content.trim()) {
  //       onSubmit?.(content);
  //       setContent("");
  //     }
  //   };

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("content chua trim");
      return;
    } else if (isSubmitting) {
      alert("dang submit");
      return;
    } else if (!isAuthenticated) {
      alert("chua auth");
      return;
    }

    try {
      setIsSubmitting(true);
      const newComment = await commentService.createComment({
        postId: postId,
        content: content.trim(),
        authorId: user?.id || "c1053a85-e0a0-46f8-87bf-261b98a5c5bc",
      });

      onCommentCreated(newComment);
      setContent("");
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert("Không thể gửi bình luận. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.avatarUrl} />
        <AvatarFallback>
          {user?.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 flex gap-2">
        <Input
          placeholder="Write a comment..."
          className="flex-1"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          //onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button size="sm" onClick={handleSubmit}>
          Post
        </Button>
      </div>
    </div>
  );
}
