import { Upload, CheckCircle, Download } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      icon: Upload,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      title: "Upload Your Products",
      description: "Import via Shopify CSV export or add products manually. No API connections needed.",
    },
    {
      number: "2",
      icon: CheckCircle,
      iconColor: "text-accent",
      iconBg: "bg-accent/10",
      title: "Run Compliance Check",
      description: "Automatic PPWR void space analysis, DPP data validation, and Green Claims screening.",
    },
    {
      number: "3",
      icon: Download,
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-500/10",
      title: "Download Reports",
      description: "Get print-ready PDFs with QR codes. Share verification links with customers.",
    },
  ];

  return (
    <section id="how-it-works" className="section-padding gradient-navy">
      <div className="container-lg">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Get compliant in three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-24 left-[16.66%] right-[16.66%] h-0.5">
            <div className="w-full h-full bg-gradient-to-r from-primary via-accent to-yellow-500 opacity-30" />
            {/* Dots */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/50" />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/50" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="glass-card glass-card-hover neon-border p-8 text-center">
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground shadow-lg shadow-accent/30">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${step.iconBg} flex items-center justify-center mx-auto mb-6 mt-2`}>
                    <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
