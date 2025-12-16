import { About } from "./About";
import { FAQ } from "./FAQ";
import { Features } from "./Features";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { Team } from "./Team";
import { Testimonials } from "./Testimonials";
import { Newsletter } from "./Newsletter";
import { ScrollToTop } from "./ScrollToTop";

export default function LandingPage() {
    return (
        <div className="max-w-7xl mx-auto px-4">
            <Hero />
            <About />
            <HowItWorks />
            <Features />
            <Testimonials />
            <Team />
            <Newsletter />
            <FAQ />
            <ScrollToTop />
        </div>
    );
}
