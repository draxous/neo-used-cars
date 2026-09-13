import Layout from "@/components/Layout";
import InquiryBox from "@/components/InquiryBox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How do I buy a car from Neo?",
    a: "Send us an inquiry with the vehicle you want, or pick one from our stock list. We reply with a full quote including shipping to your nearest port. Once you approve it and payment clears, we handle inspection, export paperwork and booking.",
  },
  {
    q: "What is the difference between FOB and CIF pricing?",
    a: "FOB (Free On Board) is the price of the vehicle loaded onto the ship in Japan. CIF (Cost, Insurance and Freight) adds ocean freight and marine insurance to your destination port. Prices shown on our stock pages are FOB — we quote CIF once we know your port.",
  },
  {
    q: "How long does shipping take?",
    a: "It depends on the destination and whether the route is RoRo or container. As a rough guide: 3–4 weeks to South East Asia, 4–6 weeks to East Africa, 6–8 weeks to the Caribbean and South America. We confirm an estimated arrival with your quote.",
  },
  {
    q: "What documents will I receive?",
    a: "Export Certificate (de-registration document) with an English translation, Bill of Lading, and the commercial invoice. If your country requires pre-shipment inspection such as JEVIC or QISJ, we arrange it and forward the certificate.",
  },
  {
    q: "What does the auction grade mean?",
    a: "Japanese auctions grade vehicles from roughly 3.5 (visible wear) to 5 (near new), with R or RA meaning previously repaired. The letter grade covers the interior, from A down to D. We translate the full auction sheet for you before you commit.",
  },
  {
    q: "Can I buy a car that is not in your stock list?",
    a: "Yes — that is most of what we do. Tell us the make, model, year and budget, and we will source it from the Japanese auctions on your behalf. See our auction page for how the process works.",
  },
  {
    q: "How do I pay?",
    a: "Payment is by telegraphic transfer to our company bank account in Japan. We issue a proforma invoice with full banking details. We do not ask for payment to personal accounts — if you ever receive such a request, contact us directly to verify.",
  },
  {
    q: "Do you ship to my country?",
    a: "We export worldwide. Some countries restrict vehicle age, steering side or emissions standard, so tell us your destination early and we will confirm what you are allowed to import before you commit to anything.",
  },
];

const Faq = () => {
  return (
    <Layout>
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
            Frequently Asked <span className="text-primary">Questions</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Everything importers usually ask before their first purchase. If your question isn't
            here, just ask us.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
          <Accordion type="single" collapsible className="bg-card rounded-xl card-shadow px-6">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.q} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-display font-semibold hover:text-primary">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <InquiryBox className="lg:sticky lg:top-28" />
        </div>
      </main>
    </Layout>
  );
};

export default Faq;
