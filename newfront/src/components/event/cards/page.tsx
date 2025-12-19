import SubscriptionsCard from "./subscriptions"
import MetricCard from "./metric";
import WelcomeCard from "./welcome-card";
import { useAuthState } from "@/hooks/useAuthState";
import PersonEvent from "./personevent";
import CreateEventCtaCard from "./eventcreate";

export default function Page() {
  const { userName } = useAuthState();

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
        <div className="lg:col-span-2 lg:row-span-2 h-full">
          <WelcomeCard name={userName} />
        </div>
        <CreateEventCtaCard />
        <SubscriptionsCard />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <MetricCard />
        <PersonEvent />
      </div>
    </div>
  );
}
