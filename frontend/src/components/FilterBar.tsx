import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';

interface FilterBarProps {
  onSearch?: (query: string) => void;
  onCategoryChange?: (category: string) => void;
  onSortChange?: (sort: string) => void;
  selectedCategory?: string;
  selectedSort?: string;
}

export function FilterBar({
  onSearch,
  onCategoryChange,
  onSortChange,
  selectedCategory = 'all',
  selectedSort = 'date',
}: FilterBarProps) {
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'environment', label: '🌿 Environment' },
    { value: 'education', label: '📚 Education' },
    { value: 'health', label: '❤️ Health' },
    { value: 'community', label: '🤝 Community' },
    { value: 'animals', label: '🐾 Animals' },
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'spots', label: 'Spots Available' },
    { value: 'recent', label: 'Recently Added' },
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
            <SelectTrigger className="w-[180px]">
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

          <Select value={selectedSort} onValueChange={onSortChange}>
            <SelectTrigger className="w-[160px]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCategory !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <Badge variant="secondary" className="gap-1">
            {categories.find((c) => c.value === selectedCategory)?.label}
            <button
              onClick={() => onCategoryChange?.('all')}
              className="ml-1 hover:text-destructive"
            >
              ×
            </button>
          </Badge>
        </div>
      )}
    </div>
  );
}
