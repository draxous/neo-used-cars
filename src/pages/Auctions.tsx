import { Link } from "react-router-dom";
import { ArrowRight, Gavel, Languages, Ship, Search, Wallet } from "lucide-react";
import Layout from "@/components/Layout";
import InquiryBox from "@/components/InquiryBox";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const steps = [
  {
    icon: Search,
    title: "Tell us what you want",
    body: "Send us the make, model, year and budget you're after. We confirm what's realistic in the current market.",
  },
  {
    icon: Languages,
    title: "We search the auctions",
    body: "We search Japan's auction houses on your behalf and translate the auction sheet so you know the real condition.",
  },
  {
    icon: Gavel,
    title: "We bid for you",
    body: "You set a maximum price. We bid on your behalf and never go above your limit.",
  },
  {
    icon: Wallet,
    title: "You pay on success",
    body: "If we win, you pay the invoice. If we don't, you pay nothing and we try the next auction.",
  },
  {
    icon: Ship,
    title: "We ship it to you",
    body: "Inspection, de-registration, export paperwork and booking to your nearest port — all handled.",
  },
];

const Auctions = () => {
  return (
    <Layout>
      <SEOHead
        title="Japanese Car Auction Agent | Direct Auto Imports from Japan - Neo Trading"
        description="Bid directly on 150+ Japanese car auctions (USS, TAA, CAA, JU). Professional auction sheet translation, pre-bid inspection, and worldwide export shipping."
        keywords="japanese car auction, USS auction japan, buy car from japan auction, auto imports from japan, TAA auction, JDM auction agent, japan vehicle auction"
        canonicalUrl="/auctions"
      />
      <section className="hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-14">
          <span className="inline-block px-4 py-1.5 bg-accent text-accent-foreground text-sm font-medium rounded-full mb-4">
            Auction Sourcing
          </span>
          <h1 className="font-display text-3xl lg:text-5xl font-bold max-w-3xl">
            Buy directly from Japanese car auctions
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl text-lg">
            Around 100,000 vehicles pass through Japan's auction houses every week. We bid on
            your behalf, translate the auction sheet, and handle everything through to delivery.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <Link to="/search?type=auction">
              <Gavel className="h-5 w-5" />
              Browse upcoming lots
            </Link>
          </Button>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
          <div>
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
              How auction buying <span className="text-primary">works</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              You don't need a Japanese dealer licence or an account with the auction houses — that's
              what we're for.
            </p>

            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="bg-card rounded-xl card-shadow p-5 flex gap-4 items-start"
                >
                  <div className="w-11 h-11 rounded-lg hero-gradient flex items-center justify-center flex-shrink-0">
                    <step.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">
                      <span className="text-primary mr-2">{index + 1}.</span>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 bg-secondary/60 rounded-xl p-6">
              <h3 className="font-display font-semibold text-foreground mb-2">
                Prefer something available right now?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Auction sourcing takes time. Our in-stock vehicles are already inspected and ready
                to ship.
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
                <Link to="/stock-cars">
                  Browse Stock
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <InquiryBox className="lg:sticky lg:top-28" />
        </div>
      </main>
    </Layout>
  );
};

export default Auctions;
