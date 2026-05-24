# Doc Index

Compact routing map for dsasign. Read the smallest set that matches the task.

| Document                                                                | Purpose                                     | Read when                                              | Status | Last updated |
| ----------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------ | ------ | ------------ |
| [README.md](../README.md)                                               | Public and developer entrypoint             | You need setup, run, or product orientation            | Active | 2026-05-24   |
| [docs/project-brief.md](project-brief.md)                               | Product scope and user flow summary         | You need the problem, audience, or constraints         | Active | 2026-05-24   |
| [docs/architecture-decision-record.md](architecture-decision-record.md) | Main architecture choice and tradeoffs      | You are changing runtime, topology, or boundaries      | Active | 2026-05-24   |
| [docs/flow-overview.md](flow-overview.md)                               | End-to-end signer/verifier flow             | You are changing the main user journey                 | Active | 2026-05-24   |
| [docs/api-contract.md](api-contract.md)                                 | HTTP request and response contract          | You touch `/api/keygen`, `/api/sign`, or `/api/verify` | Active | 2026-05-24   |
| [docs/database-schema.md](database-schema.md)                           | Data model and persistence stance           | You change storage, persistence, or data shape         | Active | 2026-05-24   |
| [docs/DESIGN.md](DESIGN.md)                                             | Human-readable UI and interaction decisions | You change layout, motion, or visuals                  | Active | 2026-05-24   |
| [docs/design-intent.json](design-intent.json)                           | Machine-readable UI contract                | You change UI implementation or review rules           | Active | 2026-05-24   |

Read order for new work: README, project brief, architecture record, flow overview, then the contract doc that matches the change.
