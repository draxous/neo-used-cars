import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AnnouncementBar from "./AnnouncementBar";
import TopBar from "./TopBar";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";

/** Shared chrome for every page: announcement, top bar, header, footer, WhatsApp button. */
const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();

  // Route changes should start at the top, not keep the previous scroll offset.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnnouncementBar />
      <TopBar />
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Layout;
