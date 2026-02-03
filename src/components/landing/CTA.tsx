import { Shield, Clock, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTA = () => {
  const trustIndicators = [
    { icon: Shield, text: "GDPR Compliant" },
    { icon: Clock, text: "14-Day Free Trial" },
    { icon: HeadphonesIcon, text: "Email Support" },
  ];

  return (
    <section className="section-padding">
      <div className="container-lg max-w-4xl">
        <div className="glass-card neon-border p-10 lg:p-16 text-center animate-pulse-glow">
          {/* Title */}
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Ready to Automate Your{" "}
            <span className="text-accent-green">EU Compliance</span>?
          </h2>
          
          {/* Subtitle */}
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 500+ EU webshops already using CompliPack to simplify PPWR, DPP, and Green Claims compliance.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground blue-glow px-8">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-border/50 hover:bg-secondary/50">
              Talk to Sales
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
            {trustIndicators.map((indicator, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <indicator.icon className="w-5 h-5 text-accent" />
                <span className="text-sm">{indicator.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
