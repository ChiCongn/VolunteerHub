import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, startOfDay } from "date-fns";
import {
  CalendarIcon,
  ImageIcon,
  MapPin,
  AlignLeft,
  Users,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EventCategory } from "@/types/enum";
import { eventService } from "@/services/event.service";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/imageUrl.utils";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "@/components/ConfirmDiaLog";

const CATEGORIES: { label: string; value: EventCategory }[] = [
  { label: "📚 Education", value: "education" as EventCategory },
  { label: "💬 Social", value: "social" as EventCategory },
  {
    label: "🤝 Community Service",
    value: "community_service" as EventCategory,
  },
  { label: "❤️ Health & Wellness", value: "health_wellness" as EventCategory },
  { label: "💻 Technology & STEM", value: "technology_stem" as EventCategory },
  { label: "✨ Other", value: "other" as EventCategory },
];

export default function CreateEventPage() {
  // States for the form fields
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [imageUrl, setImageUrl] = useState(""); // Placeholder for now
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [categories, setCategories] = useState<EventCategory[]>([
    EventCategory.Other,
  ]);

  const [openConfirm, setOpenConfirm] = useState(false);

  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectImage = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const today = startOfDay(new Date());

  const toggleCategory = (value: EventCategory) => {
    setCategories((prev) => {
      if (prev.includes(value)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== value);
      }
      return [...prev, value];
    });
  };

  const resetForm = () => {
    setName("");
    setLocation("");
    setDescription("");
    setCapacity(1);
    setSelectedFile(null);
    setPreviewUrl("");
    setStartDate(undefined);
    setEndDate(undefined);
    setCategories([EventCategory.Other]);
  };

  const handleCreateEvent = async () => {
    console.log("click");
    if (!name || !location || !startDate || !capacity) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (endDate && endDate < startDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("location", location);
      formData.append("startTime", startDate.toISOString());
      if (endDate) formData.append("endTime", endDate.toISOString());
      formData.append("description", description);
      formData.append("capacity", String(capacity));
      formData.append("categories", JSON.stringify(categories));

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      await eventService.createEventWithImage(formData);
      resetForm();
      toast.success("Event created successfully! Wait approved!");
      // handle success
    } catch (err: any) {
      console.error("Failed to create event:", err);
      toast.error(err.response?.data?.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-none p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Image */}
      <Card className="md:col-span-1">
        <CardContent className="flex flex-col items-center justify-center h-full gap-4">
          <div className="w-full aspect-square border rounded-xl flex items-center justify-center bg-muted overflow-hidden relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            ) : imageUrl ? (
              <img
                src={getImageUrl(imageUrl)}
                alt="Event"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            )}

            {isSubmitting && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-white" />
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={onFileChange}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectImage}
            disabled={isSubmitting}
          >
            {previewUrl ? "Change Image" : "Select Image"}
          </Button>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Event name */}
          <div className="space-y-2">
            <Label>Event Name</Label>
            <Input
              placeholder="Enter event name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Event Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>Event Time</span>
            </div>

            <div className="relative pl-6 space-y-4">
              {/* vertical line */}
              <div className="absolute left-3 top-2 bottom-2 w-px bg-muted-foreground/30" />

              {/* Start */}
              <div className="relative flex items-start gap-4">
                <div className="absolute left-[-1.05rem] top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate ? format(startDate, "PPP") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < today} // 🚫 không cho quá khứ
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End */}
              <div className="relative flex items-start gap-4">
                <div className="absolute left-[-1.05rem] top-3 h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate ? format(endDate, "PPP") : "End date (optional)"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date < today} // 🚫 không cho quá khứ
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </div>
            <Input
              placeholder="Offline location or virtual link"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <AlignLeft className="h-4 w-4" />
              <span>Description</span>
            </div>
            <Textarea
              placeholder="Describe your event"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Capacity</span>
            </div>
            <Input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              placeholder="Number of participants"
            />
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-4">
              {CATEGORIES.map((cat) => (
                <div key={cat.value} className="flex items-center gap-2">
                  <Checkbox
                    checked={categories.includes(cat.value)}
                    onCheckedChange={() => toggleCategory(cat.value)}
                  />
                  <span className="text-sm">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => setOpenConfirm(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Event"}
          </Button>
        </CardContent>
      </Card>
        <ConfirmDialog
        open={openConfirm}
        title="Confirm Event Creation"
        description="Are you sure you want to create this event?"
        confirmText="Yes, Create"
        cancelText="Cancel"
        onConfirm={() => {
          setOpenConfirm(false);
          handleCreateEvent();
          navigate("/communities");
        }}
        onCancel={() => {
            setOpenConfirm(false);
        }}
      />
    </div>
  );
}
