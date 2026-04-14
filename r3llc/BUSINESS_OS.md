# R3 LLC — Business Operating System
### One-Man Execution Guide

---

## THE SIMPLE VERSION

You do three things:
1. Find companies with operational problems
2. Sell them a system to fix it
3. Build and deliver the system

Everything else gets automated, templated, or eliminated.

---

## PART 1 — YOUR STACK (Total Cost: ~$50/mo)

| Tool | Purpose | Cost |
|---|---|---|
| Vercel | Website hosting | Free |
| Google Workspace | Email (you@rthreellc.com) | $6/mo |
| Calendly | Book discovery calls automatically | Free |
| HubSpot CRM | Track leads and pipeline | Free |
| Notion | Client workspaces + project delivery | Free |
| Stripe | Invoices + retainer payments | % only |
| PandaDoc | Proposals + e-signatures | Free (3 docs/mo) |
| Zapier | Connect everything together | Free tier |
| Google Drive | Store deliverables + SOPs | Free |
| LinkedIn | Primary outreach channel | Free |

**Setup order:** Google Workspace → Calendly → Stripe → HubSpot → Notion → PandaDoc → Zapier

---

## PART 2 — THE AUTOMATED MACHINE

### How a lead becomes a client (automatically):

```
Someone fills out your contact form
        ↓
Auto-reply email fires within 60 seconds (Zapier)
        ↓
You get a Slack/email notification
        ↓
Lead is auto-added to HubSpot CRM (Zapier)
        ↓
You send them a Calendly link (1 click, templated email)
        ↓
They book a discovery call
        ↓
Calendly sends them reminders automatically (24hr + 1hr before)
        ↓
You run the call (30 min)
        ↓
You send proposal (PandaDoc template, takes 10 min to customize)
        ↓
They sign + pay deposit (Stripe link in proposal)
        ↓
Onboarding email sequence fires (Zapier)
        ↓
Notion workspace auto-created from template
        ↓
You do the work
        ↓
Final invoice auto-sent (Stripe)
        ↓
30 days later: check-in email fires automatically
        ↓
Testimonial request fires automatically
```

---

## PART 3 — AUTOMATION SETUP (Step by Step)

### Automation 1: Contact Form → CRM + Auto-Reply
**Tool:** Zapier
**Trigger:** New form submission on your website
**Actions:**
1. Create contact in HubSpot
2. Send auto-reply email from your Gmail:

> Subject: Got your message — here's what happens next
>
> Hi [First Name],
>
> Thanks for reaching out to R3 LLC. I've received your message and will review it within one business day.
>
> If you'd like to skip the wait and book a discovery call directly, here's my calendar:
> [CALENDLY LINK]
>
> Talk soon,
> Harrison Jones
> R3 LLC

---

### Automation 2: Discovery Call Booked → Prep Reminder
**Tool:** Calendly + Zapier
**Trigger:** New Calendly booking
**Actions:**
1. Update HubSpot contact to "Discovery Scheduled"
2. Send yourself a prep email with the prospect's form answers

---

### Automation 3: Proposal Signed → Onboarding Sequence
**Tool:** PandaDoc + Zapier + Gmail
**Trigger:** PandaDoc document signed
**Actions:**
1. Update HubSpot to "Client - Active"
2. Send onboarding email (see template below)
3. Create Stripe subscription (if retainer) or send deposit invoice

---

### Automation 4: 30-Day Post-Delivery Follow-Up
**Tool:** HubSpot Sequences (free)
**Trigger:** Project marked complete
**Emails:**
- Day 30: Check-in email
- Day 45: Testimonial request
- Day 60: Upsell email

---

## PART 4 — EMAIL TEMPLATES

### Discovery Call Confirmation
> Subject: Discovery call confirmed — a quick note before we talk
>
> Hi [Name],
>
> Looking forward to our call on [date/time].
>
> To make the most of our 30 minutes, come ready to talk about:
> - What's breaking down in your current workflow
> - How long it's been a problem
> - What a fix would mean for your business
>
> No prep required — just be honest about what's not working.
>
> See you then,
> Harrison

---

### Proposal Follow-Up (Day 3)
> Subject: Quick follow-up on the R3 proposal
>
> Hi [Name],
>
> Wanted to check in on the proposal I sent over. Any questions I can answer?
>
> If the timing isn't right, no problem — just let me know. If you're ready to move forward, you can sign and pay the deposit directly from the proposal link.
>
> Harrison

---

### Onboarding Email (After Signed + Paid)
> Subject: You're in — here's how we kick off
>
> Hi [Name],
>
> Excited to get started. Here's what happens next:
>
> 1. I'll send you a short kickoff questionnaire today (5 min)
> 2. We'll schedule our kickoff call within the next 3 business days
> 3. You'll get access to your project workspace in Notion
>
> Your kickoff questionnaire: [LINK]
> Your project workspace: [NOTION LINK]
>
> Any questions before we dive in — just reply here.
>
> Harrison

---

### Testimonial Request (Day 45 Post-Delivery)
> Subject: Quick ask — would you be willing to share feedback?
>
> Hi [Name],
>
> Hope things are running smoothly since we wrapped up.
>
> If you've found value in what we built together, I'd really appreciate a short testimonial — even 2-3 sentences about what changed for your team.
>
> You can drop it here: [GOOGLE FORM LINK]
>
> No pressure either way. Thanks for trusting R3 with your business.
>
> Harrison

---

## PART 5 — THE DISCOVERY CALL (30 Minutes)

### Your exact script:

**Minutes 0-2: Set the agenda**
> "Thanks for making time. Here's what I want to do — spend the first 20 minutes understanding your situation, then use the last 10 to tell you honestly whether and how R3 can help. Sound good?"

**Minutes 2-15: Diagnose**
Ask these questions in order:
1. "Walk me through how a contract or agreement moves through your business right now — from when it first comes in to when it's signed."
2. "Where does it get stuck or slow down?"
3. "What does that cost you — in time, deals, or headcount?"
4. "Have you tried to fix it before? What happened?"
5. "If this was working perfectly in 60 days, what does that look like?"

**Minutes 15-25: Recommend**
> "Based on what you've told me, here's what I think is going on and what I'd recommend..."

Pick the right offer:
- Process unclear → **Workflow Clarity Audit** ($3,500, 2 weeks)
- Process clear but broken → **Contract Ops Buildout** ($9,500+, 6-8 weeks)
- Ongoing chaos → **Fractional Ops Partner** ($4,000/mo)
- Post-award issues → **Compliance Layer** ($4,500+)

**Minutes 25-30: Close**
> "Does that feel like it matches what you're dealing with? If so, I can have a proposal to you by [tomorrow/end of week]. It'll include exact scope, timeline, price, and what you get. From there you can sign and we get started — or you can come back with questions. Either way, no pressure."

---

## PART 6 — PROPOSAL TEMPLATE

**Structure (2 pages max):**

```
Page 1:
- Client name + date
- The problem (in their words from the call)
- What we're going to do about it
- What they'll have when we're done

Page 2:
- Investment (price)
- Timeline
- What you need from them
- Terms (50% upfront, 50% on delivery)
- Signature block
- Stripe payment link
```

**Rule:** Never send a proposal longer than 2 pages. Long proposals lose deals.

---

## PART 7 — SERVICE DELIVERY

### For each engagement, use this Notion template:

```
[CLIENT NAME] — [SERVICE NAME]
├── Overview
│   ├── Scope
│   ├── Timeline
│   └── Success metrics
├── Week-by-Week Plan
├── Deliverables Tracker
├── Meeting Notes
├── Client Files
└── Final Deliverables
```

### Workflow Audit Delivery (2 weeks):
- Week 1: Stakeholder interviews + current state mapping
- Week 2: Analysis + SOP writing + readout prep
- Delivery: 1-hour readout call + written report + workflow map

### Contract Ops Buildout Delivery (6-8 weeks):
- Weeks 1-2: Audit (see above)
- Weeks 3-4: System design + tool setup
- Weeks 5-6: Build + test + iterate
- Weeks 7-8: Training + launch + documentation

### Retainer Delivery (monthly):
- Week 1: Async work on priority items
- Week 2: Async work continues
- Week 3: Monthly review call (30 min)
- Week 4: Report + roadmap update

---

## PART 8 — YOUR WEEKLY SCHEDULE

### Non-negotiable blocks:

| Time | Activity |
|---|---|
| Mon 9-10am | Review pipeline in HubSpot, follow up on open proposals |
| Mon-Fri 10am-12pm | Client delivery work (protected) |
| Mon/Wed/Fri 2-4pm | Available for discovery calls (Calendly hours) |
| Tue/Thu 1-3pm | Prospecting + LinkedIn outreach |
| Fri 4-5pm | Weekly review: what closed, what's in pipeline, what's due |

### LinkedIn outreach (Tue/Thu):
- Post 1 piece of content per week (problem → insight → CTA)
- Send 10 connection requests per day to target buyers
- Send 5 follow-up messages to week-old connections
- Template: "Hey [Name] — I work with [their industry] teams on contract workflow and ops systems. Noticed [specific thing about their company]. Would it be worth a quick conversation?"

---

## PART 9 — FINANCIAL SYSTEM

### Pricing rule: Never discount. Offer to reduce scope instead.

### Payment terms:
- Project work: 50% upfront, 50% on delivery
- Retainers: First month upfront, then auto-billed monthly via Stripe

### Revenue targets:
| Month | Goal | How |
|---|---|---|
| Month 1 | $3,500 | 1 Workflow Audit |
| Month 2 | $10,000 | 1 Audit + 1 Buildout deposit |
| Month 3 | $15,000+ | 1 Buildout + 1 retainer |
| Month 6 | $25,000/mo | 2 retainers + project work |

### Invoice immediately. Follow up on day 1, 3, and 7 if unpaid.

---

## PART 10 — 30/60/90 DAY PLAN

### Days 1-30: First Revenue
- [ ] Set up Google Workspace email (hello@rthreellc.com)
- [ ] Set up Calendly and add link to website + email signature
- [ ] Set up Stripe account
- [ ] Set up HubSpot CRM free account
- [ ] Create Notion project template
- [ ] Build proposal template in PandaDoc
- [ ] Set up Zapier automations (form → CRM → auto-reply)
- [ ] Deploy website on Vercel + connect rthreellc.com
- [ ] Write and post first LinkedIn content piece
- [ ] Email 20 warm contacts announcing R3 LLC
- [ ] Send 50 LinkedIn connection requests to target buyers
- [ ] Goal: 5 discovery calls, 1 closed Workflow Audit ($3,500)

### Days 31-60: Build the Pipeline
- [ ] Complete first audit, document the result
- [ ] Ask client for testimonial
- [ ] Add real result to website case studies
- [ ] Post 2x/week on LinkedIn
- [ ] Send 10 outreach messages per day
- [ ] Goal: 2 audits complete, 1 buildout proposal sent, $15K invoiced

### Days 61-90: Lock In Recurring Revenue
- [ ] Identify retainer candidates from completed project clients
- [ ] Present retainer option at project close
- [ ] Goal: 1 retainer signed ($4,000-5,500/mo), MRR established
- [ ] Milestone: $20K+ revenue in 90 days

---

## PART 11 — THE ONLY METRICS THAT MATTER

Track these weekly in HubSpot:
1. **Outreach sent** (target: 50/week)
2. **Discovery calls booked** (target: 3-5/week)
3. **Proposals sent** (target: 1-2/week)
4. **Close rate** (target: 30%+)
5. **MRR from retainers** (target: $10K by month 6)

If revenue is low, the problem is always one of these:
- Not enough outreach → fix: send more messages
- Low call-to-proposal rate → fix: diagnose better on calls
- Low close rate → fix: improve proposals or follow-up
- Wrong targets → fix: tighten your ICP

---

## THE DAILY MINIMUM (when everything else is chaos)

If you can only do 3 things per day:
1. Send 10 outreach messages
2. Do the work for existing clients
3. Follow up on any open proposals

That's the whole business. Everything else is optimization.
