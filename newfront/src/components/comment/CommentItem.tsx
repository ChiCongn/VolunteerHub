import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CommentView } from "@/types/comment.type";

interface Props {
  comment: CommentView;
}

export default function CommentItem({ comment }: Props) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author.avatarUrl} />
        <AvatarFallback>
          {comment.author.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="bg-muted rounded-lg px-3 py-2">
          <div className="text-sm font-medium flex items-center gap-2">
            {comment.author.username}

            {comment.author.role !== "volunteer" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {comment.author.role.replace("_", " ")}
              </span>
            )}
          </div>

          <p className="text-sm whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        <div className="text-xs text-muted-foreground mt-1">
          {comment.createdAt.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
