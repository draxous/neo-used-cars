import { Link } from "react-router-dom";
import { Search, FileSearch, Gavel, FileCheck, Ship, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    title: "1. Select or Request",
    description:
      "Choose from our inspected physical stock or tell us your target vehicle specs to source directly from over 150+ Japanese auto auction halls.",
  },
  {
    icon: FileSearch,
    title: "2. Sheet Translation",
    description:
      "We provide comprehensive, certified translations of the Japanese auction inspection sheet, checking grade (3.5–5), body marks, and mechanical notes.",
  },
  {
    icon: Gavel,
    title: "3. Direct Bidding",
    description:
      "You specify your ceiling price in USD. We bid on your behalf in Tokyo. If we win under your limit, you keep the savings. Zero fees if unsuccessful.",
  },
  {
    icon: FileCheck,
    title: "4. Inspection & Export Papers",
    description:
      "We handle vehicle de-registration with the Japanese MLIT, issue the official Export Certificate, and arrange JEVIC, JAAI, or QISJ inspections.",
  },
  {
    icon: Ship,
    title: "5. Ocean Shipping & Tracking",
    description:
      "Your car is booked on the next available RoRo or container vessel with marine insurance. Original documents are couriered straight to you for customs clearance.",
  },
];

const AutoImportsGuideSection = () => {
  return (
    <section className="py-14 bg-gradient-to-b from-card to-secondary/30 rounded-2xl border border-border my-10 p-6 lg:p-10 shadow-sm">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Simple & Transparent Process
        </span>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mt-3 mb-4">
          How Auto Imports from Japan Work
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Importing a vehicle directly from Japan has never been easier. We eliminate the middlemen, 
          verify every mechanical detail, and manage the entire logistics chain from Japan to your local port.
        </p>
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
        {steps.map((step) => (
          <div
            key={step.title}
            className="bg-card border border-border/80 rounded-xl p-5 hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl hero-gradient text-primary-foreground flex items-center justify-center mb-4 shadow-sm">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-foreground text-base mb-2">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-background rounded-xl border border-border">
        <div>
          <h4 className="font-display font-semibold text-foreground text-sm sm:text-base">
            Want to learn more about auction grading & country rules?
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Read our in-depth guides on FOB vs CIF, auction sheets, and compliance.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/resources">
              View Import Guides
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 gap-1.5">
            <Link to="/inquiry">
              Request Free Quote
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AutoImportsGuideSection;
