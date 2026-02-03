

# CompliPack Landing Page - Next.js App Router Integration

## Overview
Integrate the existing CompliPack UI components from `src/components/landing/` into the Next.js 14 App Router, replacing the current SignalCard content. This is a UI-only update - no build scripts or configuration changes.

## Current State Analysis
- **Existing Components**: All landing page components already exist in `src/components/landing/`:
  - `Header.tsx`, `Hero.tsx`, `Features.tsx`, `HowItWorks.tsx`
  - `Pricing.tsx`, `ComparePlans.tsx`, `FAQ.tsx`, `CTA.tsx`, `Footer.tsx`
- **Design System**: Complete dark theme with glassmorphism already defined in `src/index.css`
- **Problem**: `app/page.tsx` currently renders SignalCard content instead of CompliPack

## Files to Modify

### 1. `app/globals.css`
Replace the current light SignalCard theme with the CompliPack dark theme:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* CompliPack Dark Theme */
    --background: 222 47% 7%;
    --foreground: 210 40% 98%;
    --card: 220 45% 10%;
    --card-foreground: 210 40% 98%;
    --primary: 217 91% 60%;
    --primary-foreground: 210 40% 98%;
    --secondary: 220 45% 15%;
    --secondary-foreground: 210 40% 98%;
    --muted: 220 30% 20%;
    --muted-foreground: 215 20% 65%;
    --accent: 142 71% 45%;
    --accent-foreground: 144 80% 10%;
    --border: 220 30% 20%;
    --ring: 142 71% 45%;
    --radius: 0.75rem;
  }

  body {
    @apply bg-background text-foreground antialiased;
    background: linear-gradient(180deg, 
      hsl(222 47% 7%) 0%, 
      hsl(220 50% 5%) 50%,
      hsl(222 47% 7%) 100%
    );
  }
}

/* Glass card utilities, animations, etc. */
```

### 2. `app/layout.tsx`
Update metadata and fonts for CompliPack branding:

```tsx
export const metadata: Metadata = {
  title: "CompliPack - EU PPWR & DPP Compliance Software",
  description: "Generate legally sufficient EU compliance PDFs and QR codes for your products. PPWR packaging compliance, Digital Product Passports, and Green Claims detection."
};

// Update html lang to "en" for EU compliance focus
```

### 3. `app/page.tsx`
Replace SignalCard content with CompliPack landing page:

```tsx
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import ComparePlans from "@/components/landing/ComparePlans";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <ComparePlans />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
```

## Component Structure (Already Exists)

```text
src/components/landing/
├── Header.tsx      - Navigation with CompliPack logo, nav links, CTAs
├── Hero.tsx        - SEO H1, feature bullets, compliance card visual
├── Features.tsx    - 3 glass cards (PPWR, DPP, QR)
├── HowItWorks.tsx  - 3-step horizontal flow with connectors
├── Pricing.tsx     - 3 pricing tiers with feature lists
├── ComparePlans.tsx- Full comparison table
├── FAQ.tsx         - Accordion-style Q&A
├── CTA.tsx         - Final conversion section
└── Footer.tsx      - Links and branding
```

## Design System (Already Defined)

| Element | Style |
|---------|-------|
| Background | Deep navy gradient `#0a1628 → #080d15` |
| Cards | Glassmorphism with 12px blur |
| Borders | Neon green glow `hsla(142, 71%, 45%, 0.3)` |
| Primary CTA | Electric blue with glow |
| Text | White headings, gray-400 body |
| Hover | Scale 1.02 + enhanced glow |

## Visual Hierarchy (Matching Screenshots)

1. **Header**: Fixed, dark with blue CTA button
2. **Hero**: Split layout - left text, right compliance card
3. **Features**: 3-column glass cards with icons
4. **How It Works**: Connected steps with glow dots
5. **Pricing**: 3 cards, middle highlighted
6. **Compare Plans**: Full-width table
7. **FAQ**: Dark accordion
8. **CTA**: Bordered glass card
9. **Footer**: Multi-column links

## Technical Notes

- All imports use `@/components/landing/` path alias
- Components are React Server Components compatible
- Tailwind classes handle all styling
- Existing `src/index.css` utilities will work via shared Tailwind config

## Constraints Respected

- No package.json changes
- No build script modifications
- No Vite configuration
- UI components only
- Compatible with Next.js 14 App Router

