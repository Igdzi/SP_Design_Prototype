# SendPulse Design System Reference

Use this file as the starting point for every SendPulse HTML prototype in this workspace.

## Official Sources

- CSS / typography: https://login.sendpulse.com/dist/ui-library/index.html
- Components: https://login.sendpulse.com/dist/ui-library/components.html
- JavaScript components: https://login.sendpulse.com/dist/ui-library/javascript.html
- Knowledge base: https://sendpulse.com/ru/knowledge-base

## Required CSS Stack

Always connect the official SendPulse CSS first:

```html
<link href="https://login.sendpulse.com/dist/css/bootstrap.min.css" rel="stylesheet" media="screen">
<link href="https://login.sendpulse.com/dist/css/template.min.css" rel="stylesheet" media="screen">
```

Then connect only the prototype-specific CSS inside the prototype folder:

```html
<link href="styles/prototype.css" rel="stylesheet" media="screen">
```

## Core Rule

Use Bootstrap v3.4 and SendPulse classes first.

Before creating custom markup or CSS, check whether the UI can be built with:

- Bootstrap grid, forms, buttons, dropdowns, tabs, modals, alerts, labels, tables
- SendPulse layout classes from `template.min.css`
- SendPulse icon font classes: `sp-icon icon-*`
- Existing shell structure: top navigation, side menu, content wrapper, breadcrumbs, page title, fast actions

Custom CSS should only handle flow-specific layout, spacing, responsive behavior, and prototype-only states.

## Repository Structure

Each new UX flow should be created in its own folder at the repository root:

```text
Flow_Name/
  index.html
  styles/prototype.css
  scripts/prototype.js
  assets/
```

Use existing prototype folders as references for shell structure, spacing, controls, filters, empty states, and interaction patterns.

Do not put multiple unrelated flows into the same `index.html`.

The repository root `index.html` is only a GitHub Pages catalog. Do not build product flows there.

When adding a new prototype folder, also add its link to the root `index.html` catalog so it can be opened from GitHub Pages.

## Base HTML Shell

Use the existing project shell in a prototype folder's `index.html` as the base:

- `<html class="ma-light" lang="uk">`
- `<body class="sp">`
- `#page-wrapper.site-wrapper`
- `nav.sp-navbar`
- `.main-content`
- `#side-menu.side-menu.open`
- `#content-placeholder`
- `#content-wrapper.js-content-wrapper.content-wrapper-dashboard`
- `#breadcrumbs`
- `h1`

Place the actual UX flow inside the content wrapper. Do not create landing pages or marketing pages for product flows.

## Visual Direction

SendPulse product UI should feel:

- practical and work-focused
- compact enough for repeated daily use
- based on lists, tables, forms, panels, dropdowns, tabs, modals, and drawers
- visually quiet, with accents used for primary actions, status, and active filters

Avoid:

- decorative hero sections
- oversized cards
- marketing-style layouts
- custom one-off components when Bootstrap/SendPulse already provides the pattern
- unnecessary explanatory text inside the UI

## Prototype Rules

For every UX Flow:

1. Keep only the necessary UI for the task.
2. Reuse the current SendPulse shell.
3. Use official CSS links.
4. Use Bootstrap/SendPulse classes first.
5. Add custom CSS only with scoped prototype classes.
6. Make states visible when they matter: empty, loading, validation, success, error, locked, disabled.
7. Make event/list/table rows flexible so real production data with different lengths can fit.
8. Use example text only where real data is unknown.
9. Keep the prototype ready for developer handoff.

## Current Prototype Folders

- `CRM_History-Event-Page/index.html` - page structure and SendPulse shell
- `CRM_History-Event-Page/styles/prototype.css` - scoped styles for the current prototype
- `CRM_History-Event-Page/scripts/prototype.js` - prototype interactions and mock data

## Current CRM Activity Feed Notes

The current prototype covers:

- CRM / Analytics / Event history page
- service tabs with counts
- realtime search
- filter panel
- date groups
- flexible activity event rows
- lazy loading in batches of 10
- locked rows for free services
- event details modal
- upsell drawer

The event row template is intentionally data-driven and should continue to support varied event payloads:

- service
- author
- action
- entity
- event type
- details
- time
- full date
