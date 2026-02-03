import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What is PPWR compliance?",
      answer: "PPWR (Packaging and Packaging Waste Regulation) is an EU regulation that limits empty space in packaging to 40%. This applies to all e-commerce shipments in the EU. CompliPack automatically calculates void space and recommends optimal box sizes to keep you compliant.",
    },
    {
      question: "Do small webshops need PPWR compliance?",
      answer: "Yes, PPWR applies to all businesses shipping products to EU consumers, regardless of size. The regulation takes effect in 2025, with full enforcement starting in 2026. Getting compliant early helps avoid potential fines and builds customer trust.",
    },
    {
      question: "What is a Digital Product Passport (DPP)?",
      answer: "A Digital Product Passport is an EU-mandated digital document containing sustainability and compliance information about a product. It includes material composition, recyclability data, repair instructions, and environmental impact metrics. DPPs become mandatory for certain product categories starting in 2026.",
    },
    {
      question: "What are Green Claims rules?",
      answer: "EU Green Claims Directive prevents businesses from making unsubstantiated environmental claims like 'eco-friendly' or 'sustainable'. CompliPack scans your product descriptions for risky claims and suggests compliant alternatives to avoid greenwashing fines.",
    },
    {
      question: "Does CompliPack replace legal advice?",
      answer: "No, CompliPack is a compliance tool that helps you generate documentation and identify potential issues. For complex legal questions or specific regulatory interpretations, we recommend consulting with a qualified legal professional specializing in EU regulations.",
    },
    {
      question: "How does the product import work?",
      answer: "You can import products via Shopify CSV export (go to Admin → Products → Export) or add them manually through our interface. We support all standard Shopify CSV columns including dimensions and weights. Products without complete dimensions will be flagged for manual completion.",
    },
    {
      question: "Do I need any integrations or API connections?",
      answer: "No, CompliPack is designed for manual-first workflows. You upload product data via CSV or enter it manually. There are no API integrations required, no webhooks to set up, and no technical knowledge needed.",
    },
    {
      question: "What do the QR codes link to?",
      answer: "Each QR code links to a public verification page hosted by CompliPack. When scanned, customers and authorities can instantly verify your product's compliance status, view PPWR metrics, and access Digital Product Passport data if available.",
    },
  ];

  return (
    <section id="faq" className="section-padding">
      <div className="container-lg max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about EU compliance
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="glass-card neon-border p-6 lg:p-8">
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card border-none px-4 rounded-xl"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-accent">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
