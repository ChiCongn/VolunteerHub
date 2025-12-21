import { useEffect, useState } from "react";
import { eventService } from "@/services/event.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  X,
  Loader2,
  FileJson,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { RegistrationStatus } from "@/types/enum";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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

  const exportToCSV = () => {
    if (!registrations.length) return;

    const headers = [
      "Registration ID",
      "User ID",
      "Username",
      "Role",
      "Status",
    ];
    const rows = registrations.map((r) => [
      r.regId,
      r.user.id,
      r.user.username,
      r.user.role,
      r.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + 
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registrations_event_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (!registrations.length) return;

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(registrations, null, 2));

    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `registrations_event_${eventId}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">
          Total: {registrations.length} registrations
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={exportToCSV}
              className="gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              Export to CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={exportToJSON}
              className="gap-2 cursor-pointer"
            >
              <FileJson className="h-4 w-4 text-blue-600" />
              Export to JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="pending" className="relative">
            Requests
            {registrations.filter(
              (r) => r.status === RegistrationStatus.Pending
            ).length > 0 && (
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
    </div>
  );
};
