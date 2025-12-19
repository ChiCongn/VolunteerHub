import type { Post } from "@/types/post.type";

interface Props {
  post: Post;
}

export default function PostContent({ post }: Props) {
  return (
    <div className="space-y-3">
      <p className="whitespace-pre-wrap text-sm">{post.content}</p>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post image"
          className="rounded-md border object-cover max-h-[300px] w-full"
        />
      )}
    </div>
  );
}
