import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { cars, getMakes, isListed } from "@/data/cars";
import SEOHead from "@/components/SEOHead";

const values = [
  "Direct export from Japan — no middlemen",
  "Every vehicle inspected before it ships",
  "Transparent FOB and CIF pricing",
  "Export paperwork handled end to end",
  "Worldwide shipping to your nearest port",
];

const AboutUs = () => {
  const stats = [
    { value: `${cars.filter(isListed).length}+`, label: "Vehicles in stock" },
    { value: `${getMakes().length}`, label: "Makes available" },
    { value: "Tokyo", label: "Based in Japan" },
    { value: "24h", label: "Inquiry response" },
  ];

  return (
    <Layout>
      <SEOHead
        title="About Neo Trading | Japanese Used Car Exporter in Tokyo, Japan"
        description="Learn about Neo Trading Co., Ltd, Tokyo-based vehicle exporter. Member of 150+ Japanese car auctions, certified inspections, and direct auto imports from Japan worldwide."
        keywords="about neo trading, japanese car exporter tokyo, auto imports from japan, japan used car company"
        canonicalUrl="/about-us"
      />
      <section className="hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-14">
          <h1 className="font-display text-3xl lg:text-5xl font-bold">About Neo Trading</h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl text-lg">
            We export high-quality Japanese used vehicles to buyers around the world — directly,
            transparently, and without the guesswork.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-10 items-center mb-14">
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Who we are
            </span>
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mt-2 mb-4">
              Japanese cars, delivered <span className="text-primary">worldwide</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Neo Trading Co., Ltd is responding to the increasing demand for Japanese used cars in
              many countries all over the world, and exports high-quality used cars directly from
              Japan. Our company operates a franchise of the largest Japanese used car acquisition
              franchises in Japan.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              That access means we can buy well — from dealer stock and from the auction houses —
              and pass a fair price on to you, with the condition of every unit documented before
              you commit.
            </p>
            <ul className="space-y-3 mb-6">
              {values.map((value) => (
                <li key={value} className="flex items-start gap-3 text-foreground">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  {value}
                </li>
              ))}
            </ul>
            <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
              <Link to="/inquiry">
                Get in touch
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="aspect-video rounded-xl overflow-hidden card-shadow relative">
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=500&fit=crop"
              alt="Japanese vehicle auction hall"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent flex items-end p-6">
              <div className="text-primary-foreground">
                <p className="font-display font-bold text-xl">Official Partner</p>
                <p className="text-sm opacity-80">Japanese Auction Network</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl card-shadow p-6 text-center">
              <p className="font-display text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
};

export default AboutUs;
