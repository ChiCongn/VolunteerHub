import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PostFeedView } from "@/components/post/PostData";

interface Props {
  post: PostFeedView;
}

export default function PostHeader({ post }: Props) {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={post.author.avatar} />
        <AvatarFallback>
          {post.author.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="leading-tight">
        <div className="font-medium">
          {post.author.name}
        </div>

        <div className="text-xs text-muted-foreground">
          {post.createdAt.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
