import { Link } from "react-router-dom";
import { Package, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Compliance",
      links: [
        { label: "PPWR Compliance", href: "/ppwr" },
        { label: "Digital Product Passport", href: "/dpp" },
        { label: "Green Claims", href: "/green-claims" },
        { label: "Compliance Checker", href: "/products" },
      ],
    },
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "How it Works", href: "#how-it-works" },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "#" },
        { label: "Blog", href: "#" },
        { label: "EU Regulations Guide", href: "#" },
        { label: "API Reference", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Cookie Policy", href: "#" },
        { label: "GDPR", href: "#" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border/50 bg-background/50">
      <div className="container-lg section-padding">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">CompliPack</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              EU compliance software for small and mid-size webshops. PPWR, DPP, and Green Claims — simplified.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright Bar */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CompliPack. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            EU compliance software for e-commerce.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
