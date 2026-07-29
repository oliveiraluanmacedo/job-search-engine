# Canonical Job Schema

Version: 1.0

Status: Active

---

# Purpose

Every data source (JSearch, Adzuna, LinkedIn, Indeed, etc.) returns job data in a different format.

Before any filtering, scoring, AI evaluation or persistence, every job **must** be transformed into this canonical schema.

This document defines the official contract between every module of the system.

Every workflow, JavaScript function and AI prompt must consume and produce this structure.

---

# Design Principles

The schema must be:

- Source agnostic
- Stable
- Easy to extend
- Human readable
- AI friendly
- Compatible with n8n

---

# Canonical Job Object

```json
{
  "job_id": "",
  "title": "",
  "company": "",
  "location": "",
  "country": "",
  "remote": false,
  "hybrid": false,
  "employment_type": "",
  "seniority": "",
  "salary": null,
  "currency": null,
  "description": "",
  "requirements": "",
  "benefits": "",
  "technologies": [],
  "industry": "",
  "keywords": [],
  "company_size": null,
  "posted_at": "",
  "apply_url": "",
  "source": "",
  "language": "en",
  "raw_source": {}
}
```

---

# Field Definitions

## job_id

Type

String

Required

Yes

Purpose

Unique identifier used throughout the system.

Rule

```
lowercase(title + "|" + company)
```

Example

```
product manager|stripe
```

URLs must never be used as identifiers.

---

## title

Type

String

Required

Yes

Official job title.

Example

```
Senior Product Operations Analyst
```

---

## company

Type

String

Required

Yes

Hiring company.

Example

```
Stripe
```

---

## location

Type

String

Required

Yes

Human-readable location.

Example

```
Dublin, Ireland
```

---

## country

Type

String

Required

No

Example

```
Ireland
```

---

## remote

Type

Boolean

Whether the position is fully remote.

---

## hybrid

Type

Boolean

Whether the position is hybrid.

---

## employment_type

Possible values

- Full-time
- Part-time
- Contract
- Temporary
- Internship
- Unknown

---

## seniority

Possible values

- Junior
- Associate
- Analyst
- Mid-Level
- Senior
- Lead
- Principal
- Staff
- Head
- Director
- VP
- Unknown

---

## salary

Type

Number or Null

Monthly or annual salary.

---

## currency

Examples

```
EUR
GBP
USD
```

---

## description

Full job description.

Must preserve formatting whenever possible.

---

## requirements

Technical requirements extracted from the description.

---

## benefits

Benefits extracted from the description.

---

## technologies

Array of strings.

Example

```json
[
  "SQL",
  "Python",
  "Power BI",
  "AWS"
]
```

---

## industry

Examples

- Fintech
- SaaS
- Healthcare
- Marketplace
- Banking

---

## keywords

Important keywords extracted during normalization.

Example

```json
[
  "payments",
  "automation",
  "product",
  "risk"
]
```

---

## company_size

Optional.

Examples

- Startup
- Scale-up
- Enterprise

---

## posted_at

ISO-8601 format whenever possible.

Example

```
2026-07-29
```

---

## apply_url

Direct application URL.

Used only for navigation.

Never use this field as an identifier.

---

## source

Examples

- JSearch
- Adzuna
- LinkedIn
- Indeed

---

## language

ISO language code.

Default

```
en
```

---

## raw_source

Original response returned by the provider.

Purpose

Debugging

Future enrichments

Traceability

Never modify this object.

---

# Normalization Rules

Every integration must normalize provider-specific fields into this schema.

Missing values must be:

```
null
```

instead of removing fields.

Strings must be trimmed.

Whitespace must be normalized.

Arrays must never contain duplicate values.

---

# Validation Rules

The following fields are mandatory:

- job_id
- title
- company
- location
- description
- apply_url
- source

A job missing any mandatory field must be rejected.

---

# Job ID Rules

The canonical identifier is

```
lowercase(title + "|" + company)
```

Examples

```
product manager|stripe

business analyst|revolut

payments analyst|wise
```

The identifier must remain stable across executions.

URLs are explicitly forbidden as identifiers.

---

# Pipeline Contract

Every workflow must follow this sequence.

```
Provider

↓

Normalize

↓

Canonical Job Object

↓

Filtering

↓

Deduplication

↓

Deterministic Scoring

↓

AI Evaluation

↓

Decision

↓

Persistence
```

No module may consume provider-specific data directly.

Every module must receive a Canonical Job Object.

---

# Compatibility

Current Providers

- JSearch

Future Providers

- Adzuna
- LinkedIn
- Indeed
- Greenhouse
- Lever

No downstream component should require changes when a new provider is added.

Only the normalization layer should be updated.

---

# Versioning

Current Version

1.0

Future schema changes must preserve backward compatibility whenever possible.