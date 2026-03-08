require("dotenv").config();
const express = require("express");
const path = require("path");
const { ApifyClient } = require("apify-client");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

// Extract candidate profile from LinkedIn URL
app.post("/api/extract-profile", async (req, res) => {
  const { linkedinUrl } = req.body;
  if (!linkedinUrl) return res.status(400).json({ error: "linkedinUrl required" });

  try {
    const run = await apify.actor("anchor/linkedin-profile-enrichment").call({
      startUrls: [{ url: linkedinUrl, id: "candidate" }],
    });

    const { items } = await apify.dataset(run.defaultDatasetId).listItems();
    if (!items.length) return res.status(404).json({ error: "No profile data returned" });

    const profile = items[0];
    res.json({
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
    });
  } catch (err) {
    console.error("Profile extraction error:", err.message);
    res.status(500).json({ error: "Failed to extract profile: " + err.message });
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

// Construct LinkedIn search URLs
app.post("/api/build-linkedin-urls", async (req, res) => {
  const { companyLinkedinId, pastCompanyIds, schoolIds } = req.body;
  if (!companyLinkedinId) return res.status(400).json({ error: "companyLinkedinId required" });

  const baseUrl = "https://www.linkedin.com/search/results/people/";

  let pastCompanyUrl = null;
  if (pastCompanyIds && pastCompanyIds.length) {
    const encoded = encodeURIComponent(JSON.stringify(pastCompanyIds));
    pastCompanyUrl = `${baseUrl}?currentCompany=${companyLinkedinId}&pastCompany=${encoded}`;
  }

  let schoolUrl = null;
  if (schoolIds && schoolIds.length) {
    const encoded = encodeURIComponent(JSON.stringify(schoolIds));
    schoolUrl = `${baseUrl}?currentCompany=${companyLinkedinId}&schoolFilter=${encoded}`;
  }

  res.json({ pastCompanyUrl, schoolUrl });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
