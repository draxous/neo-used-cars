import Layout from "@/components/Layout";
import InquiryBox from "@/components/InquiryBox";
import SEOHead from "@/components/SEOHead";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How do auto imports from Japan work with Neo Trading?",
    a: "Auto imports from Japan with Neo involve 5 straightforward steps: 1) You choose a vehicle from our physical stock or specify what you want from Japan's live auctions; 2) We translate official inspection sheets and verify condition; 3) You approve the purchase or set your auction bidding limit; 4) We handle Japanese deregistration, obtain the Export Certificate, and conduct pre-export inspections (JEVIC, JAAI, QISJ); 5) We book RoRo or container ocean freight to your destination port and courier all original clearance documents directly to you.",
  },
  {
    q: "What is the difference between FOB and CIF pricing?",
    a: "FOB (Free On Board) includes the vehicle price, inland transport in Japan, export customs clearance, and port loading fees. CIF (Cost, Insurance and Freight) adds international ocean freight and marine cargo insurance all the way to your destination port. Prices shown on our stock list are FOB — we calculate and quote CIF once we know your destination port.",
  },
  {
    q: "Is it legal to import and drive right-hand drive (RHD) cars from Japan?",
    a: "Yes! In right-hand drive countries (UK, Ireland, Australia, New Zealand, Kenya, South Africa, Caribbean, Cyprus, etc.), Japanese imports are naturally road-compatible. In left-hand drive countries like the United States (under the 25-year rule) and Canada (under the 15-year rule), right-hand drive cars are 100% legal to import, register, and drive on public roads without requiring steering conversions.",
  },
  {
    q: "How does the US 25-Year Rule work for JDM auto imports?",
    a: "Under US NHTSA and EPA exemption regulations, any foreign motor vehicle that is at least 25 years old from its exact month and year of manufacture is fully exempt from Federal Motor Vehicle Safety Standards (FMVSS) and EPA emissions testing. This allows sought-after JDM legends (such as Nissan Skyline GT-R R32/R33/R34, Toyota Supra Mk4, Mazda RX-7 FD3S, Kei trucks) to be legally imported, titled, and insured in the USA.",
  },
  {
    q: "How do I know the Japanese import car odometer is genuine?",
    a: "Japan has the world's strictest anti-tampering regulations. The official Japanese Export Certificate (Yushutsu Massho) records the odometer readings from the last two mandatory government Shaken inspections. Furthermore, third-party pre-shipment inspections (such as JEVIC or QISJ) perform electronic and physical odometer verification before issuing an export roadworthiness certificate.",
  },
  {
    q: "Can I buy a car that is not in your stock list directly from auctions?",
    a: "Yes — auction sourcing represents a major part of what we do. Over 100,000 vehicles are auctioned across Japan every week (USS, TAA, CAA, JU, ARAI, etc.). Tell us your target model, year, grade, and budget, and we will monitor upcoming auctions, translate inspection sheets, and bid strictly within your authorized ceiling.",
  },
  {
    q: "How long does shipping take from Japan to my port?",
    a: "Transit times vary by region: roughly 2–3 weeks to Australia and New Zealand, 3–4 weeks to the US West Coast and Southeast Asia, 4–6 weeks to the United Kingdom, Europe, and East Africa (Mombasa/Dar es Salaam), and 6–8 weeks to the US East Coast and the Caribbean. We provide full vessel tracking upon sailing.",
  },
  {
    q: "What documents will I receive to clear customs?",
    a: "We courier the complete set of original documents needed for customs clearance: 1) Original Bill of Lading (B/L); 2) Official Japanese Export Certificate with certified English translation; 3) Commercial Invoice; 4) Pre-shipment inspection certificates (JEVIC, JAAI, EAA, or QISJ) if mandated by your country.",
  },
  {
    q: "What do the auction grades really mean?",
    a: "Japanese auctions grade vehicles from Grade 3 (rough/high mileage) up to Grade 5 (near mint) and S/6 (brand new). Grade 4.5 indicates an exceptionally clean, well-maintained vehicle. Grade R or RA indicates prior panel repair or accident history. Interior grades range from A (pristine) down to D. We provide a full translation of every line on the inspection sheet before you commit.",
  },
  {
    q: "How do I pay for my vehicle?",
    a: "Payment is settled by secure international telegraphic transfer (TT / wire transfer) directly to Neo Trading's official company bank account in Tokyo, Japan. We issue a formal proforma invoice with our verified corporate bank details. We never request payments to personal accounts or third-party money transfer apps.",
  },
  {
    q: "Do you ship to my country?",
    a: "We export worldwide to over 80 countries across North America, Europe, Africa, Asia, Oceania, and the Caribbean. Because every country has unique vehicle age and emissions rules, let us know your destination port early and we will verify complete import eligibility before you bid or purchase.",
  },
];

const Faq = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a,
      },
    })),
  };

  return (
    <Layout>
      <SEOHead
        title="Auto Imports from Japan FAQ | Bidding, Shipping, Taxes & Compliance - Neo Trading"
        description="Frequently asked questions about auto imports from Japan: auction bidding, FOB vs CIF costs, 25-year rule for the US, shipping durations, and required customs documents."
        keywords="auto imports from japan faq, import cars from japan questions, 25 year rule JDM, japanese car export questions, FOB vs CIF, japanese auction bidding"
        canonicalUrl="https://neojapancars.com/faq"
        jsonLd={faqSchema}
      />

      <section className="bg-card border-b border-border py-12">
        <div className="container mx-auto px-4">
          <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
            Help & Knowledge
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mt-3">
            Auto Imports from Japan — <span className="text-primary">FAQ</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm sm:text-base leading-relaxed">
            Everything importers ask before their first purchase. Find answers regarding auction bidding, 
            ocean freight, country regulations, and customs paperwork.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
          <Accordion type="single" collapsible className="bg-card rounded-2xl border border-border px-6 py-2 card-shadow">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.q} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="text-left font-display font-semibold hover:text-primary py-4 text-base sm:text-lg">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="lg:sticky lg:top-28 space-y-6">
            <InquiryBox />
            
            <div className="bg-secondary/40 p-5 rounded-xl border border-border">
              <h4 className="font-display font-semibold text-foreground text-sm mb-1">
                Still have an unanswered question?
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Send us your exact query or port requirements and our Tokyo team will reply within 24 hours.
              </p>
              <a
                href="mailto:neollcjp@gmail.com"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Email neollcjp@gmail.com &rarr;
              </a>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Faq;
