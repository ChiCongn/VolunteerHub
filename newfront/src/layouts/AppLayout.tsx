import { Outlet } from "react-router-dom";
import { Navbar05 } from "@/pages/Navbar";
import LeftPanel from "@/components/LeftPanel";

export default function AppLayout() {
  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <Navbar05 />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-64 border-r overflow-y-auto">
          <LeftPanel />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
