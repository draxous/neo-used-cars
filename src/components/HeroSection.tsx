import heroImage from "@/assets/hero-cars.jpg";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import InquiryBox from "./InquiryBox";

const HeroSection = () => {
  return (
    <section className="relative min-h-[500px] lg:min-h-[680px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-foreground/30" />
      </div>

      <div className="relative container mx-auto px-4 py-12 lg:py-16 min-h-[500px] lg:min-h-[680px] grid lg:grid-cols-[1fr_400px] items-center gap-10">
        <div className="max-w-xl text-primary-foreground animate-slide-up">
          <span className="inline-block px-4 py-1.5 bg-accent text-accent-foreground text-sm font-medium rounded-full mb-4">
            Premium Quality Vehicles
          </span>
          <h2 className="font-display text-4xl lg:text-6xl font-bold mb-4 leading-tight">
            Japanese Used Cars
            <span className="block text-accent">Worldwide Export</span>
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Discover high-quality Japanese vehicles at competitive prices. Direct export from Japan to your destination.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
              <Link to="/search">
                <Search className="h-5 w-5" />
                Search Cars
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 gap-2">
              <Link to="/auctions">
                View Auctions
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Inquiry box — top right on desktop, rendered as its own section on mobile */}
        <InquiryBox className="hidden lg:block justify-self-end" />
      </div>
    </section>
  );
};

export default HeroSection;
