# Glassdoor Reviews Scraper (`getdataforme/glassdoor-reviews-scraper`) Actor

Scrape employee reviews from Glassdoor, including job titles, pros, cons, ratings, and more. Ideal for company research, HR analytics, and sentiment analysis. Supports residential proxies for smooth, reliable data extraction. Perfect for informed decision-making.

- **URL**: https://apify.com/getdataforme/glassdoor-reviews-scraper.md
- **Developed by:** [GetDataForMe](https://apify.com/getdataforme) (community)
- **Categories:** Lead generation, Other
- **Stats:** 157 total users, 26 monthly users, 100.0% runs succeeded, 5 bookmarks
- **User rating**: 5.00 out of 5 stars

## Pricing

from $9.00 / 1,000 results

This Actor is paid per event. You are not charged for the Apify platform usage, but only a fixed price for specific events.

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

---

## 📄 Glassdoor Reviews Scraper

**Actor ID:** `glassdoor-reviews-scraper`  
**Target Site:** [Glassdoor](https://www.glassdoor.com)

### 🧾 Description

The **Glassdoor Reviews Scraper** lets you extract authentic employee reviews from [Glassdoor.com](https://www.glassdoor.com) for any public company. This is ideal for competitive research, sentiment analysis, HR analytics, or personal career decisions.

Built to be efficient and reliable, this actor scrapes detailed reviews with ratings, job roles, pros, cons, and much more.

---

### 🔧 Input Parameters

```json
{
  "company_name": "google",
  "item_limit": 25,
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": [
      "RESIDENTIAL"
    ]
  }
}
````

#### Fields:

| Field                | Type    | Required | Description                                                                 |
| -------------------- | ------- | -------- | --------------------------------------------------------------------------- |
| `company_name`       | String  | ✅        | The name of the company (e.g., `"google"`)                                  |
| `item_limit`         | Integer | ❌        | Number of reviews to scrape (default: all available)                        |
| `proxyConfiguration` | Object  | ✅        | Use Apify proxy with `"RESIDENTIAL"` group for optimal scraping performance |

***

### 📤 Output

The actor returns an array of JSON objects, each representing a single review.

#### Sample Output:

```json
{
  "review_id": 96900164,
  "summary": "Good place to work",
  "pros": "Good marketing pay and benefits",
  "cons": "You tend to develop very specialized and niche soft skills...",
  "advice": "Create decision gates, stop changing mind at last second...",
  "rating_overall": 4,
  "rating_recommend_to_friend": "POSITIVE",
  "rating_ceo": "DISAPPROVE",
  "rating_business_outlook": "POSITIVE",
  "rating_career_opportunities": 4.0,
  "rating_compensation_and_benefits": 5.0,
  "rating_culture_and_values": 4,
  "rating_diversity_and_inclusion": 5,
  "rating_senior_leadership": 3.0,
  "rating_work_life_balance": 3.0,
  "review_date_time": "2025-04-24T00:18:33.887",
  "is_current_job": true,
  "length_of_employment": 4,
  "job_title": "Product Marketing Manager",
  "location": "Mountain View, CA",
  "employer_id": 9079,
  "employer_short_name": "Google",
  "employer_logo_url": "https://media.glassdoor.com/sql/9079/google-squarelogo-1441130773284.png",
  "count_helpful": 0,
  "has_employer_response": false,
  "featured": false
}
```

***

### 📊 Data Fields Explained

- **summary, pros, cons, advice** – Review content
- **job\_title, location** – Employee’s role and place of work
- **rating\_**\* – Multiple review metrics (e.g., work-life balance, compensation)
- **employer\_short\_name, logo\_url** – Company branding
- **review\_date\_time** – When the review was published
- **is\_current\_job, length\_of\_employment** – Employment details

***

### 🔒 Proxy Use

✅ **Residential proxies** are required to prevent blocks and ensure access to the content behind login/auth layers.
Using the default Apify proxy settings is highly recommended.

***

### 📬 Support

Need help, feature requests, or bug reports?

- 📧 Email us: **<support@getdataforme.com>**
  *Subject Line*: `"Support: glassdoor-reviews-scraper"`
- 🌐 Fill out our contact form: <https://getdataforme.com/contact>

***

### ✅ Use Cases

- Competitor benchmarking
- Company culture analysis
- Sentiment tracking
- Talent research for HR teams
- Startup validation and research

***

> Get transparent reviews. Empower smarter decisions. 💼

````

# Actor input Schema

## `company_name` (type: `string`):

Company Name is required
## `item_limit` (type: `integer`):

The maximum number of items to scrape.
## `proxyConfiguration` (type: `object`):

Specifies proxy servers that will be used by the scraper in order to hide its origin.

## Actor input object example

```json
{
  "company_name": "meta",
  "item_limit": 30,
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": [
      "RESIDENTIAL"
    ]
  }
}
````

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
const input = {
    "company_name": "meta",
    "item_limit": 30,
    "proxyConfiguration": {
        "useApifyProxy": true,
        "apifyProxyGroups": [
            "RESIDENTIAL"
        ]
    }
};

// Run the Actor and wait for it to finish
const run = await client.actor("getdataforme/glassdoor-reviews-scraper").call(input);

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
run_input = {
    "company_name": "meta",
    "item_limit": 30,
    "proxyConfiguration": {
        "useApifyProxy": True,
        "apifyProxyGroups": ["RESIDENTIAL"],
    },
}

# Run the Actor and wait for it to finish
run = client.actor("getdataforme/glassdoor-reviews-scraper").call(run_input=run_input)

# Fetch and print Actor results from the run's dataset (if there are any)
print("💾 Check your data here: https://console.apify.com/storage/datasets/" + run["defaultDatasetId"])
for item in client.dataset(run["defaultDatasetId"]).iterate_items():
    print(item)

# 📚 Want to learn more 📖? Go to → https://docs.apify.com/api/client/python/docs/quick-start

```

## CLI example

```bash
echo '{
  "company_name": "meta",
  "item_limit": 30,
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": [
      "RESIDENTIAL"
    ]
  }
}' |
apify call getdataforme/glassdoor-reviews-scraper --silent --output-dataset

```

## MCP server setup

```json
{
    "mcpServers": {
        "apify": {
            "command": "npx",
            "args": [
                "mcp-remote",
                "https://mcp.apify.com/?tools=getdataforme/glassdoor-reviews-scraper",
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
        "title": "Glassdoor Reviews Scraper",
        "description": "Scrape employee reviews from Glassdoor, including job titles, pros, cons, ratings, and more. Ideal for company research, HR analytics, and sentiment analysis. Supports residential proxies for smooth, reliable data extraction. Perfect for informed decision-making.",
        "version": "0.0",
        "x-build-id": "LfjAizo6Xg1H6gqGp"
    },
    "servers": [
        {
            "url": "https://api.apify.com/v2"
        }
    ],
    "paths": {
        "/acts/getdataforme~glassdoor-reviews-scraper/run-sync-get-dataset-items": {
            "post": {
                "operationId": "run-sync-get-dataset-items-getdataforme-glassdoor-reviews-scraper",
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
        "/acts/getdataforme~glassdoor-reviews-scraper/runs": {
            "post": {
                "operationId": "runs-sync-getdataforme-glassdoor-reviews-scraper",
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
        "/acts/getdataforme~glassdoor-reviews-scraper/run-sync": {
            "post": {
                "operationId": "run-sync-getdataforme-glassdoor-reviews-scraper",
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
                "required": [
                    "company_name"
                ],
                "properties": {
                    "company_name": {
                        "title": "Company Name",
                        "type": "string",
                        "description": "Company Name is required"
                    },
                    "item_limit": {
                        "title": "Max_limit",
                        "type": "integer",
                        "description": "The maximum number of items to scrape.",
                        "default": 30
                    },
                    "proxyConfiguration": {
                        "title": "Proxy configuration",
                        "type": "object",
                        "description": "Specifies proxy servers that will be used by the scraper in order to hide its origin.",
                        "default": {
                            "useApifyProxy": true,
                            "apifyProxyGroups": [
                                "RESIDENTIAL"
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
