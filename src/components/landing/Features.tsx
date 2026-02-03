import { Package, FileText, QrCode } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Package,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      title: "PPWR Compliance",
      description: "Automatic box optimization to stay under 40% void space. EU PPWR Article 24 compliant packaging recommendations.",
    },
    {
      icon: FileText,
      iconColor: "text-accent",
      iconBg: "bg-accent/10",
      title: "DPP Generation",
      description: "Digital Product Passports with material composition, carbon footprint, and recyclability scores for your products.",
    },
    {
      icon: QrCode,
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-500/10",
      title: "QR Code Labels",
      description: "Generate print-ready labels with PPWR and DPP QR codes. Customers can scan for instant compliance verification.",
    },
  ];

  return (
    <section id="features" className="section-padding">
      <div className="container-lg">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Everything You Need for{" "}
            <span className="text-accent-green">EU Compliance</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Simple, manual-first tools designed for small and growing webshops. 
            No technical knowledge required.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card glass-card-hover neon-border p-8 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
