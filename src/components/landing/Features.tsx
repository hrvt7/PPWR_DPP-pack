import { Package, FileText, QrCode } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Package,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      title: "PPWR Compliance",
      description: "Automatic box size optimization to meet EU Article 24 requirements. Keep void space under 40% with smart recommendations.",
    },
    {
      icon: FileText,
      iconColor: "text-accent",
      iconBg: "bg-accent/10",
      title: "DPP Generation",
      description: "Generate Digital Product Passports with structured sustainability data. EU-compliant documentation ready for 2026 requirements.",
    },
    {
      icon: QrCode,
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-500/10",
      title: "QR Code Labels",
      description: "Print-ready QR codes linking to public verification pages. Scannable by authorities and consumers for instant compliance checks.",
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
            Manual-first tools designed for small webshops. No complex integrations, 
            no developer required — just upload your product data and go.
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
