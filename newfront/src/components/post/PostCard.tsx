import { Card, CardContent } from "@/components/ui/card";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostActions from "./PostActions";
import type { Post } from "@/types/post.type";

interface PostCardProps {
  post: Post;
  onCommentClick?: (post: Post) => void;
}

export default function PostCard({ post, onCommentClick }: PostCardProps) {
  return (
    <Card className="bg-white">
      <CardContent className="space-y-3 p-4">
        <PostHeader post={post} />
        <PostContent post={post} />
        <PostActions
          likeCount={post.reactionCount}
          commentCount={post.commentCount}
          onCommentClick={() => onCommentClick?.(post)}
        />
      </CardContent>
    </Card>
  );
}
