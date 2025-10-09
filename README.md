# B3U Website v3 (Next.js)

Modern rebuild of the B3U podcast & community platform inspired by the section flow of ericthomas.com but fully rebranded.

## Tech Stack
- Next.js 14 (Pages Router for simplicity)
- TypeScript
- Tailwind CSS (custom brand palette)
- Framer Motion (hero animations)
- GSAP (planned: scroll-driven reveals / parallax)
- Stripe or Snipcart (planned: commerce)
- Mailchimp / Formspree (planned: newsletter + forms)

## Brand Tokens
```
Primary Blue:  #7BAFD4 (brandBlue)
Burnt Orange:  #CC5500 (brandOrange)
Navy Base:     #0A1A2A (navy)
```

## Implemented Pages
- `/` Home (hero, about preview, podcast preview, testimonials, shop teaser, newsletter)
- `/about`
- `/podcast` (static filter buttons placeholder, grid)
- `/community` (stories + story submission form + gallery)
- `/shop` (mock cart state, product grid)
- `/contact` (contact form + socials)

## Pending / Next Feature Targets
| Area | Status | Notes |
|------|--------|-------|
| Sticky Nav Active Section Highlight | TODO | Add scroll spy with IntersectionObserver |
| Scroll Animations (GSAP) | TODO | Add timeline + data attributes for stagger |
| Podcast Player | TODO | Embed (e.g., Spotify) + dynamic episode metadata fetch |
| Episode Filtering | TODO | Connect buttons to state filter, maybe tag chips |
| Testimonials Carousel | BASIC | Placeholder – enhance with autoplay + swipe |
| Shop Checkout | TODO | Integrate Stripe Checkout or Snipcart |
| Newsletter Integration | TODO | Wire to Mailchimp/Formspree endpoint |
| SEO & Meta | TODO | Add `<Head>` per page + Open Graph + JSON-LD |
| Accessibility Pass | PARTIAL | Needs focus states audit, aria labels for nav/menu |
| Mobile Menu Drawer | TODO | Implement full screen overlay menu |
| Unit Tests | TODO | Add Jest/React Testing Library skeleton |

## Getting Started
```
cd v3
npm install   # already done once
npm run dev
```
Visit http://localhost:3000

## Environment Variables (planned)
Create `.env.local`:
```
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
MAILCHIMP_API_KEY=
MAILCHIMP_AUDIENCE_ID=
FORM_ENDPOINT=https://formspree.io/f/xxxxx
```

## Code Organization
```
src/
  components/  # UI building blocks
  pages/       # Route pages
  data/        # Static placeholder data
  styles/      # Global Tailwind layer
```

## Adding GSAP Scroll Animations (Outline)
1. Create `useReveal.ts` hook watching elements with `.fade-in-up`.
2. Or use GSAP + ScrollTrigger: register plugin, animate sections with data attributes.
3. Lazy-load GSAP to keep initial bundle lean.

## Commerce Strategy (Option)
- MVP: Snipcart embed (fast, no backend).
- Advanced: Stripe Checkout session creation via Next.js API route `/api/checkout`.

## Testing Roadmap
- Add Jest + React Testing Library.
- Snapshot hero, interaction tests for cart, form validation tests.

## License
Internal / proprietary (adjust as needed).

---
Reach next milestone: implement scroll spy & GSAP reveals, then wire real podcast feed.
