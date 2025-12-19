import SubscriptionsCard from "./cards/subscriptions";
import MetricCard from "./cards/metric";
import WelcomeCard from "./cards/welcome-card";
import TopicProgressChart from "./cards/topic-progress";
import StreakCalendar from "./cards/streak";
import { useUserStore } from "@/stores/user.store";
export default function Page() {
  const user = useUserStore((state) => state.user);
  const name = user?.username || "User";
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
        <div className="lg:col-span-2 lg:row-span-2 h-full">
          <WelcomeCard name={name} />
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
