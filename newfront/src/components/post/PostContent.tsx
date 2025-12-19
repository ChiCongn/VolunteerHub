import type { PostFeedView } from "@/components/post/PostData";

interface Props {
  post: PostFeedView;
}

export default function PostContent({ post }: Props) {
  return (
    <div className="space-y-3">
      <p className="whitespace-pre-wrap text-sm">
        {post.content}
      </p>

      {post.image && (
        <img
          src={post.image}
          alt="Post image"
          className="rounded-md border object-cover max-h-[300px] w-full"
        />
      )}
    </div>
  );
}
