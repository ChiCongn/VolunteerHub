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
    title: "Choose Your Lesson",
    description:
      "Start by selecting the topic you want to learn from basic signs to practical everyday communication.Every lesson is clear, visual, and designed for both beginners and experienced learners.",  
},
  {
    icon: <MapIcon />,
    title: "Practice & Receive Feedback",
    description:
      "As you practice, the system analyzes your hand shape, movement, speed, and accuracy: Highlights incorrect gestures Provides instant suggestions Helps you refine your signing skills with each attempt.",
  },
  {
    icon: <PlaneIcon />,
    title: "Track Your Learning Progress",
    description:
      "Signlish automatically saves your entire learning journey: Completed lessons Performance stats Improvement over time You can easily review past lessons and see how far you’ve come.",
  },
  {
    icon: <GiftIcon />,
    title: "Learn Anytime, Anywhere",
    description:
      "Signlish works on any device — phone, laptop, or tablet. Study anytime you want with unlimited lessons and unlimited learning opportunities. No restrictions, just pure learning freedom.",
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="howItWorks"
      className="container text-center py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold ">
        How{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Signlish{" "}
        </span>
        Helps You Learn Sign Language
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
        Discover how Signlish uses advanced technology to help you learn sign language faster, easier, and more effectively.
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
