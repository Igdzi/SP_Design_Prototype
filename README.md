# CRM_History-Event-Page

SendPulse CRM event history UX flow HTML prototype.

This workspace is prepared for SendPulse design-system-based HTML prototypes.

Before starting any new prototype task, read `SENDPULSE_DESIGN_SYSTEM.md`.

## Design System Sources

- CSS and typography: https://login.sendpulse.com/dist/ui-library/index.html
- Components: https://login.sendpulse.com/dist/ui-library/components.html
- JavaScript components: https://login.sendpulse.com/dist/ui-library/javascript.html
- Knowledge base: https://sendpulse.com/ru/knowledge-base

## Working Rules

- Use the official SendPulse CSS stack first:
  - `https://login.sendpulse.com/dist/css/bootstrap.min.css`
  - `https://login.sendpulse.com/dist/css/template.min.css`
- Prefer Bootstrap v3.4 and SendPulse classes before adding custom CSS.
- Keep custom CSS scoped to the current prototype flow.
- Add each new UX Flow inside `#flow-slot`.

## Input Needed for Each Flow

- User goal
- Entry point
- Steps and screens
- Required fields and text
- Empty, loading, validation, success, and error states
- Desktop/mobile expectations
- Business constraints and edge cases
