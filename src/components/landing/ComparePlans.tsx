import { Check, X } from "lucide-react";

const ComparePlans = () => {
  const features = [
    { name: "PPWR compliance check", basic: true, standard: true, pro: true },
    { name: "Public verification page", basic: true, standard: true, pro: true },
    { name: "Manual product import", basic: true, standard: true, pro: true },
    { name: "Digital Product Passport", basic: false, standard: true, pro: true },
    { name: "DPP data entry", basic: false, standard: true, pro: true },
    { name: "Green Claims detection", basic: false, standard: false, pro: true },
    { name: "AI wording suggestions", basic: false, standard: false, pro: true },
    { name: "Confirmation workflow", basic: false, standard: false, pro: true },
    { name: "PDF pages", basic: "1", standard: "2", pro: "Full" },
    { name: "QR codes", basic: "1", standard: "2", pro: "2" },
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
                  <th className="text-center p-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                      <span className="text-foreground font-semibold">Basic</span>
                    </div>
                  </th>
                  <th className="text-center p-4 relative">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-foreground font-semibold">Standard</span>
                    </div>
                  </th>
                  <th className="text-center p-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-foreground font-semibold">Pro</span>
                    </div>
                  </th>
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
            💰 30-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ComparePlans;
