import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type WelcomeCardProps = {
  name?: string;
};

import volunteerIllustration from "@/assets/hello.svg"

export default function WelcomeCard({name}: WelcomeCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="relative h-full overflow-hidden flex bg-white">
      <CardContent className="flex flex-1 items-center justify-between gap-6 p-6">
        <div className="max-w-xl space-y-3">
          <h2 className="text-2xl font-semibold">Welcome back, {name} 👋</h2>

          <p className="text-base text-muted-foreground">
            Ready to make a positive impact today?
          </p>

          <p className="text-sm text-muted-foreground">
            Volunteer Hub is a centralized platform for connecting volunteers,
            event managers, and organizations. Join environmental campaigns,
            charity events, and community programs while tracking participation
            and collaborating through real-time discussion channels.
          </p>

          <Button className="mt-2" onClick={() => navigate("/communities")}>
            Explore Volunteer Events
          </Button>
        </div>

        <div className="hidden md:flex items-center">
          <img
            src={volunteerIllustration}
            alt="Volunteer Hub welcome illustration"
            className="h-150 w-300 object-contain"
          />
        </div>
      </CardContent>
    </Card>
  );
}
