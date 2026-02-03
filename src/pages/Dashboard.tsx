import { Link } from "react-router-dom";
import { Package, FileText, AlertTriangle, QrCode, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CompliPack</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/products">
              <Button variant="ghost">Products</Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4" />
            EU Compliance Made Simple
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            PPWR & DPP Compliance for EU Webshops
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Automate your EU packaging compliance. Check PPWR empty space rules, generate Digital Product Passports, and detect Green Claims risks — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button size="lg" className="w-full sm:w-auto">
                Start Compliance Check
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>PPWR Compliance</CardTitle>
              <CardDescription>
                Automatically check packaging empty space against EU Article 24 requirements (max 40% void).
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Digital Product Passport</CardTitle>
              <CardDescription>
                Generate EU-compliant DPP documents with QR codes for your products.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Green Claims Detection</CardTitle>
              <CardDescription>
                AI-powered scanning to detect risky environmental claims and avoid greenwashing fines.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>QR Code Labels</CardTitle>
              <CardDescription>
                Print-ready QR codes linking to compliance documents for your packaging.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">40%</div>
                <div className="text-primary-foreground/80">Max Empty Space (PPWR)</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">2025</div>
                <div className="text-primary-foreground/80">PPWR Enforcement Starts</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">€10M+</div>
                <div className="text-primary-foreground/80">Potential Fines per Violation</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Compliant?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Import your products, check compliance, and generate the documents you need before EU enforcement begins.
          </p>
          <Link to="/products">
            <Button size="lg">
              Go to Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Package className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">CompliPack</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 CompliPack. EU compliance software for e-commerce.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
