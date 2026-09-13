import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import SearchFilters from "@/components/SearchFilters";
import MakersSidebar from "@/components/MakersSidebar";
import NewArrivals from "@/components/NewArrivals";
import WelcomeSection from "@/components/WelcomeSection";
import Testimonials from "@/components/Testimonials";
import InquiryBox from "@/components/InquiryBox";

const Index = () => {
  return (
    <Layout>
      <HeroSection />

      {/* Mobile counterpart to the hero inquiry box */}
      <section className="lg:hidden bg-secondary/50 py-8 px-4">
        <InquiryBox className="mx-auto" />
      </section>

      <SearchFilters />

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <div className="hidden lg:block">
            <MakersSidebar />
          </div>
          <div>
            <NewArrivals />
            <WelcomeSection />
            <Testimonials />
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Index;
