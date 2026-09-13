import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, HelpCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

/**
 * Guides we intend to publish. These are listed as upcoming rather than linked,
 * so nothing here pretends to be an article that doesn't exist yet.
 */
const plannedGuides = [
  "How to import a car from Japan, step by step",
  "Reading a Japanese auction sheet",
  "FOB vs CIF: what you actually pay",
  "RoRo vs container shipping — which to choose",
  "Import rules by country: age and emissions limits",
  "What the auction grades really mean",
];

const Resources = () => {
  return (
    <Layout>
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
            Resources & <span className="text-primary">Guides</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Practical guidance on importing a vehicle from Japan — what it costs, how long it takes,
            and what you need to know before you commit.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <Link
            to="/faq"
            className="bg-card rounded-xl card-shadow hover:card-shadow-hover transition-all p-6 group"
          >
            <HelpCircle className="h-8 w-8 text-accent mb-3" />
            <h2 className="font-display font-bold text-xl text-foreground group-hover:text-primary transition-colors">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Payment, shipping times, documents, auction grades — the questions importers ask most.
            </p>
            <span className="inline-flex items-center gap-1 text-sm text-primary mt-4 font-medium">
              Read the FAQ <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link
            to="/auctions"
            className="bg-card rounded-xl card-shadow hover:card-shadow-hover transition-all p-6 group"
          >
            <BookOpen className="h-8 w-8 text-accent mb-3" />
            <h2 className="font-display font-bold text-xl text-foreground group-hover:text-primary transition-colors">
              How auction buying works
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              The full process, from telling us what you want through to delivery at your port.
            </p>
            <span className="inline-flex items-center gap-1 text-sm text-primary mt-4 font-medium">
              See the process <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        <div className="bg-secondary/60 rounded-xl p-6">
          <h2 className="font-display font-bold text-xl text-foreground mb-2">
            Guides coming soon
          </h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
            We're writing these now. If you need an answer before one is published, just ask us
            directly — we'd rather answer than have you guess.
          </p>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 mb-6">
            {plannedGuides.map((guide) => (
              <li key={guide} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                {guide}
              </li>
            ))}
          </ul>
          <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
            <Link to="/inquiry">
              Ask us a question
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    </Layout>
  );
};

export default Resources;
