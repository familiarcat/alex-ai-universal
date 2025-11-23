# 🪐 Milestone v2.4.2 — Crew Credential Automation Blueprint

## Overview
Documented the credential management strategy needed to transition Alex AI into SaaS mode: no more manual `~/.zshrc` edits, all keys resolved automatically per project.

## Key Points
- Compared SaaS expectations with our DDD architecture to map out bounded contexts (Credential, Project, Automation).
- Defined `Credential` aggregate (type, owner, rotation) and `Project` references so workflows can resolve the correct key.
- Outlined infrastructure changes: shared `CredentialProvider`, secrets storage, UI for key upload, audit events.
- Established plan for milestone pipeline to ingest summaries into RAG once owner keys are centrally managed.

## Strategic Outcome
We now have a crew-approved blueprint for full automation of n8n owner keys per project, paving the way for a “no config” SaaS experience.

