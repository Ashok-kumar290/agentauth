# AgentAuth Homepage

A production-ready homepage built with the hybrid Shopify Editions × Genesis Soil design philosophy.

## Architecture Overview

```
agentauth-site/
├── src/
│   ├── app/
│   │   ├── globals.css      # Tailwind base + component styles
│   │   ├── layout.tsx       # Root layout with metadata
│   │   └── page.tsx         # Homepage composition
│   └── components/
│       ├── index.ts         # Clean exports
│       ├── Header.tsx       # Fixed nav with mobile menu
│       ├── HeroSection.tsx  # Immediate understanding
│       ├── ProblemSection.tsx
│       ├── HowItWorksSection.tsx
│       ├── LiveDemoSection.tsx
│       ├── WhyAgentAuthSection.tsx
│       ├── DeveloperSection.tsx
│       └── CTASection.tsx   # CTA + Footer
├── tailwind.config.ts       # Design tokens
├── next.config.mjs
├── tsconfig.json
└── package.json
```

## Design Philosophy

### Structure (Shopify Editions)
- Clear sections with distinct purposes
- Each section answers ONE question
- Predictable vertical scroll rhythm
- Border-based visual separation

### Flow (Genesis Soil)
- One-page connected experience
- Smooth section transitions
- No hard visual breaks
- Cohesive color palette

## Sections

| Section | Purpose | Key Element |
|---------|---------|-------------|
| Hero | Immediate understanding | Live transaction visualization |
| Problem | Why this exists | Three pain points |
| How It Works | Technical clarity | Interactive code tabs |
| Live Demo | Build trust | Real-time authorization feed |
| Why AgentAuth | Differentiation | Metrics + trust indicators |
| Developer | Drive adoption | CLI/API/SDK code examples |
| CTA | Conversion | Simple waitlist form |

## Motion Rules

All animations use Framer Motion with:
- **Duration**: 200-400ms
- **Easing**: `easeOut`
- **Transform**: `opacity` + `translateY` (max 16px)
- **Accessibility**: Respects `prefers-reduced-motion`

```tsx
const fadeUpVariants = {
  hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};
```

## Design Tokens

```typescript
colors: {
  background: "#000000",  // Pure black
  foreground: "#ffffff",  // Pure white
  muted: "#86868b",       // Apple-style gray
  border: "#1d1d1f",      // Subtle borders
  accent: "#0071e3",      // Restrained blue (used sparingly)
}
```

## Typography

- **Font**: Inter (system fallback)
- **Hierarchy**: Clear scale from h1 (4xl-7xl) down
- **Body**: `text-muted` for secondary text

## Running Locally

```bash
cd agentauth-site
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production Build

```bash
npm run build
npm start
```

## Quality Checklist

- [x] Would pass a Shopify design review
- [x] Every animation justifies itself
- [x] Feels like infrastructure, not marketing
- [x] Enterprise buyer would trust this
- [x] Mobile-first responsive design
- [x] Respects reduced motion preferences
- [x] No scroll jank
- [x] Accessible markup

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (light usage)
