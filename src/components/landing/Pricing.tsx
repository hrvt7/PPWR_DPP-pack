import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "€19",
      period: "/month",
      description: "PPWR compliance for small webshops",
      popular: false,
      features: [
        "Up to 50 products",
        "PPWR void space check",
        "Box size recommendations",
        "PDF compliance reports",
        "QR code generation",
        "Email support",
      ],
      cta: "Start Free Trial",
    },
    {
      name: "Standard",
      price: "€39",
      period: "/month",
      description: "PPWR + DPP for growing businesses",
      popular: true,
      features: [
        "Up to 200 products",
        "Everything in Basic",
        "Digital Product Passport",
        "DPP data management",
        "Public verification pages",
        "CSV import (Shopify)",
        "Priority support",
      ],
      cta: "Start Free Trial",
    },
    {
      name: "Pro",
      price: "€69",
      period: "/month",
      description: "Full compliance suite with Green Claims",
      popular: false,
      features: [
        "Unlimited products",
        "Everything in Standard",
        { text: "Green Claims detection", isNew: true },
        { text: "AI-powered suggestions", isNew: true },
        "Risk score analysis",
        "Compliance dashboard",
        "Dedicated support",
      ],
      cta: "Start Free Trial",
    },
  ];

  return (
    <section id="pricing" className="section-padding">
      <div className="container-lg">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-medium text-accent mb-3 uppercase tracking-wider">
            Pricing
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Built for Small{" "}
            <span className="text-accent-green">EU Webshops</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            No integrations required. No developer needed. Just upload and comply.
          </p>
          <p className="text-sm text-muted-foreground">
            ✨ 14-day free trial on all plans. No credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative glass-card glass-card-hover p-8 animate-fade-in-up ${
                plan.popular ? 'neon-border ring-2 ring-accent/30' : 'border border-border/50'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => {
                  const isObject = typeof feature === 'object';
                  const text = isObject ? feature.text : feature;
                  const isNew = isObject && feature.isNew;

                  return (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {text}
                        {isNew && (
                          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-medium">
                            <Sparkles className="w-3 h-3" />
                            NEW
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* CTA Button */}
              <Button
                className={`w-full ${
                  plan.popular
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground blue-glow'
                    : 'bg-secondary hover:bg-secondary/80 text-foreground'
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
