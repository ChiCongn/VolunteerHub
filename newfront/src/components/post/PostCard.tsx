import { Card, CardContent } from "@/components/ui/card";
import type { PostFeedView } from "./PostData";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostActions from "./PostActions";
import type { Post } from "@/types/index";

interface PostCardProps {
  post: Post;
  onCommentClick?: (post: Post) => void;
}

export default function PostCard({ post, onCommentClick }: PostCardProps) {
  return (
    <Card className="bg-card">
      <CardContent className="space-y-3 p-4">
        <PostHeader post={post} />
        <PostContent post={post} />
        <PostActions
          likeCount={post.likeCount ?? 0}
          commentCount={post.commentCount ?? 0}
          onCommentClick={() => onCommentClick?.(post)}
        />
      </CardContent>
    </Card>
  );
}
