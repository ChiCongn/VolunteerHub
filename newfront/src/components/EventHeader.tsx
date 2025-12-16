import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, MoreHorizontal, Plus } from "lucide-react";
import type { Event } from "@/types";


interface EventHeaderProps {
    event: Event;
    onCreatePost: () => void;
}

export const EventHeader = ({ event, onCreatePost }: EventHeaderProps) => {


    return (
        <div className="bg-white dark:bg-zinc-900 pb-4 shadow-sm">
            {/* Banner */}
            <div className="h-24 md:h-40 w-full relative overflow-hidden">
                <div className="w-full h-full bg-[#33a852]" />
            </div>

            {/* Info Area */}
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex flex-col md:flex-row items-start gap-4 -mt-6 relative z-10">
                    <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-white bg-white">
                        <AvatarImage
                            src={event.imageUrl}
                            className="object-cover"
                        />
                        <AvatarFallback className="text-2xl font-bold bg-zinc-100 text-zinc-500">
                            {event.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4 mt-2">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                {event.name}
                            </h1>
                            <p className="text-zinc-500 text-sm font-medium">
                                r/{event.name.toLowerCase().replace(/\s+/g, "")}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                className="rounded-full px-6 font-semibold"
                                variant="outline"
                                onClick={onCreatePost}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Create Post
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                            >
                                <Bell className="w-4 h-4" />
                            </Button>
                            <Button
                                className="rounded-full px-6 font-bold"
                                variant="secondary"
                            >
                                Joined
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
