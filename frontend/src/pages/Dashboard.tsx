import { useState } from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { RightPanel } from "../components/RightPanel";
import { EventCard } from "../components/EventCard";
import { PostCard } from "../components/PostCard";
import { FilterBar } from "../components/FilterBar";
import type { Event } from "../lib/mockData";
import type { Post } from "../lib/mockData";
import { mockEvents, mockPosts } from "../lib/mockData";
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
    // mock data
    const [events] = useState<Event[]>(mockEvents);
    const [posts] = useState<Post[]>(mockPosts);
    //states
    const [filteredEvents, setFilteredEvents] = useState<Event[]>(mockEvents);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedSort, setSelectedSort] = useState("date");
    const [newPostContent, setNewPostContent] = useState("");
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

    const handleSearch = (query: string) => {
        const filtered = events.filter(
            (event) =>
                event.title.toLowerCase().includes(query.toLowerCase()) ||
                event.description.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredEvents(filtered);
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        if (category === "all") {
            setFilteredEvents(events);
        } else {
            setFilteredEvents(
                events.filter((event) => event.category === category)
            );
        }
    };

    const handleSortChange = (sort: string) => {
        setSelectedSort(sort);
        const sorted = [...filteredEvents];

        switch (sort) {
            case "popularity":
                sorted.sort((a, b) => b.registered - a.registered);
                break;
            case "spots":
                sorted.sort(
                    (a, b) =>
                        b.capacity - b.registered - (a.capacity - a.registered)
                );
                break;
            case "recent":
                sorted.sort((a, b) => b.id.localeCompare(a.id));
                break;
            default:
                sorted.sort(
                    (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                );
        }

        setFilteredEvents(sorted);
    };

    const handleCreatePost = () => {
        if (newPostContent.trim()) {
            toast.success("Post created successfully!");
            setNewPostContent("");
            setIsCreatePostOpen(false);
        }
    };

    const handleLikePost = (postId: string) => {
        // Handle like action
    };

    const handleCommentPost = (postId: string) => {
        toast("Comment feature coming soon!");
    };

    const handleRegister = (eventId: string) => {
        toast.success("Successfully registered for event!");
        // onRegisterEvent(eventId);
    };

    // Mix events and posts for a Facebook-like feed
    const feedItems: Array<{
        type: "event" | "post";
        data: Event | Post;
        id: string;
    }> = [
        ...posts.map((post) => ({
            type: "post" as const,
            data: post,
            id: post.id,
        })),
        ...filteredEvents.slice(0, 3).map((event) => ({
            type: "event" as const,
            data: event,
            id: event.id,
        })),
    ].sort(() => Math.random() - 0.5);

    return (
        <div>
            <Header />
            <div className="flex">
                {/* bên trái cùng*/}
                <Sidebar />

                <main className="flex-1 min-w-0">
                    <div className="container max-w-[1440px] mx-auto px-4 py-6 mb-16 md:mb-0">
                        <div className="flex gap-6">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1>Welcome Back!</h1>
                                        <p className="text-muted-foreground">
                                            Discover volunteer opportunities and
                                            connect with your community
                                        </p>
                                    </div>
                                </div>

                                <FilterBar
                                    onSearch={handleSearch}
                                    onCategoryChange={handleCategoryChange}
                                    onSortChange={handleSortChange}
                                    selectedCategory={selectedCategory}
                                    selectedSort={selectedSort}
                                />

                                <div className="space-y-6">
                                    {feedItems.map((item) =>
                                        item.type === "post" ? (
                                            <PostCard
                                                key={`${item.type}-${item.id}`}
                                                post={item.data as Post}
                                                onLike={handleLikePost}
                                                //onComment={handleCommentPost}
                                            />
                                        ) : (
                                            <EventCard
                                                key={`${item.type}-${item.id}`}
                                                event={item.data as Event}
                                                onRegister={handleRegister}
                                                //onViewDetails={onEventClick}
                                            />
                                        )
                                    )}

                                    {filteredEvents.slice(3).map((event) => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            onRegister={handleRegister}
                                            //onViewDetails={onEventClick}
                                        />
                                    ))}

                                    {filteredEvents.length === 0 && (
                                        <div className="text-center py-12 bg-card rounded-lg border border-border">
                                            <p className="text-muted-foreground mb-4">
                                                No events found matching your
                                                filters
                                            </p>
                                            <Button
                                                onClick={() =>
                                                    handleCategoryChange("all")
                                                }
                                            >
                                                Clear Filters
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <Dialog
                                    open={isCreatePostOpen}
                                    onOpenChange={setIsCreatePostOpen}
                                >
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
                                            <DialogTitle>
                                                Create Post
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="post-content">
                                                    What's on your mind?
                                                </Label>
                                                <Textarea
                                                    id="post-content"
                                                    placeholder="Share your volunteer experience, ask questions, or announce upcoming events..."
                                                    rows={5}
                                                    value={newPostContent}
                                                    onChange={(e) =>
                                                        setNewPostContent(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        setIsCreatePostOpen(
                                                            false
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleCreatePost}
                                                    disabled={
                                                        !newPostContent.trim()
                                                    }
                                                    className="bg-[#43A047] hover:bg-[#388E3C]"
                                                >
                                                    Post
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* bên phải cùng*/}
                            <RightPanel />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
