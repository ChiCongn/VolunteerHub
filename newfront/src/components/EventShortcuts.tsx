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
    imageUrl: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b",
  },
  {
    id: "2",
    name: "Tổ buôn VNU",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  },
];

export default function EventShortcuts() {
  const navigate = useNavigate();

  return <div></div>;
}
