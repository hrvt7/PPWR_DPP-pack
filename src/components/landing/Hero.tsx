import { Sparkles, Package, FileText, AlertTriangle, QrCode, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  const features = [
    { icon: Package, text: "PPWR Article 24 Compliance", color: "text-primary" },
    { icon: FileText, text: "Digital Product Passport", color: "text-accent" },
    { icon: AlertTriangle, text: "Green Claims Detection", color: "text-yellow-500" },
    { icon: QrCode, text: "QR Code Verification", color: "text-primary" },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-20 lg:pt-0 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 gradient-navy" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="container-lg relative z-10 section-padding">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">EU Compliance Made Simple</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
              PPWR, Digital Product Passport and{" "}
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Green Claims
              </span>{" "}
              compliance for EU webshops
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-xl">
              Simple, manual-first compliance tools for small and growing e-commerce businesses. Upload products, run checks, download audit-ready reports.
            </p>
            
            {/* Feature List */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground blue-glow px-8">
                  Start Free Trial
                  <span className="ml-2">→</span>
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="border-border/50 hover:bg-secondary/50">
                  See How It Works
                </Button>
              </a>
            </div>
            
            {/* Trust Text */}
            <p className="text-sm text-muted-foreground">
              Built for small and growing EU webshops. No automation. No integrations. Audit-ready documentation.
            </p>
          </div>
          
          {/* Right Column - Compliance Card */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="glass-card neon-border p-6 lg:p-8 animate-pulse-glow">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Order #12847</h3>
                  <p className="text-sm text-muted-foreground">Processing complete</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                    PPWR
                  </span>
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Compliant
                  </span>
                </div>
              </div>
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass-card p-4">
                  <p className="text-xs text-muted-foreground mb-1">Recommended Box</p>
                  <p className="text-lg font-semibold text-foreground">30×25×15 cm</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-muted-foreground mb-1">Void Space</p>
                  <p className="text-lg font-semibold text-accent">18%</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Space Efficiency</span>
                  <span className="text-sm font-medium text-accent">82% efficient</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-1000"
                    style={{ width: "82%" }}
                  />
                </div>
              </div>
              
              {/* DPP Badge */}
              <div className="absolute -bottom-3 -left-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 backdrop-blur-sm">
                  <FileText className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent">DPP</span>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
