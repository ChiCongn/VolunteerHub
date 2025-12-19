import SubscriptionsCard from "./cards/subscriptions";
import MetricCard from "./cards/metric";
import WelcomeCard from "./cards/welcome-card";
import TopicProgressChart from "./cards/topic-progress";
import StreakCalendar from "./cards/streak";
import { useAuthState } from "@/hooks/useAuthState";

export default function Page() {
  const { userName } = useAuthState();

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
        <div className="lg:col-span-2 lg:row-span-2 h-full">
          <WelcomeCard name={userName} />
        </div>

        <SubscriptionsCard />
        <TopicProgressChart />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <StreakCalendar />
        <MetricCard />
      </div>
    </div>
  );
}
