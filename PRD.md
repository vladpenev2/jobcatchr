# JobCatchr - Product Requirements Document

## What it is

A lightweight web tool that finds insider connections at target companies for job candidates. Inspired by Jobright.ai's "Insider Connection" feature, but built as a standalone tool integrated with Glide.

## The Problem

When applying for jobs, candidates benefit from reaching out to people already at the target company. Finding those people manually is slow. Jobright.ai does this but locks it behind their platform. We replicate the core functionality as an independent tool.

## How it works

### Flow

1. **Glide sends a link** with pre-filled URL params (company, LinkedIn company ID, role, location)
2. **User pastes a candidate's LinkedIn URL** into the app
3. **Step 1 - Extract Profile**: App calls Apify's LinkedIn Profile Enrichment actor to get the candidate's past companies, schools, and other data
4. **Step 2 - Find People**: App calls Apify's Exa.ai People Search actor with a natural language query (e.g., "Experience Design Director or hiring manager at Slalom in Georgia") to find relevant people at the target company with their LinkedIn profiles
5. **Step 2 also generates two LinkedIn search URLs**:
   - People at target company who worked at the same past companies as the candidate
   - People at target company who went to the same schools as the candidate
6. **Results displayed** with a "Copy All" button for the people list and "Copy URLs" for the LinkedIn links

### URL Parameters (from Glide)

```
https://web-production-2bf1b.up.railway.app/?company=COMPANY&companyLinkedinId=ID&role=ROLE&location=LOCATION
```

- `company` - Target company name
- `companyLinkedinId` - LinkedIn numeric company ID (e.g., 166000 for Slalom)
- `role` - Job title/role
- `location` - Job location

### Glide Template Column

```
https://web-production-2bf1b.up.railway.app/?company={Company Name}&companyLinkedinId={LinkedIn Company ID}&role={Job Title}&location={Job Location}
```

## Architecture

- **Frontend**: Single HTML page with vanilla JS (no framework)
- **Backend**: Node.js + Express, 3 API endpoints
- **Database**: None. Stateless tool.
- **Hosting**: Railway (Dockerfile-based deployment)
- **External APIs**: 2 Apify actors

### API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/extract-profile` | POST | Calls LinkedIn Profile Enrichment actor with a LinkedIn URL |
| `/api/search-people` | POST | Calls Exa.ai People Search actor with natural language query |
| `/api/build-linkedin-urls` | POST | Constructs LinkedIn search URLs from company/school data |

### Apify Actors Used

1. **`anchor/linkedin-profile-enrichment`** - Extracts profile data (name, experiences, education, skills) from a LinkedIn URL. No cookies needed.
2. **`fantastic-jobs/exa-ai-people-search`** - Searches 1B+ profiles using Exa.ai's neural search with natural language queries. Returns LinkedIn URLs, names, titles.

### Environment Variables

| Variable | Description |
|---|---|
| `APIFY_API_TOKEN` | Apify API token for calling actors |
| `EXA_API_KEY` | Exa.ai API key (passed to the Exa actor) |
| `PORT` | Server port (default 3000) |

## Key Files

```
/
  server.js          # Express server + API routes
  public/
    index.html       # Single page app (HTML + CSS + JS)
  package.json
  Dockerfile         # Railway deployment
  .env               # Local env vars (not committed)
```

## Deployment

- **GitHub**: https://github.com/vladpenev2/jobcatchr (private)
- **Railway**: https://web-production-2bf1b.up.railway.app
- Auto-deploys from `main` branch

## How Jobright.ai Does It (reverse engineering notes)

Jobright embeds connection data in their Next.js `__NEXT_DATA__` server-side rendered payload. Located at `pageProps.dataSource.jobResult.socialConnections`. They maintain a LinkedIn-sourced people database, match by company LinkedIn ID + relevant job title. The "From your company/school" links are just LinkedIn search URLs constructed from the user's profile data mapped to LinkedIn numeric IDs.

## Cost

- **Apify**: Pay per event for LinkedIn enrichment actor + compute for Exa actor
- **Exa.ai**: ~$0.005 per search (10 results), $10 free credits to start
- **Railway**: Free tier or ~$5/month
