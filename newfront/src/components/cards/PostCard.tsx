import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MessageCircle,
  Heart,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import type { Post } from "@/types/post.type";

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // navigate to detailed post page like: /posts/123
    navigate(`/posts/${post.id}`);
  };

  return (
    <Card
      className="border-b p-4 bg-white hover:border-zinc-400 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex">
        {/* Vote Column */}

        {/* Post Content */}
        <div className="flex-1 p-3 bg-white">
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1.5">
            <Avatar>
              <AvatarImage src="https://bundui-images.netlify.app/avatars/01.png" />
              <AvatarFallback>MS</AvatarFallback>
            </Avatar>
            <span className="font-bold text-zinc-900">
              {post.author?.username}
            </span>
            <span>•</span>

            <span className="left">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <h3 className="text-lg font-medium text-zinc-900 mb-2 leading-snug">
            {post.content}
          </h3>

          {post.imageUrl && (
            <div className="rounded-lg overflow-hidden border border-zinc-200 mb-2">
              <img
                src={post.imageUrl}
                alt="Content"
                className="w-full object-cover max-h-[500px]"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1 text-zinc-500 font-bold text-xs mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 hover:text-red-500"
            >
              <Heart className="h-4 w-4" />
              <span className="text-sm">{post.reactionCount || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 hover:text-green-500"
            >
              <MessageCircle className="w-4 h-4" /> {post.commentCount || 0}
            </Button>

            {/* ... Share Button ... */}
          </div>
        </div>
      </div>
    </Card>
  );
};
