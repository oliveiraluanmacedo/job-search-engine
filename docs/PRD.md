# PRD — Intelligent Job Discovery Engine

**Version:** 4.1

**Status:** Active

**Owner:** Luan Oliveira

**Project Type:** AI-powered Job Discovery and Qualification Engine

---

# 1. Product Vision

## Objective

Build an intelligent workflow capable of automatically discovering, filtering, evaluating and ranking job opportunities where the candidate has a realistic probability of success.

Unlike traditional job search tools that rely primarily on title matching, this system evaluates opportunities based on transferable experience, domain relevance, career trajectory, and contextual fit.

The objective is to minimize manual screening while maximizing the quality of recommended opportunities.

---

## Core Decision Principle

The system must answer the following question for every opportunity:

> **"Could this candidate successfully perform this role today based on their real-world experience?"**

The recommendation must never rely exclusively on the job title.

---

# 2. Product Goals

The platform exists to optimize the entire job discovery process.

Primary goals include:

- Discover opportunities beyond exact title matching.
- Reduce irrelevant jobs before AI evaluation.
- Minimize OpenAI token consumption.
- Never process the same job twice.
- Produce explainable recommendations.
- Prioritize career growth opportunities.
- Maintain a reusable and modular architecture.
- Keep implementation compatible with n8n.

---

# 3. Success Metrics

## Quality

Target:

- At least 70% of recommended jobs should be classified as:

- STRONG APPLY
- APPLY

---

## Efficiency

Target:

- At least 80% of collected jobs should be filtered before reaching the LLM.

---

## Cost

Target:

- Fewer than 20% of scraped jobs should require OpenAI evaluation.

---

## Deduplication

Target:

- Duplicate rate below 5%.

---

## Performance

Target:

- End-to-end processing under 2 minutes for a standard execution.

---

# 4. Technical Stack

## MVP

- n8n
- JavaScript
- JSearch API
- OpenAI API
- Google Sheets

---

## Future

- PostgreSQL
- Supabase
- Embeddings
- Structured Outputs
- Company Enrichment
- Salary Intelligence

---

# 5. High-Level Architecture

```
JSearch API
        │
        ▼
Normalize Response
        │
        ▼
Hard Filters
        │
        ▼
Historical Deduplication
        │
        ▼
Deterministic Scoring
        │
        ▼
OpenAI Evaluation
        │
        ▼
Decision Matrix
        │
        ▼
Persistence (Google Sheets)
```

Every module must have a single responsibility.

Each module must receive normalized data and return normalized data.

No module should depend directly on another module's internal implementation.

---

# 6. Candidate Profile

## Location

Accepted:

- Ireland
- United Kingdom

---

## English Level

B2 Working Proficiency

---

## Target Seniority

Accepted:

- Junior
- Associate
- Analyst
- Mid-Level

Rejected:

- Senior
- Lead
- Principal
- Head
- Director
- VP
- Staff
- C-Level

---

# 7. Candidate Experience Model

The candidate has strong professional experience in the following domains.

## Product

- Product Manager
- Product Owner
- Product Operations
- Product Analyst

---

## Business

- Business Analyst
- Process Analyst
- Operations Analyst

---

## Fintech

- Payments
- Fraud
- Risk
- Banking Operations

---

## Customer

- Customer Experience
- Customer Operations
- Service Operations

---

## Digital

- SaaS
- Platforms
- Marketplaces
- Data Products

---

# 8. Core Skills

The scoring engine should positively weight opportunities involving one or more of the following skills.

## Product

- Product Discovery
- Product Delivery
- Roadmap Management
- Backlog Prioritization

---

## Data

- SQL
- Power BI
- Google Analytics

---

## Automation

- Process Automation
- Workflow Automation
- APIs
- AI Solutions
- Systems Integration

---

## Cloud

- AWS
- Databricks

---

## Business

- Stakeholder Management
- KPI Definition
- OKRs
- Operational Excellence
- Continuous Improvement

---

# 9. Search Strategy

The system must never search only for a single title.

Instead, searches should be grouped into semantic clusters.

## Product Cluster

- Product Manager
- Product Owner
- Product Operations
- Product Analyst

---

## Business Cluster

- Business Analyst
- Process Analyst
- Operations Analyst

---

## Fintech Cluster

- Payments Analyst
- Fraud Analyst
- Risk Analyst

---

## Customer Cluster

- Customer Experience
- Customer Operations
- CX Analyst

---

## Transformation Cluster

- Digital Operations
- Platform Operations
- Service Operations
- Trust & Safety