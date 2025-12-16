import { Statistics } from "./Statistics";
import pilot from "./assets/hand.png";

export const About = () => {
  return (
    <section
      id="about"
      className="container py-24 sm:py-32"
    >
      <div className="bg-muted/50 border rounded-lg py-12">
        <div className="px-6 flex flex-col-reverse md:flex-row gap-8 md:gap-12">
          <img
            src={pilot}
            alt=""
            className="w-[300px] object-contain rounded-lg"
          />
          <div className="bg-green-0 flex flex-col justify-between">
            <div className="pb-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                  About{" "}
                </span>
                Signlish
              </h2>
              <p className="text-xl text-muted-foreground mt-4">
                Signlish is a modern platform designed to make learning sign language easier, faster, and more accessible for everyone. With interactive lessons, clear visual demonstrations, and powerful technologies, Signlish helps learners build strong signing skills step by step. Whether you're a beginner or looking to improve your communication abilities, Signlish provides a simple and effective way to explore the world of sign language anytime, anywhere.
              </p>
            </div>

            <Statistics />
          </div>
        </div>
      </div>
    </section>
  );
};
