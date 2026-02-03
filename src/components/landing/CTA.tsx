import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTA = () => {
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
            Join 500+ e-commerce businesses already using CompliPack to handle PPWR and DPP compliance automatically. Start your free trial today.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground blue-glow px-8">
                Start Free Trial
                <span className="ml-2">→</span>
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-border/50 hover:bg-secondary/50">
              Talk to Sales
            </Button>
          </div>
          
          {/* Trust Text */}
          <p className="text-sm text-muted-foreground">
            No credit card required. 14-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
