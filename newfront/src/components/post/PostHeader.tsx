import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Post } from "@/types/post.type";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Props {
  post: Post;
}

export default function PostHeader({ post }: Props) {
  const avatarUrl = post?.author?.avatarUrl;
  const username = post?.author?.username || "Bạn";
  const eventName = post?.event?.name || "sự kiện này";

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="leading-tight">
        <div className="text-sm">
          <span className="font-medium">{username}</span>
          <span className="text-muted-foreground mx-1">đã thêm vào</span>
          <span className="font-medium">{eventName}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {/* {post.createdAt.toLocaleString()} */}
          {post.createdAt
            ? formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: vi,
              })
            : "Vừa xong"}
        </div>
      </div>
    </div>
  );
}
