export interface BlogSection {
  heading: string;
  subheading?: string;
  content: string[];
  keyPoints?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  callout?: {
    type: "tip" | "warning" | "info";
    title: string;
    text: string;
  };
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  publishedAt: string;
  isoDate: string;
  readTime: string;
  author: {
    name: string;
    role: string;
  };
  category: "US Market" | "UK Market" | "JDM Classics" | "Auction Guides";
  market: "US" | "UK" | "Global";
  image: string;
  tags: string[];
  keywords: string;
  sections: BlogSection[];
}

export const blogs: BlogPost[] = [
  {
    id: "importing-jdm-cars-to-usa-25-year-rule",
    slug: "importing-jdm-cars-to-usa-25-year-rule",
    title: "The Complete Guide to Importing JDM Cars to the USA Under the 25-Year Rule",
    subtitle: "Everything American enthusiasts and dealers need to know about the 25-year exemption, NHTSA/EPA paperwork, duties, shipping, and title registration.",
    description: "Learn how to legally import JDM cars from Japan to the USA under the NHTSA 25-year rule. Step-by-step guidance on customs forms HS-7 & 3520-1, 2.5% duty, ocean freight to US ports, and state titling.",
    publishedAt: "September 18, 2026",
    isoDate: "2026-09-18",
    readTime: "9 min read",
    author: {
      name: "Kenji Sato",
      role: "Head of Export Logistics, Neo Trading Tokyo",
    },
    category: "US Market",
    market: "US",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&h=630&fit=crop",
    tags: ["USA Import", "25-Year Rule", "JDM Classics", "Skyline GT-R", "NHTSA & EPA", "Kei Trucks"],
    keywords: "import JDM cars to USA, 25 year rule JDM, auto imports from japan to USA, import skyline to america, japanese Kei truck import USA, NHTSA HS-7 form, JDM import duty USA",
    sections: [
      {
        heading: "1. Understanding the US 25-Year Rule (FMVSS & EPA Exemption)",
        content: [
          "For American automotive enthusiasts, the federal '25-Year Rule' is the single most important regulation governing auto imports from Japan. Enacted under the Imported Vehicle Safety Compliance Act of 1988, this rule exempts any motor vehicle that is at least 25 years old from Federal Motor Vehicle Safety Standards (FMVSS).",
          "Crucially, the 25-year clock is calculated down to the exact month and year of manufacture—not simply the model year. For example, a Nissan Skyline GT-R manufactured in March 2001 becomes legally importable into the United States on March 1, 2026.",
          "Additionally, the Environmental Protection Agency (EPA) grants an emissions exemption for light-duty vehicles that are 21 years old or older with their original unmodified engine. Because 25 years exceeds 21 years, any vehicle meeting the safety exemption automatically qualifies for the federal emissions exemption as well.",
        ],
        callout: {
          type: "info",
          title: "Exact Build Date Matters",
          text: "Never assume a car is legal based solely on registration year. In Japan, first registration can occur months after manufacture. Neo Trading verifies the exact production month using the vehicle's Japanese chassis VIN code before bidding.",
        },
      },
      {
        heading: "2. Legendary JDM Icons Now Legal for US Import",
        content: [
          "With the rolling 25-year timeline, some of the greatest Japanese domestic market vehicles in automotive history are now 100% legal to import, register, and drive on US highways:",
        ],
        keyPoints: [
          "Nissan Skyline GT-R (R32, R33, and early R34 series)",
          "Toyota Supra Mk4 (JZA80) with legendary 2JZ-GTE twin-turbo power",
          "Mazda RX-7 FD3S (Series 6, 7, and early Series 8)",
          "Mitsubishi Lancer Evolution (Evo IV, V, VI, and Tommi Makinen Edition)",
          "Subaru Impreza WRX STI (GC8 Version 5 & 6, 22B replicas, GDB Bug Eye)",
          "Honda Civic Type R (EK9) and Integra Type R (DC2)",
          "Japanese 4WD Kei Trucks: Daihatsu Hijet, Suzuki Carry, Honda Acty, Subaru Sambar",
          "Off-road beasts: Toyota Land Cruiser 70/80/100 series and Hilux Surf Turbo Diesel",
        ],
      },
      {
        heading: "3. Step-by-Step Import Process to the United States",
        content: [
          "Importing an automobile from Japan to the United States follows a strict protocol to satisfy US Customs and Border Protection (CBP), the Department of Transportation (DOT), and the EPA:",
          "Step 1: Vehicle Sourcing & Inspection. Choose from Neo's port stock or bid directly at Japanese auto auctions. We obtain and translate the original auction sheet, inspecting for chassis corrosion and mechanical condition.",
          "Step 2: Japanese Deregistration. We process the vehicle's domestic deregistration with the Japanese Ministry of Land, Infrastructure, Transport and Tourism (MLIT) and obtain the official Japanese Export Certificate (Yushutsu Massho).",
          "Step 3: Ocean Shipping & ISF Filing. Ocean transit is booked via RoRo or enclosed container. At least 24 hours prior to loading in Japan, an Importer Security Filing (ISF 10+2) must be submitted electronically to US Customs.",
          "Step 4: US Customs Clearance. Upon vessel arrival at the US port of entry, submit the required customs declaration, EPA Form 3520-1, DOT Form HS-7, and pay the 2.5% passenger car customs duty.",
          "Step 5: Port TWIC Escort & State Titling. Collect the car using an approved TWIC-badged transport or escort, complete a state safety/VIN verification inspection, and obtain your US title and license plates.",
        ],
      },
      {
        heading: "4. US Customs Forms & Documentation Checklist",
        content: [
          "When clearing your Japanese import at US Customs, you or your licensed customs broker will need the following official documents:",
        ],
        table: {
          headers: ["Document Name", "Issuing Body", "Purpose"],
          rows: [
            ["Original Japanese Export Certificate", "Japanese MLIT", "Proves official deregistration & authentic manufacture date"],
            ["Certified English Translation", "Neo Trading Co., Ltd", "Required by US Customs and state DMV for title registration"],
            ["Commercial Invoice & Bill of Sale", "Neo Trading Co., Ltd", "Establishes purchase price for duty calculation"],
            ["Original Ocean Bill of Lading (B/L)", "Ocean Shipping Line", "Proof of ownership and cargo release at port"],
            ["DOT Form HS-7 (Box 1)", "US Department of Transportation", "Declares vehicle is 25+ years old and exempt from FMVSS"],
            ["EPA Form 3520-1 (Code E)", "US Environmental Protection Agency", "Declares vehicle is 21+ years old and exempt from emissions"],
            ["CBP Form 7501 (Entry Summary)", "US Customs and Border Protection", "Proof that customs duty was fully assessed and paid"],
          ],
        },
      },
      {
        heading: "5. Calculating the Total Landed Cost in the USA",
        content: [
          "Budgeting accurately requires accounting for all stages from auction hammer to driveway. Here is how the total cost is structured for auto imports from Japan to the US:",
        ],
        table: {
          headers: ["Cost Component", "Typical Rate", "Notes"],
          rows: [
            ["Vehicle FOB Price", "Variable ($5,000 - $80,000+)", "Vehicle cost, Japan inland trucking, export yard fees"],
            ["Ocean Freight (RoRo)", "$1,800 - $2,600", "To US West Coast (Long Beach, Tacoma) or East Coast (Baltimore, Jacksonville)"],
            ["Marine Cargo Insurance", "~$100 - $250", "Full coverage against maritime loss or total damage"],
            ["US Customs Duty", "2.5% of FOB value (cars) / 25% (trucks)", "Passenger cars: 2.5%; 2-seater commercial trucks: 25% 'Chicken Tax'"],
            ["US Customs Broker Fee", "$350 - $550", "Handles ISF filing, CBP entry, and clearance paperwork"],
            ["Port Terminal Handling (DTHC)", "$200 - $400", "Paid to US port terminal operator for offloading"],
            ["State Sales Tax & Registration", "State dependent (0% - 10%)", "Paid when registering and titling at your local DMV"],
          ],
        },
      },
      {
        heading: "6. Right-Hand Drive (RHD) Legality and State Registration",
        content: [
          "A frequent question from first-time US buyers: 'Is right-hand drive legal in America?' The answer is an unequivocal yes. There is no federal law prohibiting the operation of right-hand drive passenger vehicles on US public roads.",
          "US postal workers drive RHD vehicles daily, and thousands of JDM imports operate across all 50 states. Once your vehicle is cleared through US Customs and you receive your stamped CBP 7501, take the stamped paperwork, translated export certificate, and DOT/EPA forms to your local DMV or tag agency to receive a standard US title.",
        ],
        callout: {
          type: "warning",
          title: "Special Note for California Residents (CARB)",
          text: "While vehicles 25+ years old are federally exempt from EPA standards, California's CARB regulations require vehicles made after 1975 to undergo emissions compliance testing before receiving California registration. Buyers in California should consult a CARB compliance laboratory or register out-of-state where permitted.",
        },
      },
    ],
  },
  {
    id: "how-to-import-cars-from-japan-to-uk",
    slug: "how-to-import-cars-from-japan-to-uk",
    title: "How to Import Cars from Japan to the UK: Complete Step-by-Step Guide",
    subtitle: "A practical walkthrough for UK importers: IVA testing, the 10-year rule, DVLA V55/5 registration, HMRC NOVA, VAT/Duty calculation, and Southampton port delivery.",
    description: "Everything you need to know about importing used and JDM cars from Japan to the UK. Learn about the 10-year exemption rule, IVA test requirements, HMRC NOVA notification, DVLA registration, and port fees.",
    publishedAt: "September 20, 2026",
    isoDate: "2026-09-20",
    readTime: "8 min read",
    author: {
      name: "Marcus Vance",
      role: "UK & European Import Specialist, Neo Trading",
    },
    category: "UK Market",
    market: "UK",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&h=630&fit=crop",
    tags: ["UK Import", "DVLA Registration", "IVA Test", "10-Year Rule", "HMRC NOVA", "JDM Cars UK"],
    keywords: "import cars from japan to uk, how to import car from japan uk, JDM import UK, IVA test japanese car, DVLA V55 5 registration, NOVA HMRC car import, japanese car import duty UK",
    sections: [
      {
        heading: "1. Why Japan is the Premier Source for UK Car Enthusiasts",
        content: [
          "The United Kingdom is one of the world's most natural markets for auto imports from Japan. Both Japan and the UK drive on the left side of the road with right-hand drive (RHD) vehicles, meaning imported Japanese vehicles require zero steering rack conversions.",
          "Furthermore, cars in Japan do not suffer from the rust and chassis rot that plagues UK domestic vehicles. In Japan, roads are generally unsalted in major metropolitan areas, speed limits are conservative, and strict shaken inspections mandate that vehicles are maintained in superb mechanical order.",
          "Whether you are sourcing a classic JDM icon (Nissan Skyline, Mazda RX-7, Toyota Chaser, Honda Integra DC5), a campervan base (Toyota Alphard, Nissan Elgrand), or a modern performance hybrid, importing directly from Japan offers unmatched vehicle condition.",
        ],
      },
      {
        heading: "2. The UK 10-Year Rule vs. IVA Testing",
        content: [
          "The ease and cost of registering an imported car in the UK depends primarily on its age under Driver and Vehicle Standards Agency (DVSA) rules:",
        ],
        table: {
          headers: ["Vehicle Age", "Testing Regime", "Requirements & Modifications"],
          rows: [
            [
              "Over 10 Years Old",
              "Standard MOT Test",
              "Exempt from IVA. Requires speedometer conversion (MPH face or chip), rear fog light installation, and standard MOT test.",
            ],
            [
              "Under 10 Years Old",
              "Individual Vehicle Approval (IVA)",
              "Must pass full IVA inspection at a DVSA test center. Model Report or Certificate of Conformity required for emissions, seatbelts, and noise.",
            ],
          ],
        },
        callout: {
          type: "tip",
          title: "The 10-Year Sweet Spot",
          text: "Vehicles older than 10 years are substantially cheaper and faster to register in the UK because they bypass the complex IVA test. You only need a standard UK MOT test with rear fog light and MPH speedometer adaptations.",
        },
      },
      {
        heading: "3. Step-by-Step UK Import Process",
        content: [
          "Step 1: Sourcing & Bidding with Neo Trading. Select a car from our Tokyo stock or instruct us to bid on live Japanese auctions. We review and translate the Japanese auction inspection sheet.",
          "Step 2: Payment & Japan Deregistration. Pay via bank transfer. We de-register the car with the Japanese MLIT, collect the official Export Certificate, and prepare the Bill of Lading.",
          "Step 3: Shipping to Southampton, Bristol, or Newcastle. Ocean transit via RoRo carrier takes approximately 4 to 6 weeks from Yokohama or Kobe to Southampton or Bristol ports.",
          "Step 4: UK Customs Clearance & HMRC NOVA Notification. Settle UK customs duty (10% on passenger cars) and UK VAT (20% on CIF value + duty). Within 14 days of arrival, notify HMRC via the Notification of Vehicle Arrivals (NOVA) system.",
          "Step 5: UK Road Modifications & MOT. Fit a dashboard rear fog light switch and indicator light, add MPH overlay or electronic speedo converter, adjust headlights for UK left-side beam pattern, and pass the UK MOT test.",
          "Step 6: DVLA Registration (Form V55/5). Post your application to DVLA Swansea with the Japanese Export Certificate (with Neo's certified English translation), MOT certificate, NOVA confirmation, insurance (by VIN), and registration fee. Receive your UK V5C logbook and assign your UK registration number.",
        ],
      },
      {
        heading: "4. UK Duty and VAT Calculation Example",
        content: [
          "Understanding your total UK financial liability is simple when broken into the standard HMRC formula. Here is an example for a Japanese car purchased for £8,000 with £1,500 shipping (CIF value: £9,500):",
        ],
        table: {
          headers: ["Calculation Item", "Formula / Percentage", "Example Amount"],
          rows: [
            ["Vehicle CIF Value", "Vehicle FOB + Ocean Shipping + Marine Insurance", "£9,500"],
            ["UK Customs Duty", "10% of CIF value (cars under 30 yrs)", "£950"],
            ["UK VAT Base", "CIF Value (£9,500) + Customs Duty (£950)", "£10,450"],
            ["UK VAT (20%)", "20% of VAT Base", "£2,090"],
            ["Total Import Taxes", "Customs Duty (£950) + VAT (£2,090)", "£3,040"],
            ["DVLA First Registration Fee", "Standard statutory fee", "£55"],
            ["Vehicle Excise Duty (Road Tax)", "Depends on engine cc / emissions", "£180 - £345"],
          ],
        },
        callout: {
          type: "info",
          title: "Historic Vehicles (Over 30 Years)",
          text: "Historic collector cars over 30 years old in original condition can qualify for reduced customs duty (0%) and reduced VAT (only 5% under HMRC customs tariff code 9705), saving thousands of pounds on classics like the R32 GT-R.",
        },
      },
      {
        heading: "5. Why Choose Neo for UK Auto Imports",
        content: [
          "Neo Trading works directly with UK-based importers, specialist car clubs, and commercial dealers. We handle the Japanese leg seamlessly—translating auction sheets, checking chassis rails for salt corrosion, organizing port transport, and providing all certified translations required by DVLA Swansea.",
        ],
      },
    ],
  },
  {
    id: "top-10-jdm-cars-to-import-from-japan",
    slug: "top-10-jdm-cars-to-import-from-japan",
    title: "Top 10 Most Popular JDM Cars to Import from Japan in 2024–2026",
    subtitle: "From twin-turbo legends and rotary icons to indestructible 4WD Kei trucks, here are the most sought-after vehicles buyers are importing worldwide.",
    description: "Discover the top 10 most popular JDM cars to import from Japan. A comprehensive guide to market values, auction grades, performance specs, and investment potential for US, UK, and global buyers.",
    publishedAt: "September 21, 2026",
    isoDate: "2026-09-21",
    readTime: "10 min read",
    author: {
      name: "Tatsuya Mori",
      role: "Senior JDM Vehicle Specialist, Neo Trading",
    },
    category: "JDM Classics",
    market: "Global",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=630&fit=crop",
    tags: ["JDM Cars", "Skyline GT-R", "Supra", "RX-7", "Kei Trucks", "Lancer Evolution", "WRX STI"],
    keywords: "top JDM cars to import, best JDM cars to buy from japan, import nissan skyline gtr, toyota supra import japan, kei truck import, jdm sports cars for sale japan",
    sections: [
      {
        heading: "1. The Global Boom in JDM Car Imports",
        content: [
          "The Japanese Domestic Market (JDM) era of the late 1980s through the early 2000s produced an unprecedented generation of performance automobiles. Engineered during Japan's bubble economy and governed by the voluntary 276-horsepower 'gentlemen's agreement', Japanese manufacturers over-engineered their engines with forged internals, advanced all-wheel-drive systems, and sophisticated aerodynamics.",
          "Today, with vehicles crossing the US 25-year and UK 10-year thresholds, demand for genuine, rust-free Japanese domestic sports cars has reached historic highs. Here are the top 10 vehicles buyers are importing with Neo Trading.",
        ],
      },
      {
        heading: "2. The Top 10 Ranked Vehicles",
        content: [
          "Each car below represents exceptional performance, enthusiast appeal, and strong long-term value retention:",
        ],
        table: {
          headers: ["Rank & Model", "Engine & Drivetrain", "Key Appeal", "Target Markets"],
          rows: [
            ["1. Nissan Skyline GT-R (R32 / R33 / R34)", "2.6L RB26DETT Twin-Turbo, ATTESA 4WD", "Godzilla legacy, motorsport heritage, tremendous investment growth", "USA, UK, Australia, Canada"],
            ["2. Toyota Supra Mk4 (JZA80)", "3.0L 2JZ-GTE Twin-Turbo, RWD (Getrag 6-speed)", "Legendary bulletproof engine, iconic 90s styling", "USA, UK, Germany, UAE"],
            ["3. Mazda RX-7 (FD3S)", "1.3L 13B-REW Twin-Rotor Sequential Turbo", "Near 50:50 weight balance, timeless timeless lines, rotary purism", "USA, UK, Canada, Australia"],
            ["4. Mitsubishi Lancer Evolution (IV - VI / TME)", "2.0L 4G63 Turbo, Active Yaw Control 4WD", "Rally pedigree, WRC championship winner, aggressive bodywork", "USA, UK, New Zealand"],
            ["5. Subaru Impreza WRX STI (GC8 & GDB)", "2.0L EJ207 Boxer Turbo, DCCD AWD", "Signature boxer rumble, Colin McRae heritage, rally agility", "USA, UK, Europe"],
            ["6. Honda Civic Type R (EK9) & Integra (DC2)", "1.6L B16B / 1.8L B18C VTEC, FWD LSD", "8,200+ RPM redlines, featherweight chassis, pure driver feel", "USA, UK, Ireland"],
            ["7. 4WD Kei Trucks (Hijet, Carry, Acty, Sambar)", "660cc Inline-3, Manual 4WD with Diff Lock", "Unstoppable off-road utility, street-legal, phenomenal fuel economy", "USA (farms & ranches), Canada"],
            ["8. Toyota Land Cruiser (HZJ77, HDJ81, KZJ95)", "4.2L 1HZ / 1HD-FT Turbo Diesel, 4WD", "Bulletproof reliability, overland capability, global parts availability", "USA, UK, Africa, Caribbean"],
            ["9. Nissan Silvia / 180SX (S13, S14, S15)", "2.0L SR20DET Turbo, RWD", "The ultimate drift and club motorsport platform", "USA, UK, Australia"],
            ["10. Suzuki Jimny (JA11, JA22, JB23)", "660cc Turbo / 1.3L, Dual-range 4WD", "Compact mountain goat capability, rugged ladder-frame chassis", "UK, USA, Europe, New Zealand"],
          ],
        },
      },
      {
        heading: "3. What to Look For When Sourcing JDM Cars",
        content: [
          "Because Japanese performance cars are often enthusiast-driven, condition varies dramatically. Working with an experienced exporter on the ground in Tokyo is crucial:",
          "Underbody Inspection: Japanese roads in snowy northern regions (Hokkaido, Tohoku) use salt, whereas central and southern regions (Tokyo, Nagoya, Osaka, Fukuoka) do not. Neo prioritizes dry southern vehicles.",
          "Originality vs. Modifications: Heavily modified drift cars often hide stress cracks or wiring issues. We look for Grade 4 and 4.5 examples with original paint, intact factory airboxes, and documented timing belt services.",
          "Odometer Tampering Checks: Never buy without inspecting the official Japanese Export Certificate. Japan's Ministry of Transport records the odometer from past shaken inspections, exposing any rolled-back clusters immediately.",
        ],
      },
      {
        heading: "4. Start Sourcing Your Dream JDM Car",
        content: [
          "Whether you are targeting an unmolested R33 Skyline GT-R for the US market or a pristine Honda Integra Type R for the UK, Neo Trading gives you direct bidding access to over 150,000 vehicles weekly across Japan. Contact our Tokyo office for a free vehicle valuation and shipping estimate.",
        ],
      },
    ],
  },
  {
    id: "japanese-car-auctions-guide-usa-uk-buyers",
    slug: "japanese-car-auctions-guide-usa-uk-buyers",
    title: "How to Buy from Japanese Car Auctions: Guide for US & UK Buyers",
    subtitle: "Unlock direct bidding access to USS, TAA, and CAA auction houses. Learn how bidding works, how auction sheets are translated, and how to avoid hidden export costs.",
    description: "A comprehensive guide on buying cars from Japanese vehicle auctions for US and UK buyers. Discover how auction grading works, how to place bids, and how Neo Trading inspects vehicles before bidding.",
    publishedAt: "September 22, 2026",
    isoDate: "2026-09-22",
    readTime: "7 min read",
    author: {
      name: "Kenji Sato",
      role: "Head of Export Logistics, Neo Trading Tokyo",
    },
    category: "Auction Guides",
    market: "Global",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=630&fit=crop",
    tags: ["Auctions", "USS Tokyo", "TAA Auctions", "Auction Sheets", "Bidding Guide", "FOB Pricing"],
    keywords: "japanese car auctions guide, USS tokyo auction bidding, how to buy car from japan auction, japanese auction sheet translation, buy JDM car auction USA UK",
    sections: [
      {
        heading: "1. The Scale of Japanese Auto Auctions",
        content: [
          "Japan operates the world's most sophisticated and high-volume automotive auction network. Every single week, more than 100,000 to 150,000 used cars, classic sports cars, trucks, and luxury vans are presented across over 150 auction venues nationwide.",
          "The largest auction groups include USS (Used-car System Solutions), TAA (Toyota Auto Auction), CAA (Chubu Auto Auction), JU (Japanese Used Car Dealers Association), ARAI, and HAA. Bidding takes place in real-time computerized trading halls with lots hammered down in as little as 15 to 20 seconds.",
          "Private buyers cannot enter or bid directly on these auctions—access is strictly restricted to licensed Japanese motor vehicle dealers with substantial bond deposits. That is where Neo Trading acts as your authorized auction agent.",
        ],
      },
      {
        heading: "2. The Auction Bidding Process Step-by-Step",
        content: [
          "Step 1: Consultation & Market Research. You specify the make, model, year range, target grade, and your maximum budget in USD or GBP. We analyze recent auction sales data to establish a realistic hammer price.",
          "Step 2: Auction Catalogue Filtering. We monitor daily catalogues 24 to 48 hours before the auction date and notify you whenever matching vehicles appear.",
          "Step 3: Sheet Translation & Pre-Bid Physical Check. Our bilingual mechanics review the official auction sheet, translating inspector notes line-by-line. If a vehicle is located in the greater Tokyo area, an on-site physical inspection is conducted.",
          "Step 4: Placing Your Bid. You authorize a maximum ceiling bid. During the live computerized auction, our team bids on your behalf. We strictly stop if bidding exceeds your ceiling.",
          "Step 5: Winning & Transparent Invoicing. If won below your limit, the savings are passed directly to you! If the lot is unsold or hammered above your limit, you pay nothing.",
        ],
      },
      {
        heading: "3. Decoding Auction Inspector Notes",
        content: [
          "Beyond overall grades (3.5, 4, 4.5, 5), inspectors write crucial notes in Japanese shorthand. Some common inspector remarks we look for include:",
        ],
        table: {
          headers: ["Japanese Term", "Phonetic", "English Meaning & Implication"],
          rows: [
            ["実走行", "Jissoukou", "Certified genuine mileage verified by maintenance records"],
            ["下廻りサビ", "Shitamawari Sabi", "Underbody surface rust (common; severity evaluated by grade)"],
            ["コアサポート歪み", "Core Support Hizumi", "Radiator core support distorted (indicates minor front impact)"],
            ["エンドパネル修正", "End Panel Shuusei", "Rear end panel repaired (check for prior rear collision)"],
            ["タイベル交換済", "Taiberu Koukanzumi", "Timing belt replaced (saves $600 - $1,200 in maintenance)"],
            ["エアコン不良", "Eakon Furyou", "Air conditioning inoperative / blowing warm air"],
            ["外品アルミ・外品車高調", "Gaihin Arumi / Shakouchou", "Aftermarket alloy wheels and adjustable coilovers installed"],
          ],
        },
      },
      {
        heading: "4. Avoiding Common Auction Pitfalls",
        content: [
          "Buying at auction is the most rewarding way to import auto from Japan, but unrepresented buyers often fall into traps:",
          "1. Bidding blind on Grade R cars without structural repair verification: Some Grade R cars had a bumper replaced; others suffered frame damage. We always verify the inner apron and pillar marks.",
          "2. Ignoring destination compliance deadlines: If importing to the US, ensuring the car's manufacture date has already cleared the 25-year mark before vessel departure prevents customs seizure.",
          "3. Hidden auction broker markups: Neo operates with 100% transparent fee structures. We provide the authentic auction winning invoice so you know the exact hammer price.",
        ],
      },
    ],
  },
];

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogs.find((b) => b.slug === slug);
};

export const getRelatedBlogs = (currentSlug: string, count = 3): BlogPost[] => {
  return blogs.filter((b) => b.slug !== currentSlug).slice(0, count);
};
