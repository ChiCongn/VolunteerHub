import { useEffect } from "react";
import { useUserStore } from "@/stores/user.store";
import EventPageForUser from "@/components/event/EventPageForUser";

export default function Community() {
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    console.log("USER AFTER HYDRATE:", user);
  }, [user]);

  return (
    <div className="flex flex-1 justify-center min-w-0">
      <div className="w-full max-w-5xl min-h-screen p-4">
        <EventPageForUser />
      </div>
    </div>
  );
}
