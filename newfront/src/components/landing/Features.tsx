import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import image4 from "./assets/looking-ahead.png";
import topics from "./assets/topics.png";
import flashcard from "./assets/flashcard.png";
import computervision from "./assets/computervision.png";
import choice from "./assets/choice.png";
import translate from "./assets/translate.png";
import dic from "./assets/dictionary.png";

interface FeatureProps {
  title: string;
  description: string;
  image: string;
}

const features: FeatureProps[] = [
  {
    title: "Learning Mode by Topics",
    description:
      "Learn sign language vocabulary through well-structured topics. Each lesson is designed to help you master signs quickly and confidently.",
    image: topics,
  },
  {
    title: "Flashcards for Quick Practice",
    description:
      "Reinforce your memory with beautifully designed flashcards. Perfect for quick revisions and building long-term retention.",
    image: flashcard,
  },
  {
    title: "Vision Mode with Real-Time Recognition",
    description:
      "Practice signs using AI-powered gesture recognition. Receive instant feedback on your hand shape, movement, and accuracy.",
    image: computervision,
  },
  {
    title: "Multiple Choice Quizzes",
    description:
      "Test your understanding through interactive quizzes. Improve comprehension and track your mastery of each topic.",
    image: choice,
  },
  {
    title: "Two-Way Translation",
    description:
      "Translate seamlessly between English and sign language. A fast and intuitive tool for learners of all levels.",
    image: translate,
  },
  {
    title: "Built-in Sign Language Dictionary",
    description:
      "Access a complete sign language dictionary with detailed explanations, examples, and visual demonstrations.",
    image: dic,
  },
];


const featureList: string[] = [
  "Learning Mode by Vocabulary Topics",
  "Flashcards for Quick Practice",
  "Vision Mode with Real-Time Gesture Recognition",
  "Multiple Choice Quizzes",
  "Two-Way Translation: English and Sign Language",
  "Built-in Sign Language Dictionary",
  "Daily Streak and Progress Tracking",
];


export const Features = () => {
  return (
    <section
      id="features"
      className="container py-24 sm:py-32 space-y-8"
    >
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Many{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Great Features
        </span>
      </h2>

      <div className="flex flex-wrap md:justify-center gap-4">
        {featureList.map((feature: string) => (
          <div key={feature}>
            <Badge
              variant="secondary"
              className="text-sm"
            >
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
              <img
                src={image}
                alt="About feature"
                className="w-[200px] lg:w-[300px] mx-auto"
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};
