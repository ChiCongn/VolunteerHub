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
                Volunteer Hub
              </h2>
              <p className="text-xl text-muted-foreground mt-4">
                Volunteer Hub is a web-based platform that supports the
                organization and management of volunteer activities such as
                environmental campaigns, charity events, and community programs.
                The system connects volunteers, event managers, and administrators
                through a unified workspace, enabling event creation, volunteer
                registration, participation tracking, and real-time interaction
                via event-specific discussion channels. By centralizing volunteer
                coordination and communication, Volunteer Hub helps ensure that
                volunteer activities are managed efficiently, transparently, and
                at scale.
              </p>
            </div>

            <Statistics />
          </div>
        </div>
      </div>
    </section>
  );
};
