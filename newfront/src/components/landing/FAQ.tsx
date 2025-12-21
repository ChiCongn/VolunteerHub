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
    question: "Is Volunteer Hub free to use?",
    answer:
      "Yes. Volunteer Hub is completely free for volunteers and event managers. All core features such as event browsing, registration, volunteer management, and community interaction are available at no cost.",
    value: "item-1",
  },
  {
    question: "Who can use Volunteer Hub?",
    answer:
      "Volunteer Hub supports three main roles: volunteers who participate in events, event managers who organize and manage activities, and administrators who oversee the system and ensure smooth operation.",
    value: "item-2",
  },
  {
    question: "How do volunteers join events on Volunteer Hub?",
    answer:
      "Volunteers can browse available events, view detailed information, and register to participate. Event managers review registrations and confirm participation before the event takes place.",
    value: "item-3",
  },
  {
    question: "What is the event discussion channel?",
    answer:
      "Each approved event includes a dedicated discussion channel where participants can post updates, ask questions, and interact with other members, similar to a social media wall.",
    value: "item-4",
  },
  {
    question: "Can I track my volunteer participation history?",
    answer:
      "Yes. Volunteers can view their participation history, including registered events, completion status, and related updates directly from their dashboard.",
    value: "item-5",
  },
];

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
