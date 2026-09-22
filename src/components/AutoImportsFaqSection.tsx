import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowRight } from "lucide-react";
import { homeFaqs } from "@/data/faqs";

const AutoImportsFaqSection = () => {
  return (
    <section className="py-14 my-10">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent-foreground text-xs sm:text-sm font-semibold rounded-full mb-3">
          <HelpCircle className="h-4 w-4 text-accent" />
          Got Questions?
        </div>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
          Auto Imports from Japan — FAQs
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base mt-2">
          Clear answers to common questions about buying, inspecting, shipping, and clearing Japanese vehicles.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Accordion type="single" collapsible className="bg-card rounded-2xl border border-border px-6 py-2 shadow-sm">
          {homeFaqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index}`} className="border-border">
              <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-primary py-4 text-base sm:text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-secondary/40 rounded-xl">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Have a question about specific paperwork, auction bidding, or duty fees?
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/faq">
                View Full FAQ
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
              <Link to="/inquiry">
                Ask Us Directly
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AutoImportsFaqSection;
