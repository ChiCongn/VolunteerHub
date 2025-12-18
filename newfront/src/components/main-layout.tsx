import { cn } from "@/lib/utils";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <div className="flex flex-1 flex-col">
        <main className={cn("flex-1 overflow-y-auto p-4")}>{children}</main>
      </div>
    </div>
  );
}
