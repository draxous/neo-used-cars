import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  HelpCircle,
  FileText,
  DollarSign,
  Ship,
  Globe2,
  CheckCircle2,
  AlertCircle,
  Search,
  ShieldCheck,
} from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Resources = () => {
  const [activeTab, setActiveTab] = useState("roadmap");

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Import a Car from Japan: Complete Step-by-Step Guide",
    "description": "A comprehensive guide on sourcing, inspecting, bidding, deregistering, and shipping used cars from Japan to your local port.",
    "totalTime": "P30D",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Check Your Local Country Import Rules",
        "text": "Confirm age eligibility (e.g. US 25-year rule, Canada 15-year rule, Kenya 8-year rule) and steering side regulations before shopping.",
      },
      {
        "@type": "HowToStep",
        "name": "Select Vehicle or Request Auction Sourcing",
        "text": "Browse verified physical stock or request an auction agent to search through ~100,000 vehicles weekly across Japanese auction halls.",
      },
      {
        "@type": "HowToStep",
        "name": "Translate Auction Sheet & Verify Condition",
        "text": "Request a full translation of the Japanese auction inspection sheet to evaluate overall grades, cosmetic letter codes, and mechanical notes.",
      },
      {
        "@type": "HowToStep",
        "name": "Win the Vehicle and Make Payment",
        "text": "Set your ceiling budget. Once won at auction or agreed from stock, settle the proforma invoice via telegraphic transfer.",
      },
      {
        "@type": "HowToStep",
        "name": "Pre-Shipment Inspection & Deregistration",
        "text": "Obtain the Japanese Export Certificate (deregistration document) and complete country-mandated inspections such as JEVIC or QISJ.",
      },
      {
        "@type": "HowToStep",
        "name": "RoRo or Container Shipping & Port Customs Clearance",
        "text": "Book ocean freight to your destination port. Receive original Bill of Lading and documentation to clear local customs.",
      },
    ],
  };

  return (
    <Layout>
      <SEOHead
        title="Complete Guide to Auto Imports from Japan | Step-by-Step, Auction Sheets & Costs"
        description="Learn how auto imports from Japan work: step-by-step import roadmap, translating Japanese auction sheets, understanding FOB vs CIF pricing, shipping methods, and country laws."
        keywords="auto imports from japan guide, how to import car from japan, japanese auction sheet translation, FOB vs CIF, RoRo shipping japan, 25 year rule JDM, JDM car import"
        canonicalUrl="https://neojapancars.com/resources"
        ogType="article"
        jsonLd={howToSchema}
      />

      {/* Header */}
      <section className="bg-card border-b border-border py-12">
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs sm:text-sm font-semibold rounded-full mb-3">
            <BookOpen className="h-4 w-4" />
            Knowledge Base & Practical Guides
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground">
            Complete Guide to <span className="text-primary">Auto Imports from Japan</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-3xl text-sm sm:text-base leading-relaxed">
            Everything you need to know about importing high-quality Japanese vehicles—from decoding auction inspection 
            sheets and calculating true landed costs, to navigating country regulations and customs clearance.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10">
        {/* Quick Nav Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`p-4 rounded-xl text-left border transition-all ${
              activeTab === "roadmap"
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card border-border hover:border-primary/50 text-foreground"
            }`}
          >
            <FileText className="h-6 w-6 mb-2" />
            <h3 className="font-display font-bold text-sm sm:text-base">Step-by-Step Roadmap</h3>
            <p className="text-xs opacity-80 mt-1">From vehicle selection to port delivery</p>
          </button>

          <button
            onClick={() => setActiveTab("auction-sheets")}
            className={`p-4 rounded-xl text-left border transition-all ${
              activeTab === "auction-sheets"
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card border-border hover:border-primary/50 text-foreground"
            }`}
          >
            <Search className="h-6 w-6 mb-2" />
            <h3 className="font-display font-bold text-sm sm:text-base">Auction Sheet Decoding</h3>
            <p className="text-xs opacity-80 mt-1">Grades 3.5–5 & inspection letter codes</p>
          </button>

          <button
            onClick={() => setActiveTab("pricing")}
            className={`p-4 rounded-xl text-left border transition-all ${
              activeTab === "pricing"
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card border-border hover:border-primary/50 text-foreground"
            }`}
          >
            <DollarSign className="h-6 w-6 mb-2" />
            <h3 className="font-display font-bold text-sm sm:text-base">FOB vs CIF Pricing</h3>
            <p className="text-xs opacity-80 mt-1">Calculating your true landed cost</p>
          </button>

          <button
            onClick={() => setActiveTab("shipping")}
            className={`p-4 rounded-xl text-left border transition-all ${
              activeTab === "shipping"
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card border-border hover:border-primary/50 text-foreground"
            }`}
          >
            <Ship className="h-6 w-6 mb-2" />
            <h3 className="font-display font-bold text-sm sm:text-base">Shipping & Customs</h3>
            <p className="text-xs opacity-80 mt-1">RoRo vs Container & country laws</p>
          </button>
        </div>

        {/* Tabbed In-Depth Guide Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="hidden">
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="auction-sheets">Auction Sheets</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>

          {/* TAB 1: ROADMAP */}
          <TabsContent value="roadmap" className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 lg:p-10 card-shadow">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                The 6-Step Roadmap for Auto Imports from Japan
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Buying a car from Japan differs from domestic car purchasing. Because you cannot kick the tires in person, 
                Japan has established the world's most transparent and formalized vehicle export system. Here is exactly 
                how the process unfolds from start to finish:
              </p>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full hero-gradient text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">
                      Verify Your Country's Import Eligibility
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      Before placing an inquiry, check your destination country's age rules and emissions limits. 
                      For example, the United States allows vehicles 25 years or older from the exact manufacture month; 
                      Canada has a 15-year threshold; Australia requires SEVS approval or 25-year historic status; 
                      Kenya mandates vehicles be under 8 years of age.
                    </p>
                    <div className="inline-flex items-center gap-2 text-xs bg-secondary px-3 py-1.5 rounded-lg text-foreground font-medium">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Tip: Neo Trading verifies eligibility before you commit any funds.
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full hero-gradient text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">
                      Choose In-Stock Inventory or Live Auction Sourcing
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                      <strong>Option A (Stock):</strong> Browse our inspected physical inventory. Vehicles are parked in Japanese 
                      port yards (Yokohama, Nagoya, Kobe) and ready to load on the next sailing.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong>Option B (Auctions):</strong> Around 100,000 cars pass through USS, TAA, CAA, and JU auction halls 
                      every week. Tell us your make, model, year, grade, and budget, and we scan all daily catalogues for you.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full hero-gradient text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">
                      Inspect & Translate the Japanese Auction Sheet
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Japanese auction houses assign independent third-party inspectors to appraise every single vehicle. 
                      The inspector produces an official inspection sheet documenting cosmetic marks, interior wear, rust, 
                      engine condition, and prior panel repairs. Neo provides a complete line-by-line English translation 
                      and honest recommendation before bidding.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full hero-gradient text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">
                      Bid & Confirm Purchase (FOB/CIF Invoicing)
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You establish your maximum bid in USD. If the car is hammered at or below your target, the vehicle is won! 
                      We issue a proforma invoice detailing FOB (vehicle + inland transport + export customs) or CIF 
                      (inclusive of ocean freight and maritime insurance). Settle payment via secure international telegraphic transfer (TT).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full hero-gradient text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    5
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">
                      Japanese Deregistration & Pre-Shipment Inspection
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                      Neo handles domestic vehicle deregistration with the Japanese Ministry of Land, Infrastructure, 
                      Transport and Tourism (MLIT) to receive the official Japanese Export Certificate (Yushutsu Massho).
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      If your destination country requires certified roadworthiness (e.g. JEVIC, JAAI, EAA, QISJ) or radiation 
                      testing, we conduct and pass the inspection before loading.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full hero-gradient text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    6
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">
                      Ocean Shipping, Tracking & Destination Customs Clearance
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      The vehicle sails via RoRo (Roll-on/Roll-off) or sealed 20ft/40ft ocean container. 
                      We provide vessel tracking and courier the original documents (Bill of Lading, Export Certificate 
                      with certified English translation, Commercial Invoice, Inspection Certificate) directly to you or your customs broker.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <h4 className="font-display font-semibold text-foreground text-sm">
                    Ready to start your auto import from Japan?
                  </h4>
                  <p className="text-xs text-muted-foreground">Browse vehicles ready to ship right now or request auction sourcing.</p>
                </div>
                <div className="flex gap-3">
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                    <Link to="/stock-cars">
                      Explore Stock List
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: AUCTION SHEETS */}
          <TabsContent value="auction-sheets" className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 lg:p-10 card-shadow">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                How to Read Japanese Auction Inspection Sheets
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Japanese auction sheets are produced by strict, unbiased professional inspectors. Understanding the 
                overall grade and panel codes empowers you to buy with complete confidence.
              </p>

              {/* Overall Grades */}
              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                Overall Vehicle Inspection Grades
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-bold text-lg text-primary">Grade S / 6</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/20 text-primary">New</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Brand new vehicle or delivery mileage only (under 1,000 km). Flawless condition throughout.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-bold text-lg text-primary">Grade 5</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/20 text-primary">Near Mint</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Exceptional condition with minimal mileage. May have micro-scratches detectable only by inspectors.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-bold text-lg text-accent">Grade 4.5</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-accent/20 text-accent-foreground">Very Clean</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Excellent condition; very clean body and interior. Minor cosmetic blemishes that polish out easily.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-bold text-lg text-foreground">Grade 4</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">Good</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average wear for vehicle age. Light scratches or small parking dings. Most commonly purchased grade.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-bold text-lg text-foreground">Grade 3.5</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">Fair / Workhorse</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Noticeable cosmetic blemishes, panel dings, or higher mileage. Solid mechanical value for budget buyers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-bold text-lg text-destructive">Grade R / RA</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-destructive/10 text-destructive">Repaired</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Accident history or structural repair. Can be a great bargain if the repair was purely cosmetic. We check the structural report.
                  </p>
                </div>
              </div>

              {/* Panel Code Table */}
              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                Inspection Diagram Letter Codes
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="p-3 font-semibold text-foreground">Code</th>
                      <th className="p-3 font-semibold text-foreground">Meaning</th>
                      <th className="p-3 font-semibold text-foreground">Severity Level 1</th>
                      <th className="p-3 font-semibold text-foreground">Severity Level 2</th>
                      <th className="p-3 font-semibold text-foreground">Severity Level 3</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs sm:text-sm">
                    <tr>
                      <td className="p-3 font-bold text-primary">A</td>
                      <td className="p-3">Scratch</td>
                      <td className="p-3 text-muted-foreground">A1: Minor surface scratch (buffable)</td>
                      <td className="p-3 text-muted-foreground">A2: Visible scratch (needs touch-up)</td>
                      <td className="p-3 text-muted-foreground">A3: Deep scratch into primer</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-primary">U</td>
                      <td className="p-3">Dent</td>
                      <td className="p-3 text-muted-foreground">U1: Tiny pin dent / coin size</td>
                      <td className="p-3 text-muted-foreground">U2: Noticeable dent (palm size)</td>
                      <td className="p-3 text-muted-foreground">U3: Large dent</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-primary">W</td>
                      <td className="p-3">Wave / Prior Paint</td>
                      <td className="p-3 text-muted-foreground">W1: Barely noticeable repaint</td>
                      <td className="p-3 text-muted-foreground">W2: Good quality repaint</td>
                      <td className="p-3 text-muted-foreground">W3: Poor repaint / visible orange peel</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-primary">S</td>
                      <td className="p-3">Rust</td>
                      <td className="p-3 text-muted-foreground">S1: Surface spot rust</td>
                      <td className="p-3 text-muted-foreground">S2: Visible rust patch</td>
                      <td className="p-3 text-muted-foreground">S3: Heavy rust</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-primary">C</td>
                      <td className="p-3">Corrosion</td>
                      <td className="p-3 text-muted-foreground">C1: Minor corrosion</td>
                      <td className="p-3 text-muted-foreground">C2: Moderate corrosion</td>
                      <td className="p-3 text-muted-foreground">C3: Heavy corrosion / hole in panel</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-primary">X / XX</td>
                      <td className="p-3">Panel Replacement</td>
                      <td className="p-3 text-muted-foreground" colSpan={3}>
                        X = Panel requires replacement; XX = Panel has been professionally replaced.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: PRICING */}
          <TabsContent value="pricing" className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 lg:p-10 card-shadow">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                FOB vs CIF Pricing: What You Pay When Importing
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                When purchasing auto imports from Japan, prices are universally quoted in either <strong>FOB</strong> or <strong>CIF</strong>. 
                Understanding the distinction prevents unexpected costs at destination.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-xl bg-secondary/40 border border-border">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Option A</span>
                  <h3 className="font-display text-xl font-bold text-foreground mt-1 mb-2">
                    FOB (Free On Board)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The price of the vehicle loaded safely onto the vessel in Japan. You pay shipping separately.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-foreground">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Cost of the vehicle in Japan</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Inland transport from dealer/auction to export port</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Japanese customs clearance & documentation</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Terminal port handling and vessel loading fees</li>
                  </ul>
                </div>

                <div className="p-6 rounded-xl bg-primary/5 border border-primary/30">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Option B (Recommended)</span>
                  <h3 className="font-display text-xl font-bold text-foreground mt-1 mb-2">
                    CIF (Cost, Insurance & Freight)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The complete landed package to your port of arrival. All-inclusive until vessel discharge.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-foreground">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Everything included in FOB above</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> International ocean freight to your destination port</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Full maritime cargo loss & damage insurance</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Guaranteed locked freight rate</li>
                  </ul>
                </div>
              </div>

              <div className="bg-secondary/30 p-5 rounded-xl border border-border">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-display font-semibold text-foreground text-sm sm:text-base">
                      What is paid locally at your destination port?
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                      Neither FOB nor CIF includes local destination fees. Once the ship arrives at your local port, 
                      you or your customs broker will pay: 1) Local port terminal handling charges (DTHC); 
                      2) Destination customs import duty and GST/VAT; 3) Local compliance inspection or road registration. 
                      Neo provides all necessary documentation to clear your vehicle with ease.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: SHIPPING & COMPLIANCE */}
          <TabsContent value="shipping" className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 lg:p-10 card-shadow">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                RoRo vs Container Shipping from Japan
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Neo ships out of Japan's major maritime gateways: Yokohama, Kawasaki, Nagoya, Kobe, Osaka, and Hakata. 
                Depending on the vehicle's rarity, dimensions, and destination, we arrange RoRo or container transit.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-xl bg-secondary/40 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <Ship className="h-6 w-6 text-primary" />
                    <h3 className="font-display text-lg font-bold text-foreground">
                      RoRo (Roll-on / Roll-off)
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">
                    Vehicles are driven directly into specialized automotive carrier vessels and strapped securely to internal decks. 
                    This is the standard, most economical shipping method worldwide.
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>• Lowest cost per vehicle</li>
                    <li>• Most frequent vessel departures</li>
                    <li>• Vehicle must be running and drivable</li>
                    <li>• No personal items or loose spare parts allowed inside</li>
                  </ul>
                </div>

                <div className="p-6 rounded-xl bg-secondary/40 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe2 className="h-6 w-6 text-primary" />
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Container Freight (20ft / 40ft)
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">
                    Vehicles are loaded into a sealed steel container (1 car in 20ft, or 2 to 4 cars in 40ft High Cube). 
                    Recommended for high-value collector JDM cars, lowered track vehicles, or shipments with spare parts.
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>• Maximum security & isolation from salt air</li>
                    <li>• Can transport spare wheels, engines, and parts</li>
                    <li>• Ideal for non-running restoration projects</li>
                    <li>• Slightly higher cost for single vehicle shipments</li>
                  </ul>
                </div>
              </div>

              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                Estimated Ocean Transit Times from Japan
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                  <p className="font-display font-bold text-primary text-xl">2–3 Weeks</p>
                  <p className="text-xs text-muted-foreground mt-1">Australia & New Zealand</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                  <p className="font-display font-bold text-primary text-xl">3–4 Weeks</p>
                  <p className="text-xs text-muted-foreground mt-1">US West Coast / SE Asia</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                  <p className="font-display font-bold text-primary text-xl">4–6 Weeks</p>
                  <p className="text-xs text-muted-foreground mt-1">UK, Europe & East Africa</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                  <p className="font-display font-bold text-primary text-xl">6–8 Weeks</p>
                  <p className="text-xs text-muted-foreground mt-1">US East Coast & Caribbean</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA Box */}
        <div className="mt-12 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 rounded-2xl p-8 text-center max-w-3xl mx-auto">
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            Have a question about a specific car or destination?
          </h3>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto mb-6">
            Our Tokyo-based export consultants are ready to answer any questions about auction fees, 
            country regulations, or CIF shipping quotes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Link to="/inquiry">
                Request Free CIF Quote
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/faq">
                <HelpCircle className="h-4 w-4 mr-2" />
                Read FAQs
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Resources;
