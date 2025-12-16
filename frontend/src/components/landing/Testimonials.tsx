import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TestimonialProps {
  image: string;
  name: string;
  userName: string;
  comment: string;
}

const testimonials: TestimonialProps[] = [
  {
    image: "https://github.com/shadcn.png",
    name: "Emily Carter",
    userName: "@emily_c",
    comment: "Signlish helps me learn signs quickly. So easy to use!",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Marcus Hill",
    userName: "@marcus_hill",
    comment: "Vision Mode is super convenient and really fun.",
  },

  {
    image: "https://github.com/shadcn.png",
    name: "Sophia Nguyen",
    userName: "@sophia_n",
    comment:
      "The interface is incredibly intuitive, and I love how each feature is designed to support beginners. The quizzes and flashcards work perfectly together, making it so much easier to remember signs and review what I’ve learned.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "David Brooks",
    userName: "@david_brooks",
    comment:
      "The two-way translation is amazing — being able to translate between English and sign language instantly feels magical. Combined with the built-in dictionary and clean UI, Signlish has genuinely improved how I study and practice every day.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Lily Harper",
    userName: "@lily_harper",
    comment: "The streak system keeps me learning daily!",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Ethan Morales",
    userName: "@ethan_m",
    comment: "Highly recommend for beginners in sign language.",
  },
];



export const Testimonials = () => {
  return (
    <section
      id="testimonials"
      className="container py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold">
        Discover Why
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {" "}
          People Love{" "}
        </span>
        Signlish
      </h2>

      <p className="text-xl text-muted-foreground pt-4 pb-8">
        How Signlish creates value for the community
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 sm:block columns-2  lg:columns-3 lg:gap-6 mx-auto space-y-4 lg:space-y-6">
        {testimonials.map(
          ({ image, name, userName, comment }: TestimonialProps) => (
            <Card
              key={userName}
              className="max-w-md md:break-inside-avoid overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage
                    alt=""
                    src={image}
                  />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <CardTitle className="text-lg">{name}</CardTitle>
                  <CardDescription>{userName}</CardDescription>
                </div>
              </CardHeader>

              <CardContent>{comment}</CardContent>
            </Card>
          )
        )}
      </div>
    </section>
  );
};
