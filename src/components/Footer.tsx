import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import { collections, getMakes } from "@/data/cars";
import { siteConfig } from "@/config/site";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="hero-gradient text-primary-foreground mt-12" id="contact">
      <div className="container mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2">
            <Logo tone="onDark" size="md" className="mb-4" />
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-4">
              Neo Trading Co., Ltd is a premier Japanese vehicle exporter based in Tokyo, Japan, 
              specializing in direct auto imports from Japan, live auction bidding on 150+ auction houses, 
              certified pre-shipment inspections, and global shipping to over 80 countries.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Auto Imports</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/stock-cars" className="hover:text-accent transition-colors">Japanese Stock Cars</Link></li>
              <li><Link to="/auctions" className="hover:text-accent transition-colors">Japan Auction Bidding</Link></li>
              <li><Link to="/blog" className="hover:text-accent transition-colors">JDM & Import Blog</Link></li>
              <li><Link to="/resources" className="hover:text-accent transition-colors">Auto Import Guides</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors">Import FAQ</Link></li>
              <li><Link to="/about-us" className="hover:text-accent transition-colors">About Neo Trading</Link></li>
              <li><Link to="/inquiry" className="hover:text-accent transition-colors">Request CIF Quote</Link></li>
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-display font-semibold mb-4">Collections</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              {collections.map((collection) => (
                <li key={collection.slug}>
                  <Link
                    to={`/stock-cars/collection/${collection.slug}`}
                    className="hover:text-accent transition-colors"
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Makes */}
          <div>
            <h4 className="font-display font-semibold mb-4">Popular Makes</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              {getMakes().slice(0, 6).map((make) => (
                <li key={make.slug}>
                  <Link
                    to={`/stock-cars/${make.slug}`}
                    className="hover:text-accent transition-colors"
                  >
                    {make.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{siteConfig.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href={`tel:+${siteConfig.phoneRaw}`} className="hover:text-accent transition-colors">
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-accent transition-colors break-all">
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Neo Trading Co., Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
