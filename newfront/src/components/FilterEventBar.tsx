import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { EventCategory, EventStatus } from "@/types/enum";

interface FilterBarProps {
  onSearch?: (query: string) => void;
  onCategoryChange?: (category: EventCategory | "all") => void;
  onStatusChange?: (status: EventStatus) => void;
  selectedCategory?: string;
  selectedStatus?: string;
}

export function FilterEventBar({
  onSearch,
  onCategoryChange,
  onStatusChange,
  selectedCategory = "all",
  selectedStatus = EventStatus.Pending,
}: FilterBarProps) {
  const categories = [
    { value: "all", label: "📋 All Categories" },
    { value: EventCategory.Education, label: "📚 Education" },
    { value: EventCategory.Social, label: "💬 Social" },
    { value: EventCategory.CommunityService, label: "🤝 Community Service" },
    { value: EventCategory.HealthWellness, label: "❤️ Health & Wellness" },
    { value: EventCategory.TechnologyStem, label: "💻 Technology & STEM" },
    { value: EventCategory.Other, label: "✨ Other" },
  ];
  const eventStatuses = [
    { value: EventStatus.Pending, label: "⏳ Pending" },
    { value: EventStatus.Approved, label: "✅ Approved" },
    { value: EventStatus.Rejected, label: "❌ Rejected" },
    { value: EventStatus.Ongoing, label: "🚀 Ongoing" },
    { value: EventStatus.Cancelled, label: "🛑 Cancelled" },
    { value: EventStatus.Completed, label: "🏁 Completed" },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            className="pl-10"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[200px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[160px]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {eventStatuses.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
