# System Architecture

**Project:** Intelligent Job Discovery Engine

**Version:** 1.0

---

# Purpose

This document defines the technical architecture of the Intelligent Job Discovery Engine.

It is the primary implementation reference for developers and AI coding agents.

The architecture is designed to be:

- Modular
- Deterministic
- Scalable
- Easy to maintain
- Compatible with n8n
- AI-friendly

---

# High-Level Flow

```
Scheduler

↓

Search Jobs (JSearch)

↓

Normalize Response

↓

Hard Filters

↓

Historical Deduplication

↓

Deterministic Scoring

↓

AI Evaluation

↓

Decision Matrix

↓

Persist Results

↓

End
```

Each stage has a single responsibility.

No stage should contain business logic belonging to another stage.

---

# Directory Structure

```
job-search-engine/

docs/
functions/
prompts/
workflows/

README.md
AGENTS.md
.env.example
```

---

# System Modules

The architecture is divided into independent modules.

Each module receives normalized data and returns normalized data.

---

# Module 1 — Scheduler

## Responsibility

Start the workflow.

## Input

None.

## Output

Execution context.

Possible triggers:

- Cron
- Manual Trigger
- Webhook (future)

---

# Module 2 — Job Search

## Responsibility

Collect jobs from external providers.

Current provider

- JSearch

Future providers

- Adzuna
- LinkedIn
- Indeed

Output:

Provider-specific JSON.

This module must never perform filtering.

---

# Module 3 — Normalization

## Responsibility

Transform provider-specific responses into the Canonical Job Schema.

Input

Provider JSON.

Output

Canonical Job Object.

Reference

docs/canonical-job-schema.md

This is the only module aware of provider-specific field names.

---

# Module 4 — Hard Filters

## Responsibility

Remove obviously irrelevant jobs before any expensive processing.

Rules include:

- Seniority
- Engineering roles
- Manufacturing
- Hardware
- Automotive
- Recruiter spam
- Description quality
- Geographic restrictions

Output

Approved jobs only.

Rejected jobs stop here.

---

# Module 5 — Historical Deduplication

## Responsibility

Prevent duplicate processing.

Process

Generate:

```
job_id
```

Search Google Sheets.

If found

Stop processing.

Otherwise

Continue.

This module prevents unnecessary OpenAI calls.

---

# Module 6 — Deterministic Scoring

## Responsibility

Calculate an initial score using objective rules.

Examples

- Seniority
- Domain match
- Keywords
- Sponsorship
- Location

Output

```
candidate_fit_score
```

No AI is used here.

---

# Module 7 — AI Evaluation

## Responsibility

Evaluate contextual fit.

Input

Canonical Job Object

+

Deterministic Score

Output

Decision

Reason

Opportunity Score

Candidate Fit Score

OpenAI is only called after all previous filters.

---

# Module 8 — Decision Matrix

## Responsibility

Classify opportunities.

Possible decisions

- STRONG APPLY
- APPLY
- APPLY IF INTERESTED
- LOW PRIORITY
- REJECTED

Hard rejection rules always override scores.

---

# Module 9 — Persistence

## Responsibility

Store results.

Current storage

Google Sheets.

Future

PostgreSQL

Supabase

Each execution must be idempotent.

---

# Workflow Responsibilities

The n8n workflow should orchestrate modules only.

Business logic belongs inside reusable functions.

The workflow should remain readable.

---

# JavaScript Functions

Every reusable function belongs inside

```
functions/
```

Examples

```
normalizeJob.js

calculateScore.js

generateJobId.js

containsKeywords.js

extractTechnologies.js

isRecruiterPosting.js

validateJob.js
```

Every function must:

- Have one responsibility
- Be documented
- Be deterministic
- Avoid side effects

---

# Prompt Management

Every prompt belongs inside

```
prompts/
```

Examples

```
job-evaluation.md

company-evaluation.md

system-prompt.md
```

Prompts must never be hardcoded inside n8n nodes.

---

# Workflow Files

Every n8n workflow belongs inside

```
workflows/
```

Example

```
job-discovery.json

daily-run.json
```

---

# Environment Variables

No secret may be hardcoded.

Required variables

```
OPENAI_API_KEY

JSEARCH_API_KEY

GOOGLE_SHEETS_ID

GOOGLE_SERVICE_ACCOUNT

OPENAI_MODEL
```

---

# Error Handling

Recoverable errors

- HTTP timeout
- Rate limits
- Temporary API failures

Strategy

Retry

Exponential backoff

Maximum retries

3

Permanent errors

- Invalid credentials
- Invalid schema
- Missing mandatory fields

These must terminate processing.

---

# Logging

Every module should log:

Start

End

Duration

Errors

Items processed

Example

```
Normalize

Processed:

127 jobs

Rejected:

31

Duration:

4.2 seconds
```

---

# Performance Goals

Target

Less than 20% of collected jobs should reach OpenAI.

Most jobs should be discarded before AI evaluation.

---

# Design Principles

Single Responsibility

Every module has exactly one responsibility.

---

Open for Extension

Adding a new provider should require changing only the normalization layer.

---

Deterministic First

Rule-based decisions always execute before AI.

---

Explainability

Every recommendation must include a reason.

---

Low Cost

Avoid unnecessary OpenAI requests.

---

Maintainability

Small reusable modules.

Minimal coupling.

High cohesion.

---

# Future Architecture

Future versions may introduce

- PostgreSQL
- Embeddings
- Semantic Search
- Company Enrichment
- Salary Intelligence
- Feedback Loop
- Automatic Prompt Optimization
- Multi-user Support
- Application Tracking
- Notification System

The current architecture should allow these features without major redesign.