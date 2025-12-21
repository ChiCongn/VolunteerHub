import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* Placeholder images – bạn thêm sau */
const placeholder = "";

interface FeatureProps {
  title: string;
  description: string;
  image: string;
}

const features: FeatureProps[] = [
  {
    title: "Event Creation & Management",
    description:
      "Event managers can easily create, edit, and manage volunteer events with detailed information such as time, location, description, and participation requirements.",
    image: placeholder,
  },
  {
    title: "Volunteer Registration & Approval",
    description:
      "Volunteers can register for events while event managers review and approve registrations to ensure suitable participation for each activity.",
    image: placeholder,
  },
  {
    title: "Volunteer Participation Tracking",
    description:
      "Track volunteer attendance and completion status after events, providing a clear history of participation and contribution.",
    image: placeholder,
  },
  {
    title: "Event Discussion Channels",
    description:
      "Each approved event includes a dedicated discussion space where participants can post updates, comment, and interact with others before and after the event.",
    image: placeholder,
  },
  {
    title: "Role-Based Access Control",
    description:
      "The system supports multiple roles including volunteers, event managers, and administrators, each with clearly defined permissions.",
    image: placeholder,
  },
  {
    title: "Notification System",
    description:
      "Receive real-time notifications for registration approvals, event updates, and completion status through the web platform.",
    image: placeholder,
  },
  {
    title: "Dashboard & Analytics",
    description:
      "View summarized insights such as upcoming events, active discussions, and popular activities through an intuitive dashboard.",
    image: placeholder,
  },
  {
    title: "Data Export & Administration",
    description:
      "Administrators can manage users, moderate events, and export system data in CSV or JSON format for reporting and analysis.",
    image: placeholder,
  },
  {
    title: "Search & Filter Events",
    description:
      "Volunteers can quickly find suitable events using search and filtering options based on time, category, location, or event status.",
    image: placeholder,
  },
];

const featureList: string[] = [
  "Event Creation & Management",
  "Volunteer Registration",
  "Participation Tracking",
  "Event Discussion Channels",
  "Role-Based Access Control",
  "Real-Time Notifications",
  "Dashboard & Analytics",
  "Data Export & Administration",
  "Search & Filter Events",
];

export const Features = () => {
  return (
    <section
      id="features"
      className="container py-24 sm:py-32 space-y-8"
    >
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Powerful{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Features
        </span>
      </h2>

      <div className="flex flex-wrap md:justify-center gap-4">
        {featureList.map((feature: string) => (
          <div key={feature}>
            <Badge variant="secondary" className="text-sm">
              {feature}
            </Badge>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(({ title, description, image }: FeatureProps) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>

            <CardContent>{description}</CardContent>

            <CardFooter>
              {image && (
                <img
                  src={image}
                  alt="Feature illustration"
                  className="w-[200px] lg:w-[300px] mx-auto"
                />
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};
