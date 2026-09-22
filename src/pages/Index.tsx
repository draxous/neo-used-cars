import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import SearchFilters from "@/components/SearchFilters";
import MakersSidebar from "@/components/MakersSidebar";
import NewArrivals from "@/components/NewArrivals";
import WelcomeSection from "@/components/WelcomeSection";
import Testimonials from "@/components/Testimonials";
import InquiryBox from "@/components/InquiryBox";
import SEOHead from "@/components/SEOHead";
import AutoImportsGuideSection from "@/components/AutoImportsGuideSection";
import CountryComplianceSection from "@/components/CountryComplianceSection";
import AutoImportsFaqSection from "@/components/AutoImportsFaqSection";
import { homeFaqs } from "@/data/faqs";

const Index = () => {
  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["AutoDealer", "AutomotiveBusiness"],
        "name": "Neo Trading Co., Ltd",
        "alternateName": "Neo Auto Imports from Japan",
        "url": "https://neojapancars.com/",
        "logo": "https://neojapancars.com/logo.svg",
        "image": "https://neojapancars.com/og-image.jpg",
        "description": "Leading Japanese used vehicle exporter specializing in direct auto imports from Japan, Tokyo auction sourcing, and worldwide shipping.",
        "telephone": "+81-80-9718-5080",
        "email": "neollcjp@gmail.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Higashikomatsugawa 1-12-1",
          "addressLocality": "Edogawa",
          "addressRegion": "Tokyo",
          "postalCode": "132-0014",
          "addressCountry": "JP"
        },
        "priceRange": "$$ - $$$",
        "areaServed": "Worldwide"
      },
      {
        "@type": "FAQPage",
        "mainEntity": homeFaqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <Layout>
      <SEOHead
        title="Auto Imports from Japan | Direct Japanese Used Car Exporter - Neo Trading"
        description="Specialists in direct auto imports from Japan. Sourcing certified Japanese used cars, JDM sports cars, trucks, and SUVs from 150+ live auctions. Transparent CIF/FOB pricing and worldwide shipping."
        keywords="auto imports from japan, import cars from japan, japanese auto exporter, JDM imports, japanese car auction agent, direct auto export japan, japanese used cars, buy cars from japan, JDM sports cars, kei trucks"
        canonicalUrl="https://neojapancars.com/"
        jsonLd={homeSchema}
      />

      <HeroSection />

      {/* Mobile counterpart to the hero inquiry box */}
      <section className="lg:hidden bg-secondary/50 py-8 px-4">
        <InquiryBox className="mx-auto" />
      </section>

      <SearchFilters />

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <div className="hidden lg:block">
            {/* Top makes in stock; each one runs a search filtered to it. */}
            <MakersSidebar limit={15} linkTo="search" />
          </div>
          <div>
            <NewArrivals />
            <AutoImportsGuideSection />
            <WelcomeSection />
            <CountryComplianceSection />
            <AutoImportsFaqSection />
            <Testimonials />
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Index;
