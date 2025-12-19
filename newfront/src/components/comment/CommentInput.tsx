import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onSubmit?: (content: string) => void;
}

export default function CommentInput({ onSubmit }: Props) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit?.(content);
      setContent("");
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src="https://i.pravatar.cc/150?img=1" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>

      <div className="flex-1 flex gap-2">
        <Input
          placeholder="Write a comment..."
          className="flex-1"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
        />
        <Button size="sm" onClick={handleSubmit}>
          Post
        </Button>
      </div>
    </div>
  );
}
