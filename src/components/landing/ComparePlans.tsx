import { Check, X } from "lucide-react";

const ComparePlans = () => {
  const features = [
    { name: "Products limit", basic: "50", standard: "200", pro: "Unlimited" },
    { name: "PPWR void space check", basic: true, standard: true, pro: true },
    { name: "Box recommendations", basic: true, standard: true, pro: true },
    { name: "PDF reports", basic: true, standard: true, pro: true },
    { name: "QR code generation", basic: true, standard: true, pro: true },
    { name: "Digital Product Passport", basic: false, standard: true, pro: true },
    { name: "DPP data management", basic: false, standard: true, pro: true },
    { name: "Public verification pages", basic: false, standard: true, pro: true },
    { name: "CSV import (Shopify)", basic: false, standard: true, pro: true },
    { name: "Green Claims detection", basic: false, standard: false, pro: true },
    { name: "AI-powered suggestions", basic: false, standard: false, pro: true },
    { name: "Risk score analysis", basic: false, standard: false, pro: true },
    { name: "Compliance dashboard", basic: false, standard: false, pro: true },
    { name: "Email support", basic: true, standard: true, pro: true },
    { name: "Priority support", basic: false, standard: true, pro: true },
    { name: "Dedicated support", basic: false, standard: false, pro: true },
  ];

  const renderValue = (value: boolean | string) => {
    if (typeof value === 'string') {
      return <span className="text-foreground font-medium">{value}</span>;
    }
    return value ? (
      <Check className="w-5 h-5 text-accent mx-auto" />
    ) : (
      <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
    );
  };

  return (
    <section className="section-padding gradient-navy">
      <div className="container-lg">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Compare Plans
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your compliance needs
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="glass-card neon-border p-1 min-w-[600px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-foreground font-semibold">Feature</th>
                  <th className="text-center p-4 text-foreground font-semibold">Basic</th>
                  <th className="text-center p-4 text-foreground font-semibold relative">
                    <span className="relative">
                      Standard
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold uppercase whitespace-nowrap">
                        Popular
                      </span>
                    </span>
                  </th>
                  <th className="text-center p-4 text-foreground font-semibold">Pro</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={index}
                    className={`border-b border-border/30 last:border-b-0 ${
                      index % 2 === 0 ? 'bg-secondary/20' : ''
                    }`}
                  >
                    <td className="p-4 text-muted-foreground">{feature.name}</td>
                    <td className="p-4 text-center">{renderValue(feature.basic)}</td>
                    <td className="p-4 text-center bg-accent/5">{renderValue(feature.standard)}</td>
                    <td className="p-4 text-center">{renderValue(feature.pro)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            ✅ 30-day money-back guarantee on all plans. No questions asked.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ComparePlans;
