import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Post } from "@/types/post.type";

interface Props {
  post: Post;
}

export default function PostHeader({ post }: Props) {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={post.author.avatarUrl} />
        <AvatarFallback>
          {post.author.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="leading-tight">
        <div className="text-sm">
          <span className="font-medium">{post.author.username}</span>
          <span className="text-muted-foreground mx-1">đã thêm vào</span>
          <span className="font-medium">{post.event.name}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {post.createdAt.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
