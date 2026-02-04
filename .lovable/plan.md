
# CompliPack Landing Page UI Rebuild

## Overview
Rebuild the landing page (/) to match the provided screenshots exactly, implementing a premium dark-mode SaaS design with glassmorphism effects, neon-green borders, and all required sections.

## Design System Analysis (from screenshots)

### Color Palette
- **Background**: Deep navy gradient (#0a1628 to #0d1b2a)
- **Card backgrounds**: Semi-transparent dark blue with blur (rgba(15, 25, 45, 0.8))
- **Primary accent (CTA)**: Electric blue (#3b82f6 / #2563eb)
- **Success/Compliance**: Neon green (#22c55e / #4ade80)
- **Text primary**: White (#ffffff)
- **Text secondary**: Light gray (#94a3b8)
- **Card borders**: Subtle neon-green glow (rgba(74, 222, 128, 0.3))

### Visual Effects
- Glassmorphism cards with backdrop-blur
- Neon-green border glow on feature cards
- Gradient backgrounds with subtle depth
- Hover effects: scale(1.02) + enhanced glow
- Smooth fade-in animations

---

## Implementation Structure

### File Changes

#### 1. Update CSS Theme (`src/index.css`)
- Define dark theme as default
- Add custom CSS variables for CompliPack colors
- Add glassmorphism utility classes
- Add animation keyframes for fade-in effects

#### 2. Create New Landing Page (`src/pages/Landing.tsx`)
Complete landing page with all sections:

**Header Component**
- CompliPack logo (cube icon + text)
- Navigation: Features, How it Works, Pricing, FAQ, Compliance dropdown
- Right side: Theme toggle, Login, Start Free Trial (blue gradient button)

**Hero Section**
- Left side:
  - "EU Compliance Made Simple" pill badge (green)
  - H1: "PPWR, Digital Product Passport and Green Claims compliance for EU webshops"
  - Subtext about generating compliance PDFs
  - 4 bullet points with icons (PPWR, DPP, Green Claims, QR codes)
  - Footer text about small webshops
- Right side:
  - Glass card showing "Order #12847" with compliance status
  - PPWR badge, Compliant indicator
  - Recommended Box dimensions
  - Void Space percentage (18%)
  - Progress bar (82% efficient)
  - DPP indicator badge

**Features Section**
- Title: "Everything You Need for EU Compliance" (green highlight)
- Subtitle about manual-first tools
- 3-column grid of glass cards:
  - PPWR Compliance (blue icon)
  - DPP Generation (green icon)
  - QR Code Labels (yellow icon)
- Each card has neon-green border

**How It Works Section**
- Title: "How It Works"
- Subtitle: "Get compliant in three simple steps"
- 3-step horizontal flow with connecting dots:
  1. Upload Your Products (blue icon)
  2. Run Compliance Check (green icon)
  3. Download Reports (yellow icon)
- Each step in glass card with step number badge

**Pricing Section**
- Section header: "Built for Small EU Webshops" (green)
- Subtitle about no integrations
- 14-day free trial note
- 3 pricing cards:
  - **Basic** (€19/mo): PPWR only
  - **Standard** (€39/mo): PPWR + DPP, "Most Popular" badge
  - **Pro** (€69/mo): Full suite with Green Claims
- Each card lists features with checkmarks
- "NEW" badges on Pro features

**Compare Plans Table**
- Full-width comparison table
- Features vs Basic/Standard/Pro columns
- Checkmarks and X marks for feature availability
- 30-day money-back guarantee note

**FAQ Section**
- Accordion-style collapsible items
- 8 questions covering PPWR, DPP, Green Claims, etc.
- Dark glass cards with chevron icons

**Final CTA Section**
- Large glass card with green border
- Title: "Ready to Automate Your EU Compliance?" (green highlight)
- Subtitle about 500+ businesses
- Two buttons: Start Free Trial (blue), Talk to Sales (ghost)
- Trust indicators below buttons

**Footer**
- 5-column layout:
  - Logo + description + social icons
  - Compliance links
  - Product links
  - Resources links
  - Legal links
- Copyright bar at bottom

#### 3. Create UI Components

**New Components to Create:**
- `src/components/landing/Header.tsx` - Navigation header
- `src/components/landing/Hero.tsx` - Hero section with compliance card
- `src/components/landing/Features.tsx` - Feature cards grid
- `src/components/landing/HowItWorks.tsx` - 3-step process
- `src/components/landing/Pricing.tsx` - Pricing cards
- `src/components/landing/ComparePlans.tsx` - Feature comparison table
- `src/components/landing/FAQ.tsx` - Accordion FAQ
- `src/components/landing/CTA.tsx` - Final call-to-action
- `src/components/landing/Footer.tsx` - Site footer

**UI Components Needed:**
- `src/components/ui/accordion.tsx` - For FAQ section

#### 4. Update Routing (`src/App.tsx`)
- Replace Dashboard with Landing on "/" route
- Keep other routes intact

---

## Technical Details

### Glass Card Styling
```css
.glass-card {
  background: rgba(15, 30, 50, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(74, 222, 128, 0.2);
  border-radius: 16px;
}
```

### Hover Effects
```css
.card-hover:hover {
  transform: scale(1.02);
  border-color: rgba(74, 222, 128, 0.5);
  box-shadow: 0 0 30px rgba(74, 222, 128, 0.1);
}
```

### Typography
- Headings: font-bold, tracking-tight
- "Green Claims" text in green color
- Body text: text-gray-400

### Responsive Behavior
- Desktop-first design
- Stack to single column on mobile
- Hide compliance card on small screens
- Collapse pricing cards vertically

---

## SEO Implementation
- Page title: "EU PPWR & DPP Compliance Software - CompliPack"
- Meta description for EU compliance keywords
- Semantic HTML with proper heading hierarchy (H1 > H2 > H3)
- Anchor links for smooth scrolling to sections

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/index.css` | Modify - Add dark theme, glass effects |
| `src/pages/Landing.tsx` | Create - Main landing page |
| `src/components/landing/Header.tsx` | Create |
| `src/components/landing/Hero.tsx` | Create |
| `src/components/landing/Features.tsx` | Create |
| `src/components/landing/HowItWorks.tsx` | Create |
| `src/components/landing/Pricing.tsx` | Create |
| `src/components/landing/ComparePlans.tsx` | Create |
| `src/components/landing/FAQ.tsx` | Create |
| `src/components/landing/CTA.tsx` | Create |
| `src/components/landing/Footer.tsx` | Create |
| `src/components/ui/accordion.tsx` | Create |
| `src/App.tsx` | Modify - Update "/" route |
| `index.html` | Modify - Update title/meta |

---

## Constraints Respected
- No new design system introduced
- Exact match to screenshot styling
- Production-ready code
- No backend logic in this phase
- SEO-optimized headings and structure
