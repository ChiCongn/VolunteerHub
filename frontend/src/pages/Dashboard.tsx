import { useState } from "react";
import { EventCard } from "../components/EventCard";
import { PostCard } from "../components/PostCard";
import { FilterBar } from "../components/FilterBar";
import type { Event, Post, mockEvents, mockPosts } from "../lib/mockData";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { toast } from "sonner";

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Welcome Back!</h1>
          <p className="text-muted-foreground">
            Discover volunteer opportunities and connect with your community
          </p>
        </div>
      </div>

      <FilterBar />

      <div className="space-y-6"></div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-[#43A047] hover:bg-[#388E3C] z-30"
            size="icon"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="post-content">What's on your mind?</Label>
              <Textarea
                id="post-content"
                placeholder="Share your volunteer experience, ask questions, or announce upcoming events..."
                rows={5}
                //value={newPostContent}
                //onChange={(e) => setNewPostContent(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                //onClick={() => setIsCreatePostOpen(false)}
              >
                Cancel
              </Button>
              <Button
                //onClick={handleCreatePost}
                //disabled={!newPostContent.trim()}
                className="bg-[#43A047] hover:bg-[#388E3C]"
              >
                Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
