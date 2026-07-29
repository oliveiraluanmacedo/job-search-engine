# Job Search Engine

## Project Goal

Build an intelligent Job Search Engine using n8n.

The system must:

- Search jobs using JSearch API.
- Normalize all jobs into a standard format.
- Score opportunities using deterministic rules.
- Evaluate opportunities with OpenAI.
- Save approved jobs.
- Export workflows compatible with n8n.

---

## Tech Stack

- n8n
- JavaScript
- JSearch API
- OpenAI API

---

## Project Structure

/docs
/functions
/prompts
/workflows

---

## Rules

Never implement multiple phases at once.

Always read implementation-plan.md first.

Explain the architecture before writing code.

Keep functions reusable.

Document every function.

Ask for approval before implementing the next phase.

Prefer JavaScript for n8n Code nodes.

Never hardcode API Keys.

Always use environment variables.

Every workflow must be exportable as JSON.