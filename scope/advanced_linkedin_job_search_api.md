# Advanced LinkedIn Job Search API (`fantastic-jobs/advanced-linkedin-job-search-api`) Actor

Access our real-time LinkedIn Jobs database with over 10 million new jobs per month. With detailed company data, recruiter data, and AI enrichments! Get exact results with our advanced filters on title, description, location, company description, no. of employees, industry. Powered by Fantastic.jobs

- **URL**: https://apify.com/fantastic-jobs/advanced-linkedin-job-search-api.md
- **Developed by:** [Fantastic.jobs](https://apify.com/fantastic-jobs) (community)
- **Categories:** Jobs, Lead generation
- **Stats:** 1,008 total users, 238 monthly users, 99.8% runs succeeded, 45 bookmarks
- **User rating**: 4.08 out of 5 stars

## Pricing

from $1.50 / 1,000 jobs

This Actor is paid per event. You are not charged for the Apify platform usage, but only a fixed price for specific events.
Since this Actor supports Apify Store discounts, the price gets lower the higher subscription plan you have.

Learn more: https://docs.apify.com/platform/actors/running/actors-in-store#pay-per-event

## What's an Apify Actor?

Actors are a software tools running on the Apify platform, for all kinds of web data extraction and automation use cases.
In Batch mode, an Actor accepts a well-defined JSON input, performs an action which can take anything from a few seconds to a few hours,
and optionally produces a well-defined JSON output, datasets with results, or files in key-value store.
In Standby mode, an Actor provides a web server which can be used as a website, API, or an MCP server.
Actors are written with capital "A".

## How to integrate an Actor?

If asked about integration, you help developers integrate Actors into their projects.
You adapt to their stack and deliver integrations that are safe, well-documented, and production-ready.
The best way to integrate Actors is as follows.

In JavaScript/TypeScript projects, use official [JavaScript/TypeScript client](https://docs.apify.com/api/client/js.md):

```bash
npm install apify-client
```

In Python projects, use official [Python client library](https://docs.apify.com/api/client/python.md):

```bash
pip install apify-client
```

In shell scripts, use [Apify CLI](https://docs.apify.com/cli/docs.md):

````bash
# MacOS / Linux
curl -fsSL https://apify.com/install-cli.sh | bash
# Windows
irm https://apify.com/install-cli.ps1 | iex
```bash

In AI frameworks, you might use the [Apify MCP server](https://docs.apify.com/platform/integrations/mcp.md).

If your project is in a different language, use the [REST API](https://docs.apify.com/api/v2.md).

For usage examples, see the [API](#api) section below.

For more details, see Apify documentation as [Markdown index](https://docs.apify.com/llms.txt) and [Markdown full-text](https://docs.apify.com/llms-full.txt).


# README

The perfect actor for applications requiring high quality LinkedIn jobs, every week, day, or hour!
We aim to index all LinkedIn jobs worldwide, over 10 million roles per month!

The maximum number of jobs per run is 5,000. If you wish to go over this number, please reach out to us!

- Do you love this Actor? Please leave a review!
- Any issues or feedback? [Please create an issue!](https://apify.com/fantastic-jobs/career-site-job-listing-api/issues/open)

### Technical Details

-   This Actor calls a database that includes LinkedIn jobs posted during the last hour, day, or week. Our scrapers are continiously indexed new roles, several hundreds of thousands every day!

-   You may choose a time range using the 'Time Range' parameter. Please note that there are slight differences between the ranges:

**1h:** Includes jobs that have been indexed by our systems during the last hour. These jobs can be older than 1 hour, for example a reposted job.

**24h:** Includes jobs that have been indexed by our systems during the last 24 hours.  These jobs can be older than 24 hours, for example a reposted job.

**7d:** Includes jobs that have been posted during the last 7 days

**6m:** Includes all active jobs from the last 6 months. This endpoint refreshes every minute with a 45 minute delay. Expired jobs are removed once per hour (we check every job once per hour)

**Note:** The 6m time range does NOT support the following search types: `descriptionSearch`, `descriptionExclusionSearch`, `organizationDescriptionSearch`, `organizationDescriptionExclusionSearch`. If any of these filters are used with the 6m time range, the run will return 0 jobs with an error message.

-   The job data is returned in our APIs with a one hour delay. For example, if a job is posted at 06:00 UTC, it will appear between 07:00 and 08:00 UTC

-   All jobs in the database are unique based on their URL. However, organizations occasionally create duplicates themselves. More commonly, organizations sometimes create the same job listing for multiple cities or states. If you wish to create a rich and unique dataset, we recommend further deduplication on title + organization, or title + organization + locations

-   All jobs are checked on expiry once per day. You can use our [companion Actor](https://apify.com/fantastic-jobs/expired-jobs-api-for-advanced-linkedin-job-search-api) to retrieve a daily list of expired jobs. The cost of using the companion actor is $20 per month.

-   BETA Feature. We extract useful job details from the description with an LLM. We are currently enriching over 99.9% of all **Technology** jobs. Please note that our enrichment is a simple one-shot prompt on each job description, so there might be some errors.

-   There are a number of jobs on LinkedIn without jobposting schema. We also index these but they have slightly less features. These are marked with the field no_jb_schema=true:

-   Where included we provide the external apply url.

### FAQ

**Wait, this isn't a scraper?**  
Technically, no, or yes?
We scrape all jobs in the backend, and you're accessing our database with scraped jobs with a small delay. This is a much more reliable system then scraping LinkedIn directly. This also allows us to enrich and derive data before sharing it with you, adding more value per job!

**Can I see how many jobs will be returned for my query**

Not at the moment, please test with the free plan or create an issue and we'll have a look for you! Make sure to include all parameters.

**How can I retrieve a XML with the jobs from my latest run?**

-   Follow the documentation to create a saved task: https://docs.apify.com/platform/actors/running/tasks
-   Create a schedule for the task: https://docs.apify.com/platform/schedules
-   Copy the following endpoint to access the latest succesfull run from your scheduled task:
    - Replace _task-id_ with the the id of your task, which is the last string of characters in the task's url:
    ![Screenshot showing task ID location](https://mhiqwtehsmorqwewxvqx.supabase.co/storage/v1/object/public/Fantastic-Jobs//Screenshot%202025-06-20%20110947.png)
    
    - Replace _apiKey_ with your api key. You can find your API key at 'Settings' --> 'API & Integrations'

`https://api.apify.com/v2/actor-tasks/*task-id*/runs/last/dataset/items?token=*apiKey*&format=xml&status=SUCCEEDED`

You can export in several formats, not just XML. Please see the documentation for more information:

https://docs.apify.com/api/v2/actor-task-runs-last-get

https://docs.apify.com/api/v2/dataset-items-get

### Input Parameters

#### Maximum Jobs

The maximum number of jobs that can be retrieved in a single run. Must be between 10 and 5,000.

Please set the memory to 512 for runs above 2,000 jobs!

#### Date Posted After

Filter jobs posted on or after a specific date using the `datePostedAfter` parameter.
> **Warning**, some LinkedIn jobs don't include time and default to 00:00. Filter without time or don't use this parameter at all to be on the safe side.
We don't recommend using this parameter if you retrieve jobs on a regular interval with the 1h/24h/7d time range. 

-   `datePostedAfter`: A date or datetime string in UTC. Examples:
    -   Date only: `'2025-01-01'`
    -   With time: `'2025-01-01T14:00:00'`


> **Please keep in mind** that the jobs posted date/time is UTC and there's a 1 to 2 hour delay before jobs appear on this API. Please be wary of duplicate jobs when using this filter.

#### Search Parameters

Our search parameters allow you to include or exclude jobs based on keywords. You may include :* for prefix matching (e.g., 'Soft:*' will match 'Software', 'Softball', etc.)

Location search uses phrase matching, so you must use the exact 'City, State/Region, Country' format. All locations use English names (e.g., 'Munich' not 'München', 'Bavaria' not 'Bayern'). For the UK, use the constituent country as the state (e.g., 'London, England, United Kingdom', 'Edinburgh, Scotland, United Kingdom'). For the US, use the full state name (e.g., 'New York, New York, United States', 'San Francisco, California, United States'). You can also search by just a country (e.g., 'United Kingdom') or a city (e.g., 'London'). Do not use abbreviations (NY, US, UK). If anything is unclear or you're unsure about the correct format for a location, please [create an issue](https://apify.com/fantastic-jobs/career-site-job-listing-api/issues/open).

WARNING. The description searches are VERY intensive and at risk of time-out. Please be very specific, limit your searches to a handful of keywords, and combine with one of the other searches, preferably titleSearch. If you receive errors while using descriptionSearch or descriptionExclusionSearch, please reach out to us.

-   `titleSearch`: Terms to search in job titles
-   `titleExclusionSearch`: Terms to exclude from job titles
-   `locationSearch`: Terms to search in job locations
-   `locationExclusionSearch`: Terms to exclude from job locations
-   `descriptionSearch`: Terms to search in job descriptions (includes title) - **Not supported with 6m time range**
-   `descriptionExclusionSearch`: Terms to exclude from job descriptions (includes title) - **Not supported with 6m time range**
-   `organizationSearch`: Terms to search in organization names
-   `organizationExclusionSearch`: Terms to exclude from organization names
-   `organizationDescriptionSearch`: Terms to search in organization descriptions - **Not supported with 6m time range**
-   `organizationDescriptionExclusionSearch`: Terms to exclude from organization descriptions - **Not supported with 6m time range**

#### Description Type

Type of description to fetch. Options:

-   `text`: Plain text description
-   `html`: HTML formatted description

#### Remote

Filter for remote jobs only. Set to false to include all jobs. This filter is very sensitive and will include jobs that have 'remote' in the title, description, or location.

#### LinkedIn Filters

-   `seniorityFilter`: Filter by seniority level. Available options: "Associate", "Director", "Executive", "Mid-Senior level", "Entry level", "Not Applicable", "Internship" 
This filter applies to English speaking countries only. Other countries have seniority in their own language.

-   `external_apply_url`: Filter for jobs that include an external apply URL (the opposited of Easy Apply)

-   `populateExternalApplyURL`: When enabled, populates the `external_apply_url` field with the `url` field value if `external_apply_url` is null. Which is the case when the job uses LinkedIn EasyApply. This is especially useful for job boards. Default is `false`.

-   `directApply`: Filter for jobs that can be applied to directly through LinkedIn Easy Apply

-   `organizationSlugFilter`: Filter by LinkedIn organization slugs (exact match). The slug is the company specific part of the url. For example the slug in the following url is 'tesla-motors': https://www.linkedin.com/company/tesla-motors/

-   `organizationSlugExclusionFilter`: Exclude jobs from specific LinkedIn organization slugs (exact match)

-   `industryFilter`: Filter by LinkedIn industries. Use exact industry names. Industries containing commas will be automatically wrapped in quotes. You can find a list of industries on our website: https://fantastic.jobs/article/linkedin-industries

-   `organizationEmployeesLte`: Maximum number of employees in the company

-   `organizationEmployeesGte`: Minimum number of employees in the company

-   `removeAgency`: Filter out recruitment agencies, job boards and other low quality sources

-   `EmploymentTypeFilter`: Filter by employment type. Available options: `FULL_TIME`, `PART_TIME`, `CONTRACTOR`, `TEMPORARY`, `INTERN`, `VOLUNTEER`, `PER_DIEM`, `OTHER`

#### AI Filters

-   `includeAi`: BETA Feature: Include AI enriched fields. We enrich jobs with AI to retrieve relevant data from the job description. Please note that this performed with a one-shot prompt, so there might be some errors. **We are currently only enriching technology roles**

-   `aiWorkArrangementFilter`: BETA Feature: Filter by work arrangement. Remote OK = remote with an office available. Remote Solely = remote with no office available. Include both to include all remote jobs. Available options: `On-site`, `Hybrid`, `Remote OK`, `Remote Solely`

-   `aiHasSalary`: BETA Feature: Filter for jobs with salary information only. Set to false to include all jobs. Results include jobs that have either an AI enriched salary or a raw salary (discovered in the job posting schema).

-   `aiExperienceLevelFilter`: BETA Feature: Filter by years of experience. Available options: `0-2`, `2-5`, `5-10`, `10+`

-   `aiVisaSponsorshipFilter`: BETA Feature: Filter for jobs offering visa sponsorship only. Set to false to include all jobs.

-   `aiTaxonomiesFilter`: BETA Feature: Filter by AI taxonomies. This filter is quite broad.
 Available options: Technology, Healthcare, Management & Leadership, Finance & Accounting, Human Resources, Sales, Marketing, Customer Service & Support, Education, Legal, Engineering, Science & Research, Trades, Construction, Manufacturing, Logistics, Creative & Media, Hospitality, Environmental & Sustainability, Retail, Data & Analytics, Software, Energy, Agriculture, Social Services, Administrative, Government & Public Sector, Art & Design, Food & Beverage, Transportation, Consulting, Sports & Recreation, Security & Safety

-   `aiTaxonomiesPrimaryFilter`: BETA Feature: Filter by primary AI taxonomy. This filter will select jobs based on their primary AI Taxonomy

-   `aiTaxonomiesExclusionFilter`: BETA Feature: Exclude jobs by AI taxonomies.

-   `populateAiRemoteLocation`: If enabled, populates `ai_remote_location` with `locations_derived` when `ai_remote_location` is empty. Useful for normalizing location data.

-   `populateAiRemoteLocationDerived`: If enabled, populates `ai_remote_location_derived` with `locations_derived` when `ai_remote_location_derived` is empty. Useful for normalizing location data.

-   `excludeATSDuplicate`: Set this parameter to true to remove the majority of duplicate jobs between this API and the 'Career Site Job Listing API' actor

    We have created a system where every LinkedIn job is checked against the ATS dataset. This system will perform 3 checks for every LinkedIn job:

    -   A (cleaned) URL match
    -   A match of job title + organization name
    -   A match of job title + LinkedIn company profile mapping

    If any of these 3 have a hit, the LinkedIn job will be flagged as ats_duplicate=true in the API output. If none of these 3 have a hit, the LinkedIn job will be flagged as ats_duplicate=false

    Some jobs are not checked; these are jobs that originate from agencies/jobboards (linkedin_org_recruitment_agency_derived=true) or jobs with LinkedIn EasyApply (directapply=true). These jobs will be flagged as ats_duplicate=null

    We are hoping to flag the majority of duplicates in the datasets, but we are looking for exact hits only. This means that there will still be a number of false positives slipping through the cracks. To fully eliminate duplicates between the two datasets, we recommend adding a layer of fuzzy deduplication.

### Output Schema

#### **Output Fields**
| Name | Description|Type| 
| -------- | ------- | ------- |
|id| The job's internal ID. Used for expiration | text |
|title| Job Title| text | 
|organization| Name of the hiring organization | text 
|organization_url| URL to the organization's page | text
|organization_logo| URL to the organization's logo | text
|date_posted| Date & Time of posting | timestamp
|date_created| Date & Time of indexing in our systems | timestamp
|date_validthrough|Date & Time of expiration, is null in most cases | timestamp
|locations_raw| Raw location data, per the [Google for Jobs requirements](https://developers.google.com/search/docs/appearance/structured-data/job-posting#job-posting-definition) | json[]
|locations_alt_raw| Complimentary raw location field for ATS with limited location data, currently only in use for Workday | text[]
|locations_derived| Derived location data, which is the raw data (locations_raw or location_requirements_raw) matched with a database. This is the field where you search locations on. | text[] [{city, admin (state), country}]
|location_type| To identify remote jobs: 'TELECOMMUTE' per the [Google for Jobs requirements](https://developers.google.com/search/docs/appearance/structured-data/job-posting#job-posting-definition) | text
|location_requirements_raw| Location requirement to accompany remote (TELECOMMUTE) jobs per the [Google for Jobs requirements](https://developers.google.com/search/docs/appearance/structured-data/job-posting#job-posting-definition).  | json[]
|salary_raw| raw Salary data per the [Google for Jobs requirements](https://developers.google.com/search/docs/appearance/structured-data/job-posting#job-posting-definition)| json
|employment_type| Types like 'Full Time", "Contract", "Internship" etc. Is an array but most commonly just a single value. | text[]
|url| The URL of the job, can be used to direct traffic to apply for the job | text
|source| the source ATS or career site | text
|source_type| either 'ats' or 'career-site' | text
|source_domain| the domain of the career site| text
|description_text| plain text job description - if included | text
|description_html| raw HTML job description - if included | text
|cities_derived| All cities from locations_derived |json[]
|regions_derived| All regions/states/provinces from locations_derived| json[]
|countries_derived| All countries from locations_derived | json[]
|timezones_derived| Timezones derived from locations_derived | json[]
|lats_derived| lats derived from locations_derived | json[]
|lngs_derived| lngs derived from locations_derived | json[]
remote_derived | jobs flagged as remote by inclusion of the word 'remote' in title, description, raw location, and the offical google jobs 'TELECOMMUTE' schema | bool
seniority | Seniority level: Associate, Director, Executive, Mid-Senior level, Entry level, Not Applicable, Internship | text
directapply | 'true' if the end user can apply directly on the job page, in this case LinkedIn "easyapply". False if the job contains a link to a 3rd party | bool
external_apply_url | The external application url, where included. We don't clean this url so there might be trackers (src, utm_, etc) |	text
no_jb_schema |Set to true if the job was indexed from LinkedIn without JobPosting schema. These jobs have slightly different data from jobs with a schema: - locations_raw has all location data under 'addressLocality' instead of being split up by region/country/locality. (locations_derived still has the split) - orglogo and jobimage both use the same company logo as seen on the page - The following fields are not included: locationtype, locationrequirements, salary_raw, datevalidthrough |	bool
recruiter_name | name of the recruiter (if present) | text
recruiter_title | title of the recruiter (if present) | text
recruiter_url | url to the LI profile of the recruiter (if present) | text
linkedin_org_employees | the number of employees within the job's company according to LI | int
linkedin_org_url | url to the company page | text
linkedin_org_size | the number of employees within the job's company according to the company | text
linkedin_org_slogan | the company's slogan | text
linkedin_org_industry | the company's industry. This is a fixed list that the company can choose from, so could be useful for classification. Keep in mind that this is in the language of the company's HQ | text
linkedin_org_followers | the company's followers on LI | int
linkedin_org_headquarters | the company's HQ location | text
linkedin_org_type | the company's type, like 'privately held', 'public', etc | text
linkedin_org_foundeddate | the company's founded date | text
linkedin_org_specialties | a comma delimited list of the company's specialties | text[]
linkedin_org_locations | the full address of the company's locations|text[]
linkedin_org_description | the description of the company's linkedin page | text
linkedin_org_recruitment_agency_derived | If the company is a recruitment agency, true or false. We identify this for each company using an LLM. The accuracy may vary and job boards might be flagged as false. | bool
linkedin_org_slug | The slug is the company specific part of the url. For example the slug in the following url is 'tesla-motors': https://www.linkedin.com/company/tesla-motors/ | text

#### **AI Output Fields**

BETA Feature **We are currently only enriching technology roles**

Set include_ai to true to include the fields in this table
These fields are derived from the text with an LLM and might contain mistakes.

| Name | Description|Type| 
| -------- | ------- | ------- |
ai_salary_currency | The salary currency |text
ai_salary_value | The salary value, if there's a single salary with no salary range | numeric
ai_salary_minvalue | The salary minimum salary in a range | numeric
ai_salary_maxvalue | The salary maximum salary in a range| numeric
ai_salary_unittext | If the salary is per HOUR/DAY/WEEK/MONTH/YEAR | text
ai_benefits | An array with other non-salary benefits mentioned in the job listing | text[]
ai_experience_level | years of experience required, one of: 0-2, 2-5, 5-10, or 10+ | text
ai_work_arrangement | Remote Solely/Remote OK/Hybrid/On-site. Remote solely is remote without an office available, Remote OK is remote with an optional office. |text
ai_work_arrangement_office_days | when work_arrangement is Hybrid, returns the number of days per week in office | bigint
ai_remote_location | When remote but only in a certain location, returns the location | text[]
ai_remote_location_derived | Derived remote location data, which is the raw data (ai_remote_location) matched with a database of locations. This is the same database as the locations_derived field. | text[]
ai_key_skills | An array of key skills mentioned in the job listing | text[]
ai_hiring_manager_name | If present, the hiring manager name | text
ai_hiring_manager_email_address | If present, the hiring manager's email address | text
ai_core_responsibilities | A 2-sentence summary of the job's core responsibilities | text
ai_requirements_summary | A 2-sentence summary of the job's requirements | text
ai_working_hours | The number of required working hours. Defaults to 40 if not mentioned | bigint
ai_employment_type | One or more employment types as derived from the job description: FULL_TIME/PART_TIME/CONTRACTOR/TEMPORARY/INTERN/VOLUNTEER/PER_DIEM/OTHER | text[]
ai_job_language | The language of the job description | text
ai_visa_sponsorship  | Returns true if the job description mentions Visa sponsorship opportunities | boolean
ai_keywords | An array of AI extracted keywords from the job description | text[]
ai_taxonomies_a | An array of AI assigned taxonomies for the job | text[]
ai_education_requirements | An array of AI extracted education requirements from the job description | text[]

# Actor input Schema

## `timeRange` (type: `string`):

Select the time range for job listings. You can choose between hourly (1h), daily (24h), weekly (7d), or all active jobs (great to get started, last 6 months, 6m). We strongly recommend running the Actor at the same time every hour/day/week to ensure that you get all jobs without duplicates
## `limit` (type: `integer`):

Maximum number of jobs to return per run. The minimum is 10 and the maximum is 5,000. Please set the memory to 1GB for runs above 2,000 jobs.
## `includeAi` (type: `boolean`):

BETA Feature: Include AI enriched fields. We enrich jobs with AI to retrieve relevant data from the job description. Please note that this performed with a one-shot prompt, so there might be some errors. We enrich over 99.9% of all jobs.
## `removeAgency` (type: `boolean`):

Filter out recruitment agencies, job boards and other low quality sources
## `titleSearch` (type: `array`):

Array of job titles to search for. Use :* for prefix matching (e.g., 'Soft:*' will match 'Software', 'Softball', etc.)
## `titleExclusionSearch` (type: `array`):

Array of job titles to exclude. Use :* for prefix matching (e.g., 'Soft:*' will match 'Software', 'Softball', etc.)
## `locationSearch` (type: `array`):

Array of locations to search for. Location search uses phrase matching, so you must use the exact 'City, State/Region, Country' format. All locations use English names (e.g., 'Munich' not 'München', 'Bavaria' not 'Bayern'). For the UK, use the constituent country as the state (e.g., 'London, England, United Kingdom', 'Edinburgh, Scotland, United Kingdom'). For the US, use the full state name (e.g., 'New York, New York, United States', 'San Francisco, California, United States'). You can also search by just a country (e.g., 'United Kingdom') or a city (e.g., 'London'). Do not use abbreviations (NY, US, UK). Use :* for prefix matching (e.g., 'New:*' will match 'New York', 'New Jersey', etc.). If anything is unclear, please create an issue.
## `locationExclusionSearch` (type: `array`):

Array of locations to exclude. Location search uses phrase matching, so you must use the exact 'City, State/Region, Country' format. All locations use English names. For the UK, use the constituent country as the state (e.g., 'London, England, United Kingdom'). Do not use abbreviations (NY, US, UK). Use :* for prefix matching (e.g., 'New:*' will match 'New York', 'New Jersey', etc.). If anything is unclear, please create an issue.
## `descriptionSearch` (type: `array`):

Warning: This search is NOT supported with the 6m backfill API. It might also be too intensive for the 7d API. Please be very specific, limit your searches to a handful of keywords, and combine with one of the other searches, preferably titleSearch. Array of terms to search in job title & description. Use :* for prefix matching (e.g., 'Python:*' will match 'Python', 'Pythonic', etc.)
## `descriptionExclusionSearch` (type: `array`):

Warning: This search is NOT supported with the 6m backfill API. It might also be too intensive for the 7d API. Please be very specific, limit your searches to a handful of keywords, and combine with one of the other searches, preferably titleSearch. Array of terms to exclude from job title & description. Use :* for prefix matching (e.g., 'Python:*' will match 'Python', 'Pythonic', etc.)
## `organizationSearch` (type: `array`):

Array of organization names to search for. Use :* for prefix matching (e.g., 'Google:*' will match 'Google', 'Google Cloud', etc.) Getting several companies with the same name? Use the organizationSlugFilter to filter by LinkedIn organization slugs.
## `organizationExclusionSearch` (type: `array`):

Array of organization names to exclude. Use :* for prefix matching (e.g., 'Google:*' will match 'Google', 'Google Cloud', etc.) Getting several companies with the same name? Use the organizationSlugExclusionFilter to filter by LinkedIn organization slugs.
## `organizationDescriptionSearch` (type: `array`):

Warning: This search is NOT supported with the 6m backfill API. Array of terms to search in organization description. Use :* for prefix matching (e.g., 'Tech:*' will match 'Technology', 'Technical', etc.)
## `organizationDescriptionExclusionSearch` (type: `array`):

Warning: This search is NOT supported with the 6m backfill API. Array of terms to exclude from organization description. Use :* for prefix matching (e.g., 'Tech:*' will match 'Technology', 'Technical', etc.)
## `descriptionType` (type: `string`):

Format of the job description. Choose 'text' for plain text or 'html' for HTML formatted description. Leave empty to include no description.
## `datePostedAfter` (type: `string`):

We don't recommend using this parameter if you retrieve jobs on a regular interval with the 1h/24h/7d time range. Filter jobs posted on or after a specific date. The correct format is '2025-01-01'. To include time, use the following syntax: '2025-01-01T14:00:00'. Warning, some LinkedIn jobs don't include time and default to 00:00 Please keep in mind that the jobs posted date/time is UTC and there's a 1 to 2 hour delay before jobs appear on this API. Please be wary of duplicate jobs when using this filter.
## `remote` (type: `boolean`):

Filter for remote jobs only. Set to false to include all jobs. This filter is very sensitive and will include jobs that have 'remote' in the title, description, or location.
## `seniorityFilter` (type: `array`):

Filter English speaking countries by seniority level. This filter is case sensitive. You can select multiple seniority levels.
## `externalApplyUrl` (type: `boolean`):

Filter for jobs that include an external apply URL (the opposited of Easy Apply)
## `populateExternalApplyURL` (type: `boolean`):

When enabled, populates the external_apply_url field with the url field value if external_apply_url is null
## `directApply` (type: `boolean`):

Filter for jobs that can be applied to directly through LinkedIn Easy Apply
## `organizationSlugFilter` (type: `array`):

Filter by LinkedIn organization slugs (exact match). The slug is the company specific part of the url. For example the slug in the following url is 'tesla-motors': https://www.linkedin.com/company/tesla-motors/
## `organizationSlugExclusionFilter` (type: `array`):

Exclude jobs from specific LinkedIn organization slugs (exact match). The slug is the company specific part of the url. For example the slug in the following url is 'tesla-motors': https://www.linkedin.com/company/tesla-motors/
## `industryFilter` (type: `array`):

Filter by LinkedIn industries. Use exact industry names. Industries containing commas will be automatically wrapped in quotes. You can find a list of industries on our website: https://fantastic.jobs/article/linkedin-industries
## `organizationEmployeesLte` (type: `integer`):

Maximum number of employees in the company
## `organizationEmployeesGte` (type: `integer`):

Minimum number of employees in the company
## `EmploymentTypeFilter` (type: `array`):

Filter by employment type
## `excludeATSDuplicate` (type: `boolean`):

Set this parameter to true to remove the majority of duplicate jobs between this API and the 'Career Site Job Listing API' actor. We have created a system where every LinkedIn job is checked against the ATS dataset using URL matching, job title + organization name matching, and LinkedIn company profile mapping. Jobs flagged as duplicates will have ats_duplicate=true, non-duplicates will have ats_duplicate=false, and unchecked jobs (agencies/jobboards or EasyApply jobs) will have ats_duplicate=null.
## `populateAiRemoteLocation` (type: `boolean`):

If enabled, populates ai_remote_location with locations_derived when ai_remote_location is empty.
## `populateAiRemoteLocationDerived` (type: `boolean`):

If enabled, populates ai_remote_location_derived with locations_derived when ai_remote_location_derived is empty.
## `aiWorkArrangementFilter` (type: `array`):

BETA Feature: Filter by work arrangement. Remote OK = remote with an office available. Remote Solely = remote with no office available. Include both to include all remote jobs.
## `aiHasSalary` (type: `boolean`):

BETA Feature: Filter for jobs with salary information only. Set to false to include all jobs. Results include jobs that have either an AI enriched salary or a raw salary (discovered in the job posting schema).
## `aiExperienceLevelFilter` (type: `array`):

BETA Feature: Filter by years of experience
## `aiVisaSponsorshipFilter` (type: `boolean`):

BETA Feature: Filter for jobs offering visa sponsorship only. Set to false to include all jobs.
## `aiTaxonomiesFilter` (type: `array`):

BETA Feature: Filter by AI taxonomies
## `aiTaxonomiesPrimaryFilter` (type: `array`):

BETA Feature: Filter by primary AI taxonomy
## `aiTaxonomiesExclusionFilter` (type: `array`):

BETA Feature: Exclude jobs by AI taxonomies. Warning: this filter is very broad and will exclude jobs that are not in any of the selected taxonomies. For example, 'Healthcare' might exclude Software Engineer job in Healthcare. Use inclusive filters to avoid this.

## Actor input object example

```json
{
  "timeRange": "7d",
  "limit": 10,
  "includeAi": true,
  "descriptionType": "text",
  "populateExternalApplyURL": false,
  "populateAiRemoteLocation": false,
  "populateAiRemoteLocationDerived": false
}
````

# Actor output Schema

## `results` (type: `string`):

No description

# API

You can run this Actor programmatically using our API. Below are code examples in JavaScript, Python, and CLI, as well as the OpenAPI specification and MCP server setup.

## JavaScript example

```javascript
import { ApifyClient } from 'apify-client';

// Initialize the ApifyClient with your Apify API token
// Replace the '<YOUR_API_TOKEN>' with your token
const client = new ApifyClient({
    token: '<YOUR_API_TOKEN>',
});

// Prepare Actor input
const input = {};

// Run the Actor and wait for it to finish
const run = await client.actor("fantastic-jobs/advanced-linkedin-job-search-api").call(input);

// Fetch and print Actor results from the run's dataset (if any)
console.log('Results from dataset');
console.log(`💾 Check your data here: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);
const { items } = await client.dataset(run.defaultDatasetId).listItems();
items.forEach((item) => {
    console.dir(item);
});

// 📚 Want to learn more 📖? Go to → https://docs.apify.com/api/client/js/docs

```

## Python example

```python
from apify_client import ApifyClient

# Initialize the ApifyClient with your Apify API token
# Replace '<YOUR_API_TOKEN>' with your token.
client = ApifyClient("<YOUR_API_TOKEN>")

# Prepare the Actor input
run_input = {}

# Run the Actor and wait for it to finish
run = client.actor("fantastic-jobs/advanced-linkedin-job-search-api").call(run_input=run_input)

# Fetch and print Actor results from the run's dataset (if there are any)
print("💾 Check your data here: https://console.apify.com/storage/datasets/" + run["defaultDatasetId"])
for item in client.dataset(run["defaultDatasetId"]).iterate_items():
    print(item)

# 📚 Want to learn more 📖? Go to → https://docs.apify.com/api/client/python/docs/quick-start

```

## CLI example

```bash
echo '{}' |
apify call fantastic-jobs/advanced-linkedin-job-search-api --silent --output-dataset

```

## MCP server setup

```json
{
    "mcpServers": {
        "apify": {
            "command": "npx",
            "args": [
                "mcp-remote",
                "https://mcp.apify.com/?tools=fantastic-jobs/advanced-linkedin-job-search-api",
                "--header",
                "Authorization: Bearer <YOUR_API_TOKEN>"
            ]
        }
    }
}

```

## OpenAPI specification

```json
{
    "openapi": "3.0.1",
    "info": {
        "title": "Advanced LinkedIn Job Search API",
        "description": "Access our real-time LinkedIn Jobs database with over 10 million new jobs per month. With detailed company data, recruiter data, and AI enrichments! Get exact results with our advanced filters on title, description, location, company description, no. of employees, industry. Powered by Fantastic.jobs",
        "version": "0.0",
        "x-build-id": "gkhTaHdFAeQP5QZLD"
    },
    "servers": [
        {
            "url": "https://api.apify.com/v2"
        }
    ],
    "paths": {
        "/acts/fantastic-jobs~advanced-linkedin-job-search-api/run-sync-get-dataset-items": {
            "post": {
                "operationId": "run-sync-get-dataset-items-fantastic-jobs-advanced-linkedin-job-search-api",
                "x-openai-isConsequential": false,
                "summary": "Executes an Actor, waits for its completion, and returns Actor's dataset items in response.",
                "tags": [
                    "Run Actor"
                ],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/inputSchema"
                            }
                        }
                    }
                },
                "parameters": [
                    {
                        "name": "token",
                        "in": "query",
                        "required": true,
                        "schema": {
                            "type": "string"
                        },
                        "description": "Enter your Apify token here"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK"
                    }
                }
            }
        },
        "/acts/fantastic-jobs~advanced-linkedin-job-search-api/runs": {
            "post": {
                "operationId": "runs-sync-fantastic-jobs-advanced-linkedin-job-search-api",
                "x-openai-isConsequential": false,
                "summary": "Executes an Actor and returns information about the initiated run in response.",
                "tags": [
                    "Run Actor"
                ],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/inputSchema"
                            }
                        }
                    }
                },
                "parameters": [
                    {
                        "name": "token",
                        "in": "query",
                        "required": true,
                        "schema": {
                            "type": "string"
                        },
                        "description": "Enter your Apify token here"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/runsResponseSchema"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/acts/fantastic-jobs~advanced-linkedin-job-search-api/run-sync": {
            "post": {
                "operationId": "run-sync-fantastic-jobs-advanced-linkedin-job-search-api",
                "x-openai-isConsequential": false,
                "summary": "Executes an Actor, waits for completion, and returns the OUTPUT from Key-value store in response.",
                "tags": [
                    "Run Actor"
                ],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/inputSchema"
                            }
                        }
                    }
                },
                "parameters": [
                    {
                        "name": "token",
                        "in": "query",
                        "required": true,
                        "schema": {
                            "type": "string"
                        },
                        "description": "Enter your Apify token here"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK"
                    }
                }
            }
        }
    },
    "components": {
        "schemas": {
            "inputSchema": {
                "type": "object",
                "properties": {
                    "timeRange": {
                        "title": "Time Range",
                        "enum": [
                            "1h",
                            "24h",
                            "7d",
                            "6m"
                        ],
                        "type": "string",
                        "description": "Select the time range for job listings. You can choose between hourly (1h), daily (24h), weekly (7d), or all active jobs (great to get started, last 6 months, 6m). We strongly recommend running the Actor at the same time every hour/day/week to ensure that you get all jobs without duplicates",
                        "default": "7d"
                    },
                    "limit": {
                        "title": "Maximum Jobs per API call",
                        "minimum": 10,
                        "maximum": 5000,
                        "type": "integer",
                        "description": "Maximum number of jobs to return per run. The minimum is 10 and the maximum is 5,000. Please set the memory to 1GB for runs above 2,000 jobs.",
                        "default": 10
                    },
                    "includeAi": {
                        "title": "Include AI Fields",
                        "type": "boolean",
                        "description": "BETA Feature: Include AI enriched fields. We enrich jobs with AI to retrieve relevant data from the job description. Please note that this performed with a one-shot prompt, so there might be some errors. We enrich over 99.9% of all jobs.",
                        "default": true
                    },
                    "removeAgency": {
                        "title": "Remove Agency Jobs",
                        "type": "boolean",
                        "description": "Filter out recruitment agencies, job boards and other low quality sources"
                    },
                    "titleSearch": {
                        "title": "Title Search",
                        "type": "array",
                        "description": "Array of job titles to search for. Use :* for prefix matching (e.g., 'Soft:*' will match 'Software', 'Softball', etc.)",
                        "items": {
                            "type": "string"
                        }
                    },
                    "titleExclusionSearch": {
                        "title": "Title Exclusion Search",
                        "type": "array",
                        "description": "Array of job titles to exclude. Use :* for prefix matching (e.g., 'Soft:*' will match 'Software', 'Softball', etc.)",
                        "items": {
                            "type": "string"
                        }
                    },
                    "locationSearch": {
                        "title": "Location Search",
                        "type": "array",
                        "description": "Array of locations to search for. Location search uses phrase matching, so you must use the exact 'City, State/Region, Country' format. All locations use English names (e.g., 'Munich' not 'München', 'Bavaria' not 'Bayern'). For the UK, use the constituent country as the state (e.g., 'London, England, United Kingdom', 'Edinburgh, Scotland, United Kingdom'). For the US, use the full state name (e.g., 'New York, New York, United States', 'San Francisco, California, United States'). You can also search by just a country (e.g., 'United Kingdom') or a city (e.g., 'London'). Do not use abbreviations (NY, US, UK). Use :* for prefix matching (e.g., 'New:*' will match 'New York', 'New Jersey', etc.). If anything is unclear, please create an issue.",
                        "items": {
                            "type": "string"
                        }
                    },
                    "locationExclusionSearch": {
                        "title": "Location Exclusion Search",
                        "type": "array",
                        "description": "Array of locations to exclude. Location search uses phrase matching, so you must use the exact 'City, State/Region, Country' format. All locations use English names. For the UK, use the constituent country as the state (e.g., 'London, England, United Kingdom'). Do not use abbreviations (NY, US, UK). Use :* for prefix matching (e.g., 'New:*' will match 'New York', 'New Jersey', etc.). If anything is unclear, please create an issue.",
                        "items": {
                            "type": "string"
                        }
                    },
                    "descriptionSearch": {
                        "title": "Description Search (includes title) (not supported with 6m time range)",
                        "type": "array",
                        "description": "Warning: This search is NOT supported with the 6m backfill API. It might also be too intensive for the 7d API. Please be very specific, limit your searches to a handful of keywords, and combine with one of the other searches, preferably titleSearch. Array of terms to search in job title & description. Use :* for prefix matching (e.g., 'Python:*' will match 'Python', 'Pythonic', etc.)",
                        "items": {
                            "type": "string"
                        }
                    },
                    "descriptionExclusionSearch": {
                        "title": "Description Exclusion Search (includes title) (not supported with 6m time range)",
                        "type": "array",
                        "description": "Warning: This search is NOT supported with the 6m backfill API. It might also be too intensive for the 7d API. Please be very specific, limit your searches to a handful of keywords, and combine with one of the other searches, preferably titleSearch. Array of terms to exclude from job title & description. Use :* for prefix matching (e.g., 'Python:*' will match 'Python', 'Pythonic', etc.)",
                        "items": {
                            "type": "string"
                        }
                    },
                    "organizationSearch": {
                        "title": "Organization Search",
                        "type": "array",
                        "description": "Array of organization names to search for. Use :* for prefix matching (e.g., 'Google:*' will match 'Google', 'Google Cloud', etc.) Getting several companies with the same name? Use the organizationSlugFilter to filter by LinkedIn organization slugs.",
                        "items": {
                            "type": "string"
                        }
                    },
                    "organizationExclusionSearch": {
                        "title": "Organization Exclusion Search",
                        "type": "array",
                        "description": "Array of organization names to exclude. Use :* for prefix matching (e.g., 'Google:*' will match 'Google', 'Google Cloud', etc.) Getting several companies with the same name? Use the organizationSlugExclusionFilter to filter by LinkedIn organization slugs.",
                        "items": {
                            "type": "string"
                        }
                    },
                    "organizationDescriptionSearch": {
                        "title": "Organization Description Search (not supported with 6m time range)",
                        "type": "array",
                        "description": "Warning: This search is NOT supported with the 6m backfill API. Array of terms to search in organization description. Use :* for prefix matching (e.g., 'Tech:*' will match 'Technology', 'Technical', etc.)",
                        "items": {
                            "type": "string"
                        }
                    },
                    "organizationDescriptionExclusionSearch": {
                        "title": "Organization Description Exclusion Search (not supported with 6m time range)",
                        "type": "array",
                        "description": "Warning: This search is NOT supported with the 6m backfill API. Array of terms to exclude from organization description. Use :* for prefix matching (e.g., 'Tech:*' will match 'Technology', 'Technical', etc.)",
                        "items": {
                            "type": "string"
                        }
                    },
                    "descriptionType": {
                        "title": "Description Type",
                        "enum": [
                            "text",
                            "html"
                        ],
                        "type": "string",
                        "description": "Format of the job description. Choose 'text' for plain text or 'html' for HTML formatted description. Leave empty to include no description.",
                        "default": "text"
                    },
                    "datePostedAfter": {
                        "title": "Date Posted After",
                        "type": "string",
                        "description": "We don't recommend using this parameter if you retrieve jobs on a regular interval with the 1h/24h/7d time range. Filter jobs posted on or after a specific date. The correct format is '2025-01-01'. To include time, use the following syntax: '2025-01-01T14:00:00'. Warning, some LinkedIn jobs don't include time and default to 00:00 Please keep in mind that the jobs posted date/time is UTC and there's a 1 to 2 hour delay before jobs appear on this API. Please be wary of duplicate jobs when using this filter."
                    },
                    "remote": {
                        "title": "Remote",
                        "type": "boolean",
                        "description": "Filter for remote jobs only. Set to false to include all jobs. This filter is very sensitive and will include jobs that have 'remote' in the title, description, or location."
                    },
                    "seniorityFilter": {
                        "title": "Seniority Level (English speaking countries only)",
                        "type": "array",
                        "description": "Filter English speaking countries by seniority level. This filter is case sensitive. You can select multiple seniority levels.",
                        "items": {
                            "type": "string",
                            "enum": [
                                "Associate",
                                "Director",
                                "Executive",
                                "Mid-Senior level",
                                "Entry level",
                                "Not Applicable",
                                "Internship"
                            ]
                        }
                    },
                    "externalApplyUrl": {
                        "title": "External Apply URL Only",
                        "type": "boolean",
                        "description": "Filter for jobs that include an external apply URL (the opposited of Easy Apply)"
                    },
                    "populateExternalApplyURL": {
                        "title": "Populate External Apply URL with URL if empty",
                        "type": "boolean",
                        "description": "When enabled, populates the external_apply_url field with the url field value if external_apply_url is null",
                        "default": false
                    },
                    "directApply": {
                        "title": "Easy Apply Only",
                        "type": "boolean",
                        "description": "Filter for jobs that can be applied to directly through LinkedIn Easy Apply"
                    },
                    "organizationSlugFilter": {
                        "title": "Organization Slug Filter",
                        "type": "array",
                        "description": "Filter by LinkedIn organization slugs (exact match). The slug is the company specific part of the url. For example the slug in the following url is 'tesla-motors': https://www.linkedin.com/company/tesla-motors/",
                        "items": {
                            "type": "string"
                        }
                    },
                    "organizationSlugExclusionFilter": {
                        "title": "Organization Slug Exclusion Filter",
                        "type": "array",
                        "description": "Exclude jobs from specific LinkedIn organization slugs (exact match). The slug is the company specific part of the url. For example the slug in the following url is 'tesla-motors': https://www.linkedin.com/company/tesla-motors/",
                        "items": {
                            "type": "string"
                        }
                    },
                    "industryFilter": {
                        "title": "Industry Filter",
                        "type": "array",
                        "description": "Filter by LinkedIn industries. Use exact industry names. Industries containing commas will be automatically wrapped in quotes. You can find a list of industries on our website: https://fantastic.jobs/article/linkedin-industries",
                        "items": {
                            "type": "string"
                        }
                    },
                    "organizationEmployeesLte": {
                        "title": "Max Company Size",
                        "minimum": 0,
                        "type": "integer",
                        "description": "Maximum number of employees in the company"
                    },
                    "organizationEmployeesGte": {
                        "title": "Min Company Size",
                        "minimum": 0,
                        "type": "integer",
                        "description": "Minimum number of employees in the company"
                    },
                    "EmploymentTypeFilter": {
                        "title": "Employment Type",
                        "type": "array",
                        "description": "Filter by employment type",
                        "items": {
                            "type": "string",
                            "enum": [
                                "FULL_TIME",
                                "PART_TIME",
                                "CONTRACTOR",
                                "TEMPORARY",
                                "INTERN",
                                "VOLUNTEER",
                                "PER_DIEM",
                                "OTHER"
                            ]
                        }
                    },
                    "excludeATSDuplicate": {
                        "title": "Exclude ATS Duplicates (only use in combination with the Career Site Job Listing API!)",
                        "type": "boolean",
                        "description": "Set this parameter to true to remove the majority of duplicate jobs between this API and the 'Career Site Job Listing API' actor. We have created a system where every LinkedIn job is checked against the ATS dataset using URL matching, job title + organization name matching, and LinkedIn company profile mapping. Jobs flagged as duplicates will have ats_duplicate=true, non-duplicates will have ats_duplicate=false, and unchecked jobs (agencies/jobboards or EasyApply jobs) will have ats_duplicate=null."
                    },
                    "populateAiRemoteLocation": {
                        "title": "Populate AI Remote Location",
                        "type": "boolean",
                        "description": "If enabled, populates ai_remote_location with locations_derived when ai_remote_location is empty.",
                        "default": false
                    },
                    "populateAiRemoteLocationDerived": {
                        "title": "Populate AI Remote Location Derived",
                        "type": "boolean",
                        "description": "If enabled, populates ai_remote_location_derived with locations_derived when ai_remote_location_derived is empty.",
                        "default": false
                    },
                    "aiWorkArrangementFilter": {
                        "title": "AI Work Arrangement",
                        "type": "array",
                        "description": "BETA Feature: Filter by work arrangement. Remote OK = remote with an office available. Remote Solely = remote with no office available. Include both to include all remote jobs.",
                        "items": {
                            "type": "string",
                            "enum": [
                                "On-site",
                                "Hybrid",
                                "Remote OK",
                                "Remote Solely"
                            ]
                        }
                    },
                    "aiHasSalary": {
                        "title": "AI Has Salary",
                        "type": "boolean",
                        "description": "BETA Feature: Filter for jobs with salary information only. Set to false to include all jobs. Results include jobs that have either an AI enriched salary or a raw salary (discovered in the job posting schema)."
                    },
                    "aiExperienceLevelFilter": {
                        "title": "AI Experience Level",
                        "type": "array",
                        "description": "BETA Feature: Filter by years of experience",
                        "items": {
                            "type": "string",
                            "enum": [
                                "0-2",
                                "2-5",
                                "5-10",
                                "10+"
                            ]
                        }
                    },
                    "aiVisaSponsorshipFilter": {
                        "title": "AI Visa Sponsorship",
                        "type": "boolean",
                        "description": "BETA Feature: Filter for jobs offering visa sponsorship only. Set to false to include all jobs."
                    },
                    "aiTaxonomiesFilter": {
                        "title": "AI Taxonomies Filter",
                        "type": "array",
                        "description": "BETA Feature: Filter by AI taxonomies",
                        "items": {
                            "type": "string",
                            "enum": [
                                "Technology",
                                "Healthcare",
                                "Management & Leadership",
                                "Finance & Accounting",
                                "Human Resources",
                                "Sales",
                                "Marketing",
                                "Customer Service & Support",
                                "Education",
                                "Legal",
                                "Engineering",
                                "Science & Research",
                                "Trades",
                                "Construction",
                                "Manufacturing",
                                "Logistics",
                                "Creative & Media",
                                "Hospitality",
                                "Environmental & Sustainability",
                                "Retail",
                                "Data & Analytics",
                                "Software",
                                "Energy",
                                "Agriculture",
                                "Social Services",
                                "Administrative",
                                "Government & Public Sector",
                                "Art & Design",
                                "Food & Beverage",
                                "Transportation",
                                "Consulting",
                                "Sports & Recreation",
                                "Security & Safety"
                            ]
                        }
                    },
                    "aiTaxonomiesPrimaryFilter": {
                        "title": "AI Taxonomies Primary Filter",
                        "type": "array",
                        "description": "BETA Feature: Filter by primary AI taxonomy",
                        "items": {
                            "type": "string",
                            "enum": [
                                "Technology",
                                "Healthcare",
                                "Management & Leadership",
                                "Finance & Accounting",
                                "Human Resources",
                                "Sales",
                                "Marketing",
                                "Customer Service & Support",
                                "Education",
                                "Legal",
                                "Engineering",
                                "Science & Research",
                                "Trades",
                                "Construction",
                                "Manufacturing",
                                "Logistics",
                                "Creative & Media",
                                "Hospitality",
                                "Environmental & Sustainability",
                                "Retail",
                                "Data & Analytics",
                                "Software",
                                "Energy",
                                "Agriculture",
                                "Social Services",
                                "Administrative",
                                "Government & Public Sector",
                                "Art & Design",
                                "Food & Beverage",
                                "Transportation",
                                "Consulting",
                                "Sports & Recreation",
                                "Security & Safety"
                            ]
                        }
                    },
                    "aiTaxonomiesExclusionFilter": {
                        "title": "AI Taxonomies Exclusion Filter (warning: this filter is very broad)",
                        "type": "array",
                        "description": "BETA Feature: Exclude jobs by AI taxonomies. Warning: this filter is very broad and will exclude jobs that are not in any of the selected taxonomies. For example, 'Healthcare' might exclude Software Engineer job in Healthcare. Use inclusive filters to avoid this.",
                        "items": {
                            "type": "string",
                            "enum": [
                                "Technology",
                                "Healthcare",
                                "Management & Leadership",
                                "Finance & Accounting",
                                "Human Resources",
                                "Sales",
                                "Marketing",
                                "Customer Service & Support",
                                "Education",
                                "Legal",
                                "Engineering",
                                "Science & Research",
                                "Trades",
                                "Construction",
                                "Manufacturing",
                                "Logistics",
                                "Creative & Media",
                                "Hospitality",
                                "Environmental & Sustainability",
                                "Retail",
                                "Data & Analytics",
                                "Software",
                                "Energy",
                                "Agriculture",
                                "Social Services",
                                "Administrative",
                                "Government & Public Sector",
                                "Art & Design",
                                "Food & Beverage",
                                "Transportation",
                                "Consulting",
                                "Sports & Recreation",
                                "Security & Safety"
                            ]
                        }
                    }
                }
            },
            "runsResponseSchema": {
                "type": "object",
                "properties": {
                    "data": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": "string"
                            },
                            "actId": {
                                "type": "string"
                            },
                            "userId": {
                                "type": "string"
                            },
                            "startedAt": {
                                "type": "string",
                                "format": "date-time",
                                "example": "2025-01-08T00:00:00.000Z"
                            },
                            "finishedAt": {
                                "type": "string",
                                "format": "date-time",
                                "example": "2025-01-08T00:00:00.000Z"
                            },
                            "status": {
                                "type": "string",
                                "example": "READY"
                            },
                            "meta": {
                                "type": "object",
                                "properties": {
                                    "origin": {
                                        "type": "string",
                                        "example": "API"
                                    },
                                    "userAgent": {
                                        "type": "string"
                                    }
                                }
                            },
                            "stats": {
                                "type": "object",
                                "properties": {
                                    "inputBodyLen": {
                                        "type": "integer",
                                        "example": 2000
                                    },
                                    "rebootCount": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "restartCount": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "resurrectCount": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "computeUnits": {
                                        "type": "integer",
                                        "example": 0
                                    }
                                }
                            },
                            "options": {
                                "type": "object",
                                "properties": {
                                    "build": {
                                        "type": "string",
                                        "example": "latest"
                                    },
                                    "timeoutSecs": {
                                        "type": "integer",
                                        "example": 300
                                    },
                                    "memoryMbytes": {
                                        "type": "integer",
                                        "example": 1024
                                    },
                                    "diskMbytes": {
                                        "type": "integer",
                                        "example": 2048
                                    }
                                }
                            },
                            "buildId": {
                                "type": "string"
                            },
                            "defaultKeyValueStoreId": {
                                "type": "string"
                            },
                            "defaultDatasetId": {
                                "type": "string"
                            },
                            "defaultRequestQueueId": {
                                "type": "string"
                            },
                            "buildNumber": {
                                "type": "string",
                                "example": "1.0.0"
                            },
                            "containerUrl": {
                                "type": "string"
                            },
                            "usage": {
                                "type": "object",
                                "properties": {
                                    "ACTOR_COMPUTE_UNITS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "DATASET_READS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "DATASET_WRITES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "KEY_VALUE_STORE_READS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "KEY_VALUE_STORE_WRITES": {
                                        "type": "integer",
                                        "example": 1
                                    },
                                    "KEY_VALUE_STORE_LISTS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "REQUEST_QUEUE_READS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "REQUEST_QUEUE_WRITES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "DATA_TRANSFER_INTERNAL_GBYTES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "DATA_TRANSFER_EXTERNAL_GBYTES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "PROXY_RESIDENTIAL_TRANSFER_GBYTES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "PROXY_SERPS": {
                                        "type": "integer",
                                        "example": 0
                                    }
                                }
                            },
                            "usageTotalUsd": {
                                "type": "number",
                                "example": 0.00005
                            },
                            "usageUsd": {
                                "type": "object",
                                "properties": {
                                    "ACTOR_COMPUTE_UNITS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "DATASET_READS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "DATASET_WRITES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "KEY_VALUE_STORE_READS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "KEY_VALUE_STORE_WRITES": {
                                        "type": "number",
                                        "example": 0.00005
                                    },
                                    "KEY_VALUE_STORE_LISTS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "REQUEST_QUEUE_READS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "REQUEST_QUEUE_WRITES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "DATA_TRANSFER_INTERNAL_GBYTES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "DATA_TRANSFER_EXTERNAL_GBYTES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "PROXY_RESIDENTIAL_TRANSFER_GBYTES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "PROXY_SERPS": {
                                        "type": "integer",
                                        "example": 0
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
```
