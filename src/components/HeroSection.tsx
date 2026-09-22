import heroImage from "@/assets/hero-cars.jpg";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, ShieldCheck, Ship, Gavel } from "lucide-react";
import InquiryBox from "./InquiryBox";

const HeroSection = () => {
  return (
    <section className="relative min-h-[520px] lg:min-h-[700px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
      </div>

      <div className="relative container mx-auto px-4 py-12 lg:py-16 min-h-[520px] lg:min-h-[700px] grid lg:grid-cols-[1fr_420px] items-center gap-10">
        <div className="max-w-2xl text-primary-foreground animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-accent/90 text-accent-foreground text-xs sm:text-sm font-semibold rounded-full mb-4 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            Direct Exporter in Tokyo, Japan
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-[1.15] tracking-tight">
            Auto Imports from Japan
            <span className="block text-accent font-bold mt-1 text-3xl sm:text-4xl lg:text-5xl">
              Direct Japanese Car Exporter
            </span>
          </h1>

          <p className="text-base sm:text-lg text-primary-foreground/90 mb-6 leading-relaxed max-w-xl">
            Buy certified Japanese used vehicles, JDM sports cars, commercial Kei trucks, and family SUVs directly 
            from Japan. Access 150+ live auctions with translated inspection sheets, transparent CIF/FOB pricing, 
            and worldwide port delivery.
          </p>

          {/* Quick trust metrics */}
          <div className="grid grid-cols-3 gap-3 mb-8 max-w-lg border-y border-primary-foreground/20 py-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Gavel className="h-4 w-4 text-accent flex-shrink-0" />
              <span>150+ Auction Halls</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent flex-shrink-0" />
              <span>Pre-Shipment Check</span>
            </div>
            <div className="flex items-center gap-2">
              <Ship className="h-4 w-4 text-accent flex-shrink-0" />
              <span>Worldwide Shipping</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-2 shadow-lg">
              <Link to="/search">
                <Search className="h-5 w-5" />
                Search Stock Cars
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-primary-foreground/15 border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/25 font-semibold gap-2">
              <Link to="/auctions">
                Auction Bidding
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Inquiry box — top right on desktop, rendered as its own section on mobile */}
        <InquiryBox className="hidden lg:block justify-self-end w-full" />
      </div>
    </section>
  );
};

export default HeroSection;
