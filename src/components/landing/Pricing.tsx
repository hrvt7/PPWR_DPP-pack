import { Package, FileText, Shield, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "€19",
      period: "/month",
      icon: Package,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      tagline: "PPWR Compliance",
      accent: "Start compliant from day one",
      features: [
        { text: "PPWR empty space compliance check", isNew: false },
        { text: "Manual product import (CSV or copy-paste)", isNew: false },
        { text: "1-page PPWR compliance PDF", isNew: false },
        { text: "1 unique PPWR QR code", isNew: false },
        { text: "Public verification page", isNew: false },
      ],
      ctaVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Standard",
      price: "€39",
      period: "/month",
      icon: FileText,
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      tagline: "PPWR + Digital Product Passport",
      accent: "Complete product documentation",
      features: [
        { text: "Everything in Basic", isNew: false },
        { text: "Digital Product Passport (DPP)", isNew: true },
        { text: "Manual DPP data entry", isNew: false },
        { text: "2-page compliance PDF", isNew: false },
        { text: "2 QR codes (PPWR + DPP)", isNew: false },
        { text: "Separate verification pages", isNew: false },
      ],
      ctaVariant: "default" as const,
      popular: true,
    },
    {
      name: "Pro",
      price: "€69",
      period: "/month",
      icon: Shield,
      iconBg: "bg-yellow-500/10",
      iconColor: "text-yellow-500",
      tagline: "Full Compliance",
      accent: "Complete EU compliance protection",
      features: [
        { text: "Everything in Standard", isNew: false },
        { text: "Green Claims risk detection", isNew: true },
        { text: "AI-assisted compliant wording suggestions", isNew: true },
        { text: "Manual confirmation workflow", isNew: false },
        { text: "Environmental claims compliance statement", isNew: false },
        { text: "Full compliance PDF with disclaimers", isNew: false },
      ],
      ctaVariant: "outline" as const,
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="section-padding">
      <div className="container-lg">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-4">
          <p className="text-accent font-medium mb-2">Built for Small EU Webshops</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground mb-2">
            Upload your products and get compliant. No integrations required. No technical setup.
          </p>
          <p className="text-sm text-muted-foreground">
            Start with a 14-day free trial. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative glass-card glass-card-hover p-8 animate-fade-in-up ${
                plan.popular ? 'neon-border' : 'border border-border/50'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
              )}
              
              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl ${plan.iconBg} flex items-center justify-center mb-4`}>
                <plan.icon className={`w-6 h-6 ${plan.iconColor}`} />
              </div>
              
              {/* Plan Name & Tagline */}
              <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.tagline}</p>
              
              {/* Price */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              
              {/* Accent Text */}
              <p className="text-sm text-accent mb-6">{plan.accent}</p>
              
              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      {feature.text}
                      {feature.isNew && (
                        <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-accent/20 text-accent uppercase">
                          New
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              
              {/* CTA */}
              <Link to="/auth" className="block">
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground blue-glow' 
                      : 'border-border/50 hover:bg-secondary/50'
                  }`}
                  variant={plan.ctaVariant}
                >
                  Start Free Trial
                  <span className="ml-2">→</span>
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
