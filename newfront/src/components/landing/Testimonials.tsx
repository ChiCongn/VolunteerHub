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
    comment:
      "Volunteer Hub makes it incredibly easy to find meaningful volunteer activities and stay updated with event information.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Marcus Hill",
    userName: "@marcus_hill",
    comment:
      "I love how everything is organized in one place. Registering for events and tracking my participation is super convenient.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Sophia Nguyen",
    userName: "@sophia_n",
    comment:
      "The event discussion channels are a great feature. They help volunteers communicate, ask questions, and stay connected before and after events.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "David Brooks",
    userName: "@david_brooks",
    comment:
      "As an event manager, Volunteer Hub saves me a lot of time. Managing registrations, confirming volunteers, and tracking participation has never been this smooth.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Lily Harper",
    userName: "@lily_harper",
    comment:
      "The dashboard gives me a clear overview of upcoming events and activities I care about. Very intuitive and useful.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Ethan Morales",
    userName: "@ethan_m",
    comment:
      "Volunteer Hub creates a real sense of community. It’s more than just event management — it connects people who want to make a difference.",
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
          People Trust{" "}
        </span>
        Volunteer Hub
      </h2>

      <p className="text-xl text-muted-foreground pt-4 pb-8">
        How Volunteer Hub creates value for volunteers and event organizers
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 sm:block columns-2 lg:columns-3 lg:gap-6 mx-auto space-y-4 lg:space-y-6">
        {testimonials.map(
          ({ image, name, userName, comment }: TestimonialProps) => (
            <Card
              key={userName}
              className="max-w-md md:break-inside-avoid overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage alt="" src={image} />
                  <AvatarFallback>VH</AvatarFallback>
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
