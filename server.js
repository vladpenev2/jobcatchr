require("dotenv").config();
const express = require("express");
const path = require("path");
const { ApifyClient } = require("apify-client");
const { getCachedProfile, cacheProfile, getCachedCompany, cacheCompany } = require("./db");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

// Extract candidate profile from LinkedIn URL (with caching)
app.post("/api/extract-profile", async (req, res) => {
  const { linkedinUrl } = req.body;
  if (!linkedinUrl) return res.status(400).json({ error: "linkedinUrl required" });

  // Check cache first
  const cached = getCachedProfile(linkedinUrl);
  if (cached) {
    console.log("Profile cache hit:", linkedinUrl);
    return res.json({ ...cached, cached: true });
  }

  try {
    const run = await apify.actor("anchor/linkedin-profile-enrichment").call({
      startUrls: [{ url: linkedinUrl, id: "candidate" }],
    });

    const { items } = await apify.dataset(run.defaultDatasetId).listItems();
    if (!items.length) return res.status(404).json({ error: "No profile data returned" });

    const profile = items[0];
    const result = {
      fullName: profile.full_name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
      headline: profile.headline || "",
      city: profile.city || "",
      country: profile.country || "",
      experiences: (profile.experiences || []).map((e) => ({
        company: e.company || e.company_name || "",
        title: e.title || "",
        companyLinkedinUrl: e.company_linkedin_url || e.company_linkedin || "",
      })),
      education: (profile.education || []).map((e) => ({
        school: e.school || e.school_name || "",
        degree: e.degree || "",
        field: e.field_of_study || e.field || "",
      })),
      skills: profile.skills || [],
    };

    cacheProfile(linkedinUrl, result);
    res.json(result);
  } catch (err) {
    console.error("Profile extraction error:", err.message);
    res.status(500).json({ error: "Failed to extract profile: " + err.message });
  }
});

// Resolve company to numeric LinkedIn ID (with caching)
// Accepts companyLinkedinUrl OR companyName (will guess the LinkedIn URL from name)
app.post("/api/resolve-company", async (req, res) => {
  let { companyLinkedinUrl, companyName } = req.body;

  // If no LinkedIn URL but we have a name, try constructing one from the slugified name
  if (!companyLinkedinUrl && companyName) {
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    companyLinkedinUrl = `https://www.linkedin.com/company/${slug}`;
  }

  if (!companyLinkedinUrl) return res.status(400).json({ error: "companyLinkedinUrl or companyName required" });

  // Check cache first
  const cached = getCachedCompany(companyLinkedinUrl);
  if (cached) {
    console.log("Company cache hit:", companyLinkedinUrl);
    return res.json({ ...cached, cached: true });
  }

  try {
    // dev_fusion/linkedin-company-scraper (no cookies needed)
    const run = await apify.actor("dev_fusion/linkedin-company-scraper").call({
      urls: [companyLinkedinUrl],
    });

    const { items } = await apify.dataset(run.defaultDatasetId).listItems();
    if (!items.length) return res.status(404).json({ error: "No company data returned" });

    const company = items[0];
    const result = {
      numericId: String(company.companyId || ""),
      name: company.companyName || "",
      slug: company.universalName || "",
    };

    if (result.numericId) {
      cacheCompany(companyLinkedinUrl, result);
    }
    res.json(result);
  } catch (err) {
    console.error("Company resolve error:", err.message);
    res.status(500).json({ error: "Failed to resolve company: " + err.message });
  }
});

// Search for people via Exa.ai
app.post("/api/search-people", async (req, res) => {
  const { query, location, numResults } = req.body;
  if (!query) return res.status(400).json({ error: "query required" });

  try {
    const run = await apify.actor("fantastic-jobs/exa-ai-people-search").call({
      exaApiKey: process.env.EXA_API_KEY,
      query,
      userLocation: location || "US",
      numResults: numResults || 10,
      includeText: false,
    });

    const { items } = await apify.dataset(run.defaultDatasetId).listItems();
    const people = items.map((item) => ({
      name: item.author || item.title || "",
      title: item.title || "",
      url: item.url || "",
      image: item.image || "",
    }));

    res.json({ people });
  } catch (err) {
    console.error("People search error:", err.message);
    res.status(500).json({ error: "Failed to search people: " + err.message });
  }
});

// Construct LinkedIn search URLs (now uses numeric IDs properly)
app.post("/api/build-linkedin-urls", async (req, res) => {
  const { companyNumericId, pastCompanyIds, schoolIds } = req.body;
  if (!companyNumericId) return res.status(400).json({ error: "companyNumericId required" });

  const baseUrl = "https://www.linkedin.com/search/results/people/";
  const companyFilter = encodeURIComponent(JSON.stringify([companyNumericId]));

  let pastCompanyUrl = null;
  if (pastCompanyIds && pastCompanyIds.length) {
    const pastFilter = encodeURIComponent(JSON.stringify(pastCompanyIds));
    pastCompanyUrl = `${baseUrl}?currentCompany=${companyFilter}&pastCompany=${pastFilter}`;
  }

  let schoolUrl = null;
  if (schoolIds && schoolIds.length) {
    const schoolFilter = encodeURIComponent(JSON.stringify(schoolIds));
    schoolUrl = `${baseUrl}?currentCompany=${companyFilter}&schoolFilter=${schoolFilter}`;
  }

  res.json({ pastCompanyUrl, schoolUrl });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
