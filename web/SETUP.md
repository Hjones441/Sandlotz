# SandlotzWeb — Marketing Site Setup

This is the standalone marketing site for sandlotz.com.
The app lives separately at app.sandlotz.com (the Sandlotz repo).

## One-time GitHub + Vercel setup

### 1. Create the GitHub repo
Go to https://github.com/new and create:
- Name: `SandlotzWeb` (or `sandlotz-web`)
- Private or Public — your call
- Do NOT initialize with README

### 2. Push this code
```bash
cd /home/user/SandlotzWeb
git remote add origin https://github.com/Hjones441/SandlotzWeb.git
git push -u origin master
```

### 3. Deploy to Vercel
- Go to https://vercel.com/new
- Import the `SandlotzWeb` GitHub repo
- Add these environment variables:
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=        # same as the app
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
  NEXT_PUBLIC_FIREBASE_APP_ID=
  NEXT_PUBLIC_APP_URL=https://app.sandlotz.com
  ```
- Set your custom domain: `sandlotz.com`

### 4. Configure the app Vercel project
- Go to the existing Sandlotz Vercel project
- Set custom domain: `app.sandlotz.com`
- The app repo is `Hjones441/Sandlotz`

## Result
- `sandlotz.com` → this marketing site (SandlotzWeb)
- `app.sandlotz.com` → the Sandlotz app (Sandlotz repo)
