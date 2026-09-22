import { Link } from "react-router-dom";
import { Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CountryRule {
  region: string;
  flag: string;
  ruleTitle: string;
  details: string;
  highlights: string[];
}

const countryRules: CountryRule[] = [
  {
    region: "United States",
    flag: "\u{1F1FA}\u{1F1F8}",
    ruleTitle: "25-Year Rule Exemption",
    details:
      "Vehicles 25 years or older from their exact month of manufacture can be legally imported and registered in the US exempt from FMVSS and EPA regulations. 100% legal RHD driving.",
    highlights: ["NHTSA HS-7 & EPA 3520-1 forms", "Skyline GT-R, Supra, Kei Trucks", "RoRo & Container to US ports"],
  },
  {
    region: "Canada",
    flag: "\u{1F1E8}\u{1F1E6}",
    ruleTitle: "15-Year Rule Exemption",
    details:
      "Vehicles manufactured 15 years prior to the date of importation are exempt from Transport Canada RIV safety standards, making newer JDM models eligible sooner than in the US.",
    highlights: ["Transport Canada exempt", "Fast shipping to Vancouver/Halifax", "Subaru STI, Evolution, Delica 4WD"],
  },
  {
    region: "United Kingdom & Ireland",
    flag: "\u{1F1EC}\u{1F1E7}",
    ruleTitle: "IVA & 10-Year Rule",
    details:
      "Vehicles under 10 years require an Individual Vehicle Approval (IVA) test. Over 10 years, only standard MOT test is required. Japanese right-hand drive layout is 100% road-compatible.",
    highlights: ["Natural Right-Hand Drive", "Straightforward DVLA registration", "RoRo to Southampton / Bristol / Dublin"],
  },
  {
    region: "Australia & New Zealand",
    flag: "\u{1F1E6}\u{1F1FA}",
    ruleTitle: "SEVS & 25-Year Historic",
    details:
      "Eligible through the Specialist & Enthusiast Vehicle Scheme (SEVS), personal import, or 25-year rolling historic rules. Strict biosecurity cleaning is performed before sailing.",
    highlights: ["Mandatory quarantine wash", "Fast transit (2–3 weeks)", "Toyota Hilux, Land Cruiser, Sports cars"],
  },
  {
    region: "East & Southern Africa",
    flag: "\u{1F1F0}\u{1F1EA}",
    ruleTitle: "Age Limits & Inspections",
    details:
      "Kenya (max 8 years, QISJ inspection), Tanzania, Uganda, Zambia, and South Africa transit. Right-hand drive vehicles with verified low genuine odometers.",
    highlights: ["Pre-export QISJ / JEVIC inspection", "Mombasa & Dar es Salaam discharge", "Toyota Prado, HiAce, Harrier, Rav4"],
  },
  {
    region: "Caribbean",
    flag: "\u{1F1EF}\u{1F1F2}",
    ruleTitle: "3 to 5-Year Limits",
    details:
      "Jamaica, Bahamas, Guyana, Barbados, Trinidad & Tobago. Popular for high-spec hybrids, compact SUVs, and fuel-efficient family sedans directly from Japan.",
    highlights: ["Pre-shipment roadworthiness", "Kingston & Nassau shipping lines", "Toyota Aqua, Honda Vezel, Nissan Note"],
  },
];

const CountryComplianceSection = () => {
  return (
    <section className="py-14 bg-secondary/30 rounded-2xl border border-border my-10 p-6 lg:p-10">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Worldwide Import Compliance
        </span>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mt-3 mb-4">
          Auto Imports from Japan by Country & Region
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Every destination country has distinct import regulations, age thresholds, and documentation rules. 
          Neo Trading verifies your eligibility and prepares all required certifications before vessel departure.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countryRules.map((rule) => (
          <div
            key={rule.region}
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{rule.flag}</span>
                <div>
                  <h3 className="font-display font-bold text-foreground text-base sm:text-lg">
                    {rule.region}
                  </h3>
                  <span className="text-xs font-semibold text-primary">
                    {rule.ruleTitle}
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                {rule.details}
              </p>
              <ul className="space-y-1.5 mb-4">
                {rule.highlights.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-foreground/90">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center bg-card p-6 rounded-xl border border-border max-w-2xl mx-auto">
        <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
        <h4 className="font-display font-bold text-foreground text-base sm:text-lg mb-1">
          Don't see your country or have specific customs questions?
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4">
          We export to over 80+ countries globally. Contact our logistics specialists for a free destination consultation.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
          <Link to="/inquiry">
            Ask About Your Country
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CountryComplianceSection;
