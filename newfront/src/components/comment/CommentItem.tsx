import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CommentView } from "@/types/comment.type";
import { commentService, type Comment } from "@/services/comment.service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function CommentItem({ comment }: { comment: Comment }) {
  const username = comment.author?.username || "Người dùng";
  const avatarUrl = comment.author?.avatarUrl;
  const role = comment.author.role;

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="bg-muted rounded-lg px-3 py-2">
          <div className="text-sm font-medium flex items-center gap-2">
            {username}

            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {role}
            </span>
          </div>

          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
        </div>

        <div className="text-xs text-muted-foreground mt-1">
          {/*comment.createdAt.toLocaleString()*/}
          {comment.createdAt
            ? formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: vi,
              })
            : "Vừa xong"}
        </div>
      </div>
    </div>
  );
}
