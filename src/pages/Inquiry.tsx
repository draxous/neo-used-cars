import { useSearchParams } from "react-router-dom";
import { Mail, MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import Layout from "@/components/Layout";
import InquiryForm from "@/components/InquiryForm";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { formatAuctionDate, getCarById } from "@/data/cars";
import SEOHead from "@/components/SEOHead";

const Inquiry = () => {
  // Arriving from a stock card ("Inquire") or an auction lot ("Bid for me").
  const [params] = useSearchParams();
  const reference = params.get("lot") ?? params.get("stock");
  const car = reference ? getCarById(reference) : undefined;
  const lot = car?.auction;

  return (
    <Layout>
      <SEOHead
        title="Contact Us & Request CIF Quote | Auto Imports from Japan - Neo Trading"
        description="Request a free CIF shipping quote or ask about auction bidding and auto imports from Japan. Fast 24-hour response from our Tokyo office."
        keywords="contact neo trading, car import quote japan, auto imports from japan quote, japanese vehicle export inquiry"
        canonicalUrl="/inquiry"
      />
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
            Contact <span className="text-primary">Us</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Tell us what you're looking for and our team will get back to you within 24 hours.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[1fr_420px] gap-10 items-start">
          {/* Contact details */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl card-shadow p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-5">
                Our <span className="text-primary">Office</span>
              </h2>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{siteConfig.address}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-accent flex-shrink-0" />
                  <a
                    href={`tel:+${siteConfig.phoneRaw}`}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {siteConfig.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-accent flex-shrink-0" />
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="text-foreground hover:text-primary transition-colors break-all"
                  >
                    {siteConfig.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">
                    Monday – Saturday, 9:00 – 18:00 Japan Standard Time
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-secondary/60 rounded-xl p-6">
              <h3 className="font-display font-semibold text-foreground mb-2">
                Prefer to message us?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                We're on WhatsApp during Tokyo office hours — message us directly for immediate stock inquiries and landed CIF estimates.
              </p>
              <Button
                asChild
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold gap-2 shadow-sm"
              >
                <a
                  href={`https://wa.me/${siteConfig.phoneRaw}?text=${encodeURIComponent(
                    car
                      ? `Hello Neo Trading! I want to inquire about the ${car.year} ${car.make} ${car.model} (Stock ID: ${car.id}).`
                      : "Hello Neo Trading! I'm interested in importing a car from Japan. Please assist me."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp Now
                </a>
              </Button>
            </div>
          </div>

          {/* Full inquiry form */}
          <div className="bg-card rounded-xl card-shadow-hover p-6">
            <h2 className="font-display font-bold text-2xl text-foreground mb-1">
              Send an <span className="text-primary">Inquiry</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              {lot
                ? `We'll bid for you on lot ${lot.lotNumber} at ${lot.house} on ${formatAuctionDate(lot.date)} — tell us your maximum.`
                : car
                  ? `About stock ${car.id}. The more detail you give, the more accurate our quote.`
                  : "The more detail you give, the more accurate our quote."}
            </p>
            <InquiryForm variant="full" defaultMake={car?.make ?? ""} defaultModel={car?.model ?? ""} />
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Inquiry;
