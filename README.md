# Sandlotz — AI-Powered Sports Marketplace

> Compete. Earn. Dominate.

A Next.js + Firebase MVP for the Sandlotz sports platform. Athletes log workouts, earn **PlayerPoints** (Sandlotz Score™), climb leaderboards, and unlock brand perks.

---

## Tech Stack

| Layer      | Technology                |
|------------|---------------------------|
| Frontend   | Next.js 14 (App Router)   |
| Styling    | Tailwind CSS              |
| Auth       | Firebase Authentication   |
| Database   | Cloud Firestore           |
| Deploy     | Vercel                    |

---

## Project Structure

```
sandlotz/
├── app/
│   ├── dashboard/        # Protected dashboard
│   ├── log-activity/     # Log workout and earn points
│   ├── leaderboard/      # City leaderboard with sport filter
│   ├── login/            # Email + Google sign-in
│   ├── signup/           # Email + Google sign-up
│   ├── profile/          # Profile + activity history
│   ├── perks/            # Perks marketplace (preview)
│   ├── layout.tsx
│   └── page.tsx          # Landing page
├── components/
│   ├── layout/Navbar.tsx
│   └── score/ScoreDisplay.tsx
├── context/
│   └── AuthContext.tsx   # Auth state + Firestore profile
├── lib/
│   ├── firebase.ts       # Firebase init (env vars only)
│   ├── firestore.ts      # DB operations
│   └── sandlotzScore.ts  # Score algorithm + sport config
├── firestore.rules       # Security rules
└── .env.example
```

---

## Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd sandlotz
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your Firebase config from:
**Firebase Console → Project Settings → Your apps → SDK setup**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Enable Firebase Services

In **Firebase Console** (console.firebase.google.com):

**Authentication:**
- Go to Authentication → Sign-in method
- Enable **Email/Password**
- Enable **Google**

**Firestore:**
- Go to Firestore Database → already created
- Deploy the security rules:

```bash
npm install -g firebase-tools
firebase login
firebase use sandlot-connect
firebase deploy --only firestore:rules
```

### 4. Run Locally

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Deploy to Vercel

1. Push this repo to GitHub
2. Go to vercel.com → Import project
3. Add all `NEXT_PUBLIC_FIREBASE_*` env vars in Vercel project settings
4. Click Deploy — Vercel auto-detects Next.js

---

## Sandlotz Score Algorithm

```
Score = (duration_minutes x intensity_multiplier x sport_multiplier)
      + (distance_km x 2 x sport_multiplier)
```

**Intensity Multipliers:**

| Level | Multiplier |
|-------|------------|
| Easy (1)     | 0.5x |
| Light (2)    | 0.75x |
| Moderate (3) | 1.0x |
| Hard (4)     | 1.25x |
| Max (5)      | 1.5x |

**Sport Multipliers:**

| Sport      | Multiplier |
|------------|------------|
| Swimming   | 1.5x |
| HIIT       | 1.3x |
| Running    | 1.2x |
| Basketball | 1.1x |
| Soccer     | 1.1x |
| Tennis     | 1.1x |
| Lifting    | 1.0x |
| Volleyball | 1.0x |
| Hiking     | 0.9x |
| Cycling    | 0.8x |
| Yoga       | 0.7x |

---

## Firestore Schema

```
users/{uid}                        - profile, totalScore, city, sport
activities/{id}                    - uid, sport, duration, distance, intensity, score, notes
leaderboards/{city}/entries/{uid}  - uid, displayName, totalScore, sport
perks/{perkId}                     - brand rewards (admin-managed)
challenges/{id}                    - sponsored challenges (admin-managed)
redemptions/{id}                   - user perk redemptions
```

---

## Rank Tiers

| Score   | Tier    |
|---------|---------|
| 10,000+ | Legend  |
| 5,000+  | Elite   |
| 2,000+  | Pro     |
| 500+    | Athlete |
| 0+      | Rookie  |

---

Built for Sandlotz Inc. — Columbus, OH
