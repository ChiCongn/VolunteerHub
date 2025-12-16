import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    "question": "Is Signlish completely free to use?",
    "answer": "Yes! Signlish offers a fully free learning experience, allowing you to explore core features without any cost. You can learn, practice, and improve your sign language skills right away.",
    "value": "item-1"
  },
  {
    "question": "How does Signlish help improve my sign language skills?",
    "answer": "Signlish uses advanced AI-driven gesture recognition to analyze your hand shapes, movement accuracy, and facial expressions. It provides real-time feedback so you can learn faster and communicate more confidently.",
    "value": "item-2"
  },
  {
    "question": "Does Signlish support beginners with no prior sign language knowledge?",
    "answer": "Absolutely. Signlish is designed for all learners—from complete beginners to advanced users. Step-by-step tutorials, visual guides, and practice modules make it easy for anyone to start learning right away.",
    "value": "item-3"
  },
  {
    "question": "What technologies power Signlish’s learning platform?",
    "answer": "Signlish integrates cutting-edge AI models, computer vision, and motion-tracking technology to deliver accurate sign recognition and personalized recommendations tailored to your learning style.",
    "value": "item-4"
  },
  {
    "question": "Can Signlish be used for both education and daily communication practice?",
    "answer": "Yes. Whether you're preparing for exams, learning for school, or improving daily communication with the Deaf community, Signlish provides tools, exercises, and interactive lessons to support your goals.",
    "value": "item-5"
  }
]


export const FAQ = () => {
  return (
    <section
      id="faq"
      className="container py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Frequently Asked{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Questions
        </span>
      </h2>

      <Accordion
        type="single"
        collapsible
        className="w-full AccordionRoot"
      >
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem
            key={value}
            value={value}
          >
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h3 className="font-medium mt-4">
        Still have questions?{" "}
        <a
          rel="noreferrer noopener"
          href="#"
          className="text-primary transition-all border-primary hover:border-b-2"
        >
          Contact us
        </a>
      </h3>
    </section>
  );
};
