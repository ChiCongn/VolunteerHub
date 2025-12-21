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

  /* ===== NEW ===== */
  onLimitChange?: (limit: number) => void;
  selectedLimit?: number;

  selectedCategory?: string;
  selectedStatus?: string;
}

export function FilterEventBar({
  onSearch,
  onCategoryChange,
  onStatusChange,
  onLimitChange,
  selectedLimit = 10, // default 10
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

  const limits = [5, 10, 15, 20, 30, 50, 100, 200];

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* ===== SEARCH ===== */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            className="pl-10"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>

        {/* ===== FILTERS ===== */}
        <div className="flex gap-2">
          {/* Category */}
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

          {/* Status */}
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

          {/* 🔥 LIMIT (NEW) */}
          <Select
            value={String(selectedLimit)}
            onValueChange={(v) => onLimitChange?.(Number(v))}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {limits.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
