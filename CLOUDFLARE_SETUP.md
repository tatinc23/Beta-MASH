# Beta-MASH Cloudflare Pages Setup

## ✅ Fixed Issue
Changed `process.env.API_KEY` to `import.meta.env.VITE_GEMINI_API_KEY` in `services/geminiService.ts` to work with Vite/Cloudflare Pages.

## Required Cloudflare Environment Variable

In your Cloudflare Pages dashboard:

1. Go to **Settings** → **Environment variables**
2. Add this variable for **Production** and **Preview**:
   - **Variable name:** `VITE_GEMINI_API_KEY`
   - **Value:** Your Gemini API key

## Build Settings

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (leave blank if using the repo root)
- **Node version:** 18 or higher

## After Setting Environment Variable

1. Go to **Deployments** tab
2. Click **Retry deployment** on the latest deployment
3. The app should now build and work correctly

## Testing Locally

Create a `.env` file (already in .gitignore):
```
VITE_GEMINI_API_KEY=your_key_here
```

Then run:
```bash
npm run dev
```

The app will be at http://localhost:5173
