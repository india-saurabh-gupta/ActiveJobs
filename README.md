# Product Roles India — Vercel-ready MVP

India-focused Product Management / Product Owner job discovery app.

## Stack
- React + Vite frontend
- Vercel Serverless Functions (`/api/jobs`, `/api/health`)
- Adzuna India API as the initial live job-data provider

## Deploy with GitHub + Vercel

### 1. Prepare the source
- Extract this project.
- Create a GitHub repository, e.g. `product-roles-india`.
- Push the contents of this folder to the repository root.
- Do not commit `.env`, API keys, `node_modules`, `dist`, or `.vercel`.

### 2. Connect Vercel
- Sign in to Vercel using GitHub.
- Choose **Add New → Project**.
- Import `product-roles-india`.
- Confirm Framework Preset: **Vite**.
- Build command: `npm run build`.
- Output directory: `dist`.
- Root directory: `./` (repository root).

### 3. Configure API credentials
Get credentials from https://developer.adzuna.com/.
In Vercel → Project → Settings → Environment Variables, add:
- `ADZUNA_APP_ID`
- `ADZUNA_APP_KEY`

Add them to **Development**, **Preview**, and **Production** as appropriate, then redeploy. Never put these secrets in frontend code or commit them to GitHub.

### 4. Deploy
Click **Deploy**. Vercel builds the Vite frontend and deploys the files under `/api` as serverless functions.
Every push to the connected production branch (normally `main`) triggers a production deployment. Other branches / pull requests get preview deployments.

## Local development

Install dependencies:
```bash
npm install
```

For Vercel-like local development (recommended for testing API routes):
```bash
npx vercel dev
```
Then open the local URL printed by Vercel.

Alternatively, the legacy Express development proxy is available:
- Terminal 1: `npm run server`
- Terminal 2: `npm run dev`

## Verify after deployment
- Open `/` and check the dashboard loads.
- Open `/api/health` and confirm `providerConfigured: true`.
- Search for `product manager` and confirm `/api/jobs` returns real records.
- Test filters, saved jobs, and external application links.
- Check Vercel Function logs if the API returns an error.

## Data limitations
The first version uses Adzuna's India API only. It does not provide exhaustive LinkedIn, Naukri, Indeed, or company-career-site coverage. Add other sources only through permitted APIs, feeds, or approved partnerships, respecting each source's terms. A listing returned by a job aggregator is not independently confirmed as open; applicants should verify it on the employer's career site. The app does not fabricate sample jobs.

## Before a public launch
- Add a persistent database (e.g. Postgres) and scheduled ingestion.
- Track `first_seen_at`, `last_seen_at`, `source_posted_at`, and `last_verified_at` separately.
- Add deduplication across sources and original career-page links.
- Verify closed/expired jobs and clearly label unverified listings.
- Add rate limits, retries, monitoring, and privacy/security controls.
