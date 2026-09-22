import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

const features = [
  "Direct auto export from Tokyo, Yokohama, Nagoya & Kobe ports",
  "Full translation of official Japanese auction inspection sheets",
  "100% Pre-shipment odometer verification & roadworthiness checks",
  "Worldwide RoRo and container shipping with marine insurance",
  "Transparent FOB and CIF pricing with zero hidden surcharges",
];

const WelcomeSection = () => {
  return (
    <section className="py-12 bg-secondary/50 -mx-4 px-4 lg:-mx-8 lg:px-8 rounded-xl my-6" id="about">
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <span className="text-primary font-medium text-xs sm:text-sm uppercase tracking-wider">
            Licensed Japanese Exporter
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-4">
            Your Trusted Partner for <span className="text-primary">Auto Imports from Japan</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4 text-sm sm:text-base">
            Neo Trading Co., Ltd is an established Japanese vehicle exporter responding to the global 
            demand for high-grade Japanese vehicles. Headquartered in Tokyo, our company operates 
            within Japan's largest vehicle acquisition franchises and holds direct bidding access 
            to over 150+ auction houses nationwide.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6 text-sm sm:text-base">
            Whether you are importing a legendary JDM sports car, a fuel-efficient hybrid, a versatile Kei truck, 
            or commercial machinery, we handle every stage—from auction bidding and physical inspections to 
            Ministry deregistration, customs clearance, and port delivery.
          </p>
          <ul className="space-y-2.5 mb-6">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-foreground text-xs sm:text-sm font-medium">
                <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Link to="/about-us">
                About Neo Trading
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/resources">
                Import Guides
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-video rounded-xl overflow-hidden card-shadow">
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop"
              alt="Japanese car auction hall and vehicle inspection in Japan"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent flex items-end p-6">
              <div className="text-primary-foreground">
                <p className="font-display font-bold text-xl">Official Tokyo Auction Member</p>
                <p className="text-sm opacity-90">150+ Auction Houses Across Japan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
