

# CompliPack Landing Page UI Refinement Plan

## Analysis Summary

After reviewing the screenshots and existing components, the core structure is already in place. This plan focuses on **precision refinements** to match the screenshots exactly in layout, spacing, typography, and visual details.

---

## Section-by-Section Updates

### 1. Header Component (`src/components/landing/Header.tsx`)

**Current State**: Matches screenshots closely with logo, nav links, dropdown, and CTAs.

**Refinements Needed**:
- Ensure nav items match exactly: Features, How it Works, Pricing, FAQ, Compliance (dropdown)
- Add dark mode toggle icon (moon icon) before Login button
- "Start Free Trial" button styling matches (rounded with blue glow)

**Code Changes**:
- Add Moon icon from lucide-react before Login
- Verify spacing between nav items (gap-8 desktop)

---

### 2. Hero Section (`src/components/landing/Hero.tsx`)

**Current State**: Has badge, headline, subtext, feature list, and compliance card.

**Refinements Needed (per Screenshot 1)**:
- Badge: Green pill with sparkle icon and "EU Compliance Made Simple"
- Headline must be exactly: "PPWR, Digital Product Passport and **Green Claims** compliance for EU webshops"
- The "Green Claims" text should have gradient: green transitioning to blue
- Feature list with proper icons (Package, FileText, AlertTriangle, QrCode)
- Footer text: "Built for small and growing EU webshops. No automation. No integrations. Audit-ready documentation."

**Compliance Card Refinements**:
- Order card with "Order #12847" and "Processing complete" subtitle
- Badge layout: "PPWR" pill (blue bg), "Compliant" badge (green with checkmark)
- Two metrics boxes: "Recommended Box: 30x25x15 cm" and "Void Space: 18%"
- Progress bar showing "82% efficient" (green gradient)
- Floating "DPP" badge at bottom left of card

---

### 3. Features Section (`src/components/landing/Features.tsx`)

**Current State**: 3 glass cards with icons.

**Refinements Needed (per Screenshot 2)**:
- Section title: "Everything You Need for **EU Compliance**" (green accent)
- Subtitle: "Simple, manual-first tools designed for small and growing webshops. No technical knowledge required."
- 3 cards with correct icons and colors:
  1. **PPWR Compliance** (blue icon, Package): "Automatic box optimization to stay under 40% void space. EU PPWR Article 24 compliant packaging recommendations."
  2. **DPP Generation** (green icon, FileText): "Digital Product Passports with material composition, carbon footprint, and recyclability scores for your products."
  3. **QR Code Labels** (yellow icon, QrCode): "Generate print-ready labels with PPWR and DPP QR codes. Customers can scan for instant compliance verification."

**Visual Details**:
- Icon containers: rounded-2xl with colored bg (blue/10, green/10, yellow/10)
- Cards have neon-border glow

---

### 4. How It Works Section (`src/components/landing/HowItWorks.tsx`)

**Current State**: 3-step flow with cards.

**Refinements Needed (per Screenshot 3)**:
- Section title: "How It Works"
- Subtitle: "Get compliant in three simple steps. No integrations required."
- Step badges: "01", "02", "03" in dark pills above each card
- Icons in rounded-2xl containers with specific colors:
  1. **Upload Your Products** (blue, Upload icon): "Import via CSV file or paste product data directly. Compatible with Shopify exports."
  2. **Run Compliance Check** (green, CheckCircle icon): "Our system analyzes dimensions, calculates void space, and checks green claims instantly."
  3. **Download Reports** (yellow, Download icon): "Get professional PDF reports with compliance data and print-ready QR code labels."
- Connecting dots below each icon (small green glowing dots)
- Horizontal glow line connecting the three cards

---

### 5. Pricing Section (`src/components/landing/Pricing.tsx`)

**Current State**: 3 pricing tiers with features.

**Refinements Needed (per Screenshot 4)**:
- Section label: "Built for Small EU Webshops" (green text)
- Subtitle: "Upload your products and get compliant. No integrations required. No technical setup."
- Trial text: "Start with a 14-day free trial. Cancel anytime."

**Card Details**:

**Basic - EUR19/month**:
- Icon: Package (blue bg)
- Tagline: "PPWR Compliance"
- Accent: "Start compliant from day one" (green)
- Features with green checkmarks:
  - PPWR empty space compliance check
  - Manual product import (CSV or copy-paste)
  - 1-page PPWR compliance PDF
  - 1 unique PPWR QR code
  - Public verification page

**Standard - EUR39/month** (Most Popular badge):
- Icon: FileText (green bg)
- Tagline: "PPWR + Digital Product Passport"
- Accent: "Complete product documentation" (green)
- Features:
  - Everything in Basic
  - Digital Product Passport (DPP) - NEW badge
  - Manual DPP data entry
  - 2-page compliance PDF
  - 2 QR codes (PPWR + DPP)
  - Separate verification pages
- "Most Popular" badge with sparkle icon

**Pro - EUR69/month**:
- Icon: Shield (yellow bg)
- Tagline: "Full Compliance"
- Accent: "Complete EU compliance protection" (green)
- Features:
  - Everything in Standard
  - Green Claims risk detection - NEW badge
  - AI-assisted compliant wording suggestions - NEW badge
  - Manual confirmation workflow
  - Environmental claims compliance statement
  - Full compliance PDF with disclaimers

**CTA Buttons**:
- Basic/Pro: "Start Free Trial ->" (secondary style)
- Standard: "Start Free Trial ->" (primary blue with glow)

---

### 6. Compare Plans Section (`src/components/landing/ComparePlans.tsx`)

**Current State**: Comparison table exists.

**Refinements Needed (per Screenshot 5)**:
- Title: "Compare Plans"
- Column headers with colored dots: Basic (gray), Standard (blue), Pro (yellow)
- Feature rows matching screenshot:
  - PPWR compliance check: all have checkmarks
  - Public verification page: all have checkmarks
  - Manual product import: all have checkmarks
  - Digital Product Passport: X for Basic, check for Standard/Pro
  - DPP data entry: X for Basic, check for Standard/Pro
  - Green Claims detection: X for Basic/Standard, check for Pro
  - AI wording suggestions: X for Basic/Standard, check for Pro
  - Confirmation workflow: X for Basic/Standard, check for Pro
  - PDF pages: "1", "2", "Full"
  - QR codes: "1", "2", "2"
- Footer: "30-day money-back guarantee. No questions asked." with moneybag emoji

---

### 7. FAQ Section (`src/components/landing/FAQ.tsx`)

**Current State**: Accordion with dark glass cards.

**Refinements Needed (per Screenshot 6)**:
- Questions visible in screenshot:
  1. What is PPWR compliance?
  2. Do small webshops need PPWR compliance?
  3. What is a Digital Product Passport (DPP)?
  4. What are Green Claims rules?
  5. Does CompliPack replace legal advice?
  6. How does the product import work?
  7. Do I need any integrations or API connections?
  8. What do the QR codes link to?
- Each question in separate glass-card row with chevron-down icon
- Accordion expand/collapse animation

---

### 8. CTA Section (`src/components/landing/CTA.tsx`)

**Current State**: Large glass card with CTAs.

**Refinements Needed (per Screenshot 7)**:
- Title: "Ready to Automate Your **EU Compliance**?" (green accent)
- Subtitle: "Join 500+ e-commerce businesses already using CompliPack to handle PPWR and DPP compliance automatically. Start your free trial today."
- Two buttons side by side:
  - "Start Free Trial ->" (primary blue with glow)
  - "Talk to Sales" (secondary/outline)
- Trust line below: "No credit card required. 14-day free trial. Cancel anytime."
- Card has neon-border glow effect

---

### 9. Footer (`src/components/landing/Footer.tsx`)

**Current State**: Multi-column footer with links.

**Refinements Needed (per Screenshot 7)**:
- Logo + description column: "Automate EU packaging compliance (PPWR) and Digital Product Passport (DPP) generation for e-commerce businesses."
- Social icons: Twitter/X, LinkedIn
- 4 link columns:
  1. **Compliance**: PPWR Compliance, Digital Product Passport, Green Claims
  2. **Product**: Features, Pricing, How it Works
  3. **Resources**: Documentation, Blog, Help Center
  4. **Legal**: Privacy Policy, Terms of Service, Cookie Policy
- Border-top separator
- Copyright at bottom

---

## Technical Implementation Notes

### CSS Utilities Already Available
- `.glass-card` - glassmorphism effect
- `.glass-card-hover` - hover scale + glow
- `.neon-border` - green glow border
- `.blue-glow` - blue CTA glow
- `.text-accent-green` - green text
- `.gradient-navy` - dark gradient bg
- `.animate-fade-in-up` - entrance animation
- `.section-padding` - consistent spacing
- `.container-lg` - max-width container

### Icon Color Coding
- Blue (#3B82F6): PPWR, Upload
- Green (#22C55E): DPP, Compliance, Success
- Yellow (#EAB308): QR, Download, Pro tier

### Typography
- Headings: Space Grotesk (bold, tight tracking)
- Body: Work Sans (regular/medium)
- Accent text: Green gradient or solid green

### Responsive Behavior
- Desktop-first design (lg: breakpoint priority)
- Mobile stacking for cards and features
- Collapsible mobile nav already implemented

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/landing/Header.tsx` | Add dark mode toggle icon |
| `src/components/landing/Hero.tsx` | Update compliance card layout, gradient text |
| `src/components/landing/Features.tsx` | Update copy and icon colors |
| `src/components/landing/HowItWorks.tsx` | Add step badges, connecting dots, glow line |
| `src/components/landing/Pricing.tsx` | Update card structure, icons, feature lists |
| `src/components/landing/ComparePlans.tsx` | Align table data with screenshots |
| `src/components/landing/FAQ.tsx` | Update question list |
| `src/components/landing/CTA.tsx` | Update copy, trust indicators |
| `src/components/landing/Footer.tsx` | Update link structure, description |

---

## No Changes Required

- `package.json` (no modifications)
- Build scripts (no runtime)
- Deployment config (no changes)
- CSS variables (already correct in `globals.css`)

