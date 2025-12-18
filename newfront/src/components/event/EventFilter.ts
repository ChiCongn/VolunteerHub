import { EventCategory, EventStatus } from "@/types/enum";

export const CATEGORY_FILTERS = [
  { value: "all", label: "📋 All Categories" },
  { value: EventCategory.Education, label: "📚 Education" },
  { value: EventCategory.Social, label: "💬 Social" },
  { value: EventCategory.CommunityService, label: "🤝 Community Service" },
  { value: EventCategory.HealthWellness, label: "❤️ Health & Wellness" },
  { value: EventCategory.TechnologyStem, label: "💻 Technology & STEM" },
  { value: EventCategory.Other, label: "✨ Other" },
] as const;

export const STATUS_FILTERS = [
  { value: "all", label: "All Status" },
  { value: EventStatus.Pending, label: "Pending" },
  { value: EventStatus.Approved, label: "Approved" },
] as const;
