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
  onStatusChange?: (status: EventStatus | "all") => void;
  selectedCategory?: EventCategory | "all";
  selectedStatus?: EventStatus | "all";
  selectedLimit?: number;
  onLimitChange?: (limit: number) => void;
}

export function FilterEventBarForComunity({
  onSearch,
  onCategoryChange,
  onStatusChange,
  selectedCategory = "all",
  selectedStatus = "all",
  selectedLimit = 20,
  onLimitChange,
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
    { value: "all", label: "All Status" },
    { value: EventStatus.Approved, label: "✅ Approved" },
    { value: EventStatus.Ongoing, label: "🚀 Ongoing" },
    { value: EventStatus.Completed, label: "🏁 Completed" },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            className="pl-10"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select
            value={selectedCategory}
            onValueChange={(v) =>
              onCategoryChange?.(v as EventCategory | "all")
            }
          >
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

          <Select
            value={selectedStatus}
            onValueChange={(v) =>
              onStatusChange?.(v as EventStatus | "all")
            }
          >
            <SelectTrigger className="w-[160px]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {eventStatuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Limit */}
          <Select
            value={String(selectedLimit)}
            onValueChange={(v) => onLimitChange?.(Number(v))}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
