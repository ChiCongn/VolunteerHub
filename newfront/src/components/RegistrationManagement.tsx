import { useEffect, useState } from "react";
import { eventService } from "@/services/event.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Loader2 } from "lucide-react";
import { RegistrationStatus } from "@/types/enum"; // Giả định có: Pending, Approved, Rejected
import { toast } from "sonner";

interface Registration {
  regId: string;
  status: RegistrationStatus;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
    role: string;
  };
}

export const RegistrationManagement = ({ eventId }: { eventId: string }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    try {
      const data = await eventService.getEventRegistrations(eventId);
      setRegistrations(data.items);
    } catch (error) {
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [eventId]);

  const handleProcessRequest = async (regId: string, approve: boolean) => {
    try {
      await eventService.updateRegistrationStatus(regId, approve);

      const newStatus = approve
        ? RegistrationStatus.Approved
        : RegistrationStatus.Rejected;

      toast.success(approve ? "Member approved!" : "Request rejected.");

      // Cập nhật state local để UI thay đổi ngay lập tức
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.regId === regId ? { ...reg, status: newStatus } : reg
        )
      );
    } catch (error: any) {
      const msg = error.response?.data?.message || "Action failed";
      toast.error(msg);
    }
  };

  const renderUserList = (status: RegistrationStatus) => {
    const filtered = registrations.filter((r) => r.status === status);

    if (filtered.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p>No users in this category.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 p-1">
        {filtered.map((reg) => (
          <div
            key={reg.regId}
            className="flex items-center justify-between gap-4 p-3 border rounded-xl bg-card"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={reg.user.avatarUrl} />
                <AvatarFallback>
                  {reg.user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">
                  {reg.user.username}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {reg.user.role.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {status === RegistrationStatus.Pending && (
                <>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                    onClick={() => handleProcessRequest(reg.regId, true)}
                  >
                    <Check className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 h-8"
                    onClick={() => handleProcessRequest(reg.regId, false)}
                  >
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </>
              )}

              {status === RegistrationStatus.Approved && (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                  Active Member
                </Badge>
              )}

              {status === RegistrationStatus.Rejected && (
                <Badge
                  variant="outline"
                  className="text-red-500 border-red-200 bg-red-50"
                >
                  Rejected
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading members...</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="pending" className="relative">
          Requests
          {registrations.filter((r) => r.status === RegistrationStatus.Pending)
            .length > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
              {
                registrations.filter(
                  (r) => r.status === RegistrationStatus.Pending
                ).length
              }
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="approved">Members</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
      </TabsList>

      <ScrollArea className="h-[450px] pr-4">
        <TabsContent value="pending" className="mt-0">
          {renderUserList(RegistrationStatus.Pending)}
        </TabsContent>
        <TabsContent value="approved" className="mt-0">
          {renderUserList(RegistrationStatus.Approved)}
        </TabsContent>
        <TabsContent value="rejected" className="mt-0">
          {renderUserList(RegistrationStatus.Rejected)}
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
};
