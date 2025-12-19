import { Outlet } from "react-router-dom";
import { Navbar05 } from "@/pages/navbar";
import LeftPanel from "@/components/LeftPanel";
import { useEffect } from "react";
import { userStartsService } from "@/services/user/user-stats.service";
import { useUserStore } from "@/stores/user.store";

const HeartbeatProcessor = () => {
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (!user?.id) return;

    // 5 minutes = 5 * 60 * 1000 = 300,000 ms
    // 15 minutes = 15 * 60 * 1000 = 900,000 ms
    const HEARTBEAT_INTERVAL = 300000;

    let lastPulse = Date.now();

    const sendPulse = async () => {
      try {
        const now = Date.now();
        const secondsPassed = Math.floor((now - lastPulse) / 1000);

        await userStartsService.recordOnlineTime(secondsPassed);

        // Update lastPulse ONLY after a successful API call
        lastPulse = now;

        console.log(`[Heartbeat] Recorded ${secondsPassed}s of activity.`);
      } catch (err) {
        console.error("Heartbeat failed", err);
        // We don't update lastPulse here so that the next successful
        // call captures the missing time.
      }
    };

    const timer = setInterval(sendPulse, HEARTBEAT_INTERVAL);

    // Optional: Send one pulse immediately when they log in/open the app
    // sendPulse();

    return () => clearInterval(timer);
  }, [user?.id]);

  return null;
};

export default function AppLayout() {
  return (
    <div className="flex flex-col h-screen">
      {/* Heartbeat Mechanism */}
      <HeartbeatProcessor />

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
