import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Facebook, Instagram, Linkedin } from "lucide-react";

interface TeamProps {
  imageUrl: string;
  name: string;
  position: string;
  description: string;
  socialNetworks: SociaNetworkslProps[];
}

interface SociaNetworkslProps {
  name: string;
  url: string;
}

const teamList: TeamProps[] = [
  {
    imageUrl:
      "https://bom.edu.vn/public/upload/2024/12/anime-nam-cute-chibi-3.webp",
    name: "Viet Anh",
    position: "Member",
    description:
      "Architects core systems, leads technical decisions, and ensures the platform stays scalable and efficient.",
    socialNetworks: [
      { name: "Linkedin", url: "https://www.linkedin.com" },
      { name: "Facebook", url: "https://www.facebook.com/" },
      { name: "Instagram", url: "https://www.instagram.com/" },
    ],
  },
  {
    imageUrl:
      "https://bom.edu.vn/public/upload/2024/12/chibi-nam-ngau-3.webp",
    name: "Chi Cong",
    position: "Member",
    description:
      "Develops core application logic and ensures seamless communication between services and the database.",
    socialNetworks: [
      { name: "Linkedin", url: "https://www.linkedin.com/" },
      { name: "Facebook", url: "https://www.facebook.com/" },
    ],
  },
  {
    imageUrl:
      "https://bom.edu.vn/public/upload/2024/12/anime-nam-cute-chibi-5.webp",
    name: "Thanh Dat",
    position: "Member",
    description:
      "Optimizes backend operations, improves system scalability, and supports the development of new features.",
    socialNetworks: [
      { name: "Linkedin", url: "https://www.linkedin.com" },
      { name: "Facebook", url: "https://www.facebook.com/" },
    ],
  },
];

export const Team = () => {
  const socialIcon = (iconName: string) => {
    switch (iconName) {
      case "Linkedin":
        return <Linkedin size="20" />;
      case "Facebook":
        return <Facebook size="20" />;
      case "Instagram":
        return <Instagram size="20" />;
    }
  };

  return (
    <section id="team" className="container py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-bold text-center">
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Our Dedicated{" "}
        </span>
        Crew
      </h2>

      <p className="mt-4 mb-10 text-xl text-muted-foreground text-center max-w-2xl mx-auto">
        Our team is a group of passionate members working together to build a
        reliable and impactful volunteer management platform.
      </p>

      {/* GRID – căn giữa 3 card */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
        {teamList.map(
          ({ imageUrl, name, position, description, socialNetworks }) => (
            <Card
              key={name}
              className="bg-muted/50 relative mt-8 flex flex-col justify-center items-center mx-auto"
            >
              <CardHeader className="mt-8 flex flex-col items-center pb-2">
                <img
                  src={imageUrl}
                  alt={`${name} ${position}`}
                  className="absolute -top-12 rounded-full w-24 h-24 aspect-square object-cover"
                />
                <CardTitle className="text-center whitespace-nowrap">
                  {name}
                </CardTitle>
                <CardDescription className="text-primary whitespace-nowrap">
                  {position}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center pb-2">
                <p>{description}</p>
              </CardContent>

              <CardFooter>
                {socialNetworks.map(({ name, url }) => (
                  <a
                    key={name}
                    rel="noreferrer noopener"
                    href={url}
                    target="_blank"
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                    })}
                  >
                    <span className="sr-only">{name} icon</span>
                    {socialIcon(name)}
                  </a>
                ))}
              </CardFooter>
            </Card>
          )
        )}
      </div>
    </section>
  );
};
