import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedalIcon, MapIcon, PlaneIcon, GiftIcon } from "./Icons";
import type { ReactNode } from "react";

interface FeatureProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <MedalIcon />,
    title: "Explore Volunteer Activities",
    description:
      "Browse a wide range of volunteer activities such as environmental campaigns, charity events, and community programs. Each event provides clear information including time, location, and participation requirements.",
  },
  {
    icon: <MapIcon />,
    title: "Register & Get Confirmed",
    description:
      "Volunteers can easily register for events and receive confirmation after approval. Event managers can review applications, manage participation, and ensure the right volunteers join each activity.",
  },
  {
    icon: <PlaneIcon />,
    title: "Participate & Track Your Impact",
    description:
      "After joining an event, volunteers can track their participation history and completion status. Event managers can mark attendance and monitor volunteer involvement throughout the event lifecycle.",
  },
  {
    icon: <GiftIcon />,
    title: "Connect Through Event Communities",
    description:
      "Each approved event includes a dedicated discussion channel where participants can post updates, share information, and interact with others—creating an active and collaborative volunteer community.",
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="howItWorks"
      className="container text-center py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold">
        How{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Volunteer Hub{" "}
        </span>
        Works
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
        Discover how Volunteer Hub supports the organization, coordination, and
        interaction of volunteer activities in a single unified platform.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card
            key={title}
            className="bg-muted/50"
          >
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
