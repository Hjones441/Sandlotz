# R3 LLC Website — Setup & Deploy Guide

## Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: lucide-react
- **Font**: Inter (via next/font/google)
- **Deploy target**: Vercel

---

## Local Development

```bash
cd r3llc
npm install
npm run dev
```

Site runs at http://localhost:3000

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

**Required to activate email delivery:**
- `RESEND_API_KEY` — get one free at resend.com (recommended)
- `CONTACT_FROM_EMAIL` — verified sender address (e.g. website@rthreellc.com)
- `CONTACT_TO_EMAIL` — where submissions land (e.g. hello@rthreellc.com)

Until wired up, form submissions log to the server console (perfect for dev/testing).

---

## Wiring the Contact Form (Resend)

1. Install Resend: `npm install resend`
2. Add env vars to `.env.local` and Vercel project settings
3. In `app/api/contact/route.ts`, uncomment the Resend block and import

---

## Deploy to Vercel

```bash
# From repo root or r3llc/ directory
npx vercel --prod
```

Or connect the GitHub repo to Vercel and set the **root directory** to `r3llc/`.

**Vercel settings:**
- Root Directory: `r3llc`
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

Add env vars in Vercel project → Settings → Environment Variables.

---

## What to Customize First

### 1. Replace placeholder photo (FounderSection + About page)
In `components/sections/FounderSection.tsx` and `app/about/page.tsx`, replace the gradient placeholder with:
```tsx
import Image from 'next/image'
// ...
<Image src="/harrison-jones.jpg" alt="Harrison Jones" fill className="object-cover" />
```
Drop the image in `r3llc/public/`.

### 2. Add your real email to Footer
In `components/layout/Footer.tsx`, update `hello@rthreellc.com` if different.

### 3. Wire the contact form
See "Wiring the Contact Form" above.

### 4. Update metadata/SEO
In `app/layout.tsx`, review `metadata.openGraph.url`, image, etc.

### 5. Add a scheduling link (optional)
Replace the "Book a Call" CTAs with a Calendly/Cal.com link if you want direct scheduling:
```tsx
href="https://calendly.com/your-link"
```

### 6. Update pricing as needed
All pricing lives in `app/services/page.tsx` in the `services` array.

### 7. Replace case studies with real ones
When you have real results, update `app/case-studies/page.tsx`.

---

## Page Map

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Home — full story, all sections |
| `/services` | `app/services/page.tsx` | All 5 offers, deliverables, pricing |
| `/industries` | `app/industries/page.tsx` | 5 industry profiles with pain points |
| `/how-it-works` | `app/how-it-works/page.tsx` | 3-phase process + FAQ |
| `/about` | `app/about/page.tsx` | Story, values, founder bio |
| `/case-studies` | `app/case-studies/page.tsx` | 3 result cards + testimonial placeholder |
| `/contact` | `app/contact/page.tsx` | Intake form + contact options |

---

## 30/60/90-Day Revenue Plan

### Days 1–30: Launch & First Revenue
- [ ] Deploy site to Vercel, connect rthreellc.com domain
- [ ] Wire contact form to email
- [ ] Add scheduling link (Calendly/Cal.com — free tier)
- [ ] Outreach to 20 warm contacts explaining the new positioning
- [ ] Target: 5 discovery calls booked, 1 Workflow Clarity Audit closed ($3,500)

### Days 31–60: Proof & Pipeline
- [ ] Complete Audit #1, document the result
- [ ] Ask for a reference/testimonial
- [ ] Add real case study to site
- [ ] Publish 2–3 LinkedIn posts about operational friction (thought leadership)
- [ ] Target: 2 Audits complete, 1 Contract Ops Buildout proposal sent

### Days 61–90: Systematize & Scale
- [ ] Set up CRM (HubSpot free or Notion CRM template)
- [ ] Build proposal template and SOW template
- [ ] Activate LinkedIn outreach sequence
- [ ] Identify first retainer candidate (from Audit clients)
- [ ] Target: 1 retainer client signed ($4,000–5,500/mo), MRR established

---

## Recommended Tool Stack (Lean)

| Function | Tool | Cost |
|---|---|---|
| Website | Vercel | Free tier |
| Domain | Current (rthreellc.com) | ~$15/yr |
| Email | Google Workspace | $6/mo |
| Scheduling | Cal.com | Free |
| CRM | HubSpot Free or Notion | Free |
| Proposals | Google Docs (short term) | Free |
| Payments | Stripe | % per transaction |
| Email delivery | Resend | Free up to 3k/mo |
| Project mgmt | Notion | Free |

**Total monthly overhead to launch: ~$6–15/mo**
