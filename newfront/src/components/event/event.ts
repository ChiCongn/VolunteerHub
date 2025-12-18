export type Event = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  date: string;
  location: string;
  price?: number;
  description: string;
  status?: string;
};

    // { value: "all", label: "📋 All Categories" },
    // { value: EventCategory.Education, label: "📚 Education" },
    // { value: EventCategory.Social, label: "💬 Social" },
    // { value: EventCategory.CommunityService, label: "🤝 Community Service" },
    // { value: EventCategory.HealthWellness, label: "❤️ Health & Wellness" },
    // { value: EventCategory.TechnologyStem, label: "💻 Technology & STEM" },
    // { value: EventCategory.Other, label: "✨ Other" },

export const events: Event[] = [
  {
    id: "1",
    title: "Milano 21T Meeting",
    imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
    category: "Business",
    date: "2025-11-17",
    location: "Milan",
    price: 29,
    description:
      "A professional business meeting focusing on innovation and teamwork.",
    status: "SHOWING",
  },
  {
    id: "2",
    title: "Gaming X2021 Fair",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    category: "Technology",
    date: "2025-03-01",
    location: "Istanbul",
    price: 75,
    description:
      "Explore the latest trends in gaming technology and esports.",
    status: "SHOWING",
  },
  {
    id: "3",
    title: "Eventchamp Conference",
    imageUrl: "https://images.unsplash.com/photo-1503428593586-e225b39bddfe",
    category: "Business",
    date: "2025-03-12",
    location: "London",
    price: 149,
    description:
      "Annual conference for event organizers and community leaders.",
    status: "SHOWING",
  },
  {
    id: "1",
    title: "Milano 21T Meeting",
    imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
    category: "Business",
    date: "2025-11-17",
    location: "Milan",
    price: 29,
    description:
      "A professional business meeting focusing on innovation and teamwork.",
    status: "SHOWING",
  },
  {
    id: "2",
    title: "Gaming X2021 Fair",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    category: "Technology",
    date: "2025-03-01",
    location: "Istanbul",
    price: 75,
    description:
      "Explore the latest trends in gaming technology and esports.",
    status: "SHOWING",
  },
  {
    id: "3",
    title: "Eventchamp Conference",
    imageUrl: "https://images.unsplash.com/photo-1503428593586-e225b39bddfe",
    category: "Business",
    date: "2025-03-12",
    location: "London",
    price: 149,
    description:
      "Annual conference for event organizers and community leaders.",
    status: "SHOWING",
  },
  {
    id: "1",
    title: "Milano 21T Meeting",
    imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
    category: "Business",
    date: "2025-11-17",
    location: "Milan",
    price: 29,
    description:
      "A professional business meeting focusing on innovation and teamwork.",
    status: "SHOWING",
  },
  {
    id: "2",
    title: "Gaming X2021 Fair",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    category: "Technology",
    date: "2025-03-01",
    location: "Istanbul",
    price: 75,
    description:
      "Explore the latest trends in gaming technology and esports.",
    status: "SHOWING",
  },
  {
    id: "3",
    title: "Eventchamp Conference",
    imageUrl: "https://images.unsplash.com/photo-1503428593586-e225b39bddfe",
    category: "Business",
    date: "2025-03-12",
    location: "London",
    price: 149,
    description:
      "Annual conference for event organizers and community leaders.",
    status: "SHOWING",
  },
];
