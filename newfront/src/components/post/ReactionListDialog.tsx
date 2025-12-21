import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Reaction } from "@/types/post.type";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reactions: Reaction[];
}

const emojiMap: Record<string, string> = {
  like: "👍",
  haha: "😆",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

export default function ReactionListDialog({ isOpen, onClose, reactions }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Interactions</DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto space-y-4 py-4">
          {reactions.map((r, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={r.user?.avatar_url} />
                  <AvatarFallback>{r.user?.username[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{r.user?.username}</span>
              </div>
              <span className="text-xl">{emojiMap[r.emoji] || "❤️"}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}