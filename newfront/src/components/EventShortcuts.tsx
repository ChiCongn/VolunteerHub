"use client";

import { useNavigate } from "react-router-dom";

type EventShortcut = {
  id: string;
  name: string;
  imageUrl: string;
};

/* MOCK DATA – sau này thay bằng API event đã tham gia */
const MOCK_EVENTS: EventShortcut[] = [
  {
    id: "1",
    name: "Đại Học Đừng Học Đại",
    imageUrl:
      "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b",
  },
  {
    id: "2",
    name: "Tổ buôn VNU",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  },
];

export default function EventShortcuts() {
  const navigate = useNavigate();

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
        Your shortcuts
      </h3>

      <ul className="space-y-1">
        {MOCK_EVENTS.map((event) => (
          <li
            key={event.id}
            onClick={() => navigate(`/events/${event.id}`)}
            className="
              flex items-center gap-3 rounded-md px-2 py-2
              cursor-pointer
              hover:bg-muted
              transition
            "
          >
            <img
              src={event.imageUrl}
              alt={event.name}
              className="h-9 w-9 rounded-md object-cover"
            />

            <span className="text-sm font-medium truncate">
              {event.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
