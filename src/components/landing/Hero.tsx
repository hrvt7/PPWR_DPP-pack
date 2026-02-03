import { Package, FileText, AlertTriangle, QrCode, CheckCircle, Box } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const features = [
    { icon: Package, text: "PPWR packaging compliance (≤40% empty space)" },
    { icon: FileText, text: "Digital Product Passport (DPP) generation" },
    { icon: AlertTriangle, text: "Green Claims risk detection" },
    { icon: QrCode, text: "Printable QR codes for verification" },
  ];

  return (
    <section className="pt-32 lg:pt-40 pb-20 lg:pb-28">
      <div className="container-lg">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-6">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">EU Compliance Made Simple</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6">
              PPWR, Digital Product Passport and{" "}
              <span className="text-accent-green">Green Claims</span>{" "}
              compliance for EU webshops
            </h1>
            
            {/* Subtext */}
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Generate legally sufficient EU compliance PDFs and QR codes for your products.
              No integrations required. Upload product data and get compliant in minutes.
            </p>
            
            {/* Feature List */}
            <ul className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm lg:text-base">{feature.text}</span>
                </li>
              ))}
            </ul>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground blue-glow px-8">
                Generate compliance documents
              </Button>
              <a href="#pricing">
                <Button size="lg" variant="outline" className="border-border/50 hover:bg-secondary/50">
                  View pricing
                </Button>
              </a>
            </div>
            
            {/* Footer text */}
            <p className="text-sm text-muted-foreground">
              Built for small EU webshops. No technical setup required.
            </p>
          </div>

          {/* Right Content - Compliance Card */}
          <div className="hidden lg:block animate-fade-in-up delay-200">
            <div className="glass-card neon-border p-6 animate-pulse-glow">
              {/* Order Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Order</p>
                  <p className="text-xl font-bold text-foreground">#12847</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                    PPWR
                  </span>
                  <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Compliant
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="glass-card p-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                    <Box className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">Wireless Earbuds Pro</p>
                    <p className="text-sm text-muted-foreground">Electronics • 145g</p>
                  </div>
                </div>
              </div>

              {/* Recommended Box */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Recommended Box</p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-accent" />
                    <span className="font-medium text-foreground">Box S</span>
                  </div>
                  <span className="text-sm text-muted-foreground">15 × 10 × 5 cm</span>
                </div>
              </div>

              {/* Void Space */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Void Space</p>
                  <p className="text-lg font-bold text-accent">18%</p>
                </div>
                <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
                    style={{ width: '82%' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">82% space efficiency</p>
              </div>

              {/* DPP Badge */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  <span className="font-medium text-foreground">Digital Product Passport</span>
                </div>
                <span className="px-2 py-1 rounded bg-accent/20 text-accent text-xs font-medium">
                  Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
