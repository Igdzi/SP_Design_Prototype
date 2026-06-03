# SendPulse Design Prototypes

Repository for SendPulse design-system-based HTML UX prototypes.

Before starting any new prototype task, read `SENDPULSE_DESIGN_SYSTEM.md`.

## Prototype Structure

Each prototype lives in its own folder:

```text
Prototype_Name/
  index.html
  styles/
  scripts/
  assets/
```

Current prototypes:

- `CRM_History-Event-Page` - CRM / Analytics / Event history page prototype.

## GitHub Pages

Publish the repository from `main` / `/ (root)`.

The root `index.html` is a prototype catalog. Each prototype folder is available as its own URL:

```text
https://igdzi.github.io/SP_Design_Prototype/CRM_History-Event-Page/
```

For every new prototype, add a new folder with its own `index.html`, then add a link to the root `index.html` catalog.

## Shared Rules

- Use the official SendPulse CSS stack first.
- Prefer Bootstrap v3.4 and SendPulse classes before custom CSS.
- Keep custom CSS scoped to the current prototype folder.
- Reuse the same product shell and interaction patterns across tasks.
- Keep each prototype ready for developer handoff.
