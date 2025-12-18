import { Card, CardContent } from "@/components/ui/card";
import type { PostFeedView } from "./PostData";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostActions from "./PostActions";

interface PostCardProps {
  post: PostFeedView;
  onCommentClick?: (post: PostFeedView) => void;
}

export default function PostCard({ post, onCommentClick }: PostCardProps) {
  return (
    <Card className="bg-card">
      <CardContent className="space-y-3 p-4">
        <PostHeader post={post} />
        <PostContent post={post} />
        <PostActions
          likeCount={post.likeCount}
          commentCount={post.commentCount}
          onCommentClick={() => onCommentClick?.(post)}
        />
      </CardContent>
    </Card>
  );
}
