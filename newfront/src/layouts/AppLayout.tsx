import { Outlet } from "react-router-dom";
import { Navbar05 } from "@/pages/navbar";
import LeftPanel from "@/components/LeftPanel";

export default function AppLayout() {
  return (
    <div className="flex flex-col h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar05 />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r overflow-y-auto">
          <LeftPanel />
        </div>

        <main className="flex-1 overflow-y-auto mt-[60px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
