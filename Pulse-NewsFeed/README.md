# Pulse-NewsFeed

SendPulse CRM "Пульс" (Pulse) personal activity feed prototype.

## Context

- Product area: CRM
- Page: Пульс — personal activity feed, opens right after login
- Language: Ukrainian
- Shell: SendPulse product UI

## Files

- `index.html` - page structure and SendPulse shell
- `styles/prototype.css` - scoped styles for this prototype
- `scripts/prototype.js` - interactions and mock data
- `assets/` - prototype assets

## Included states

- Sidebar: new "Пульс" entry, first in the CRM menu
- Announcements block: up to 3 cards per row, priority levels (normal / important / urgent), hidden entirely when empty
- Announcement detail popup (centered modal): author/admin-only edit, finish, delete actions
- Announcement create/edit modal: text, optional image, priority, optional expiry date, with validation
- Event feed: type filter tabs with counts, priority-highlighted announcement rows, "load more" pagination in batches of 20 with an exhausted state
- Right-side drawer for угода / завдання / контакт / дзвінок events (reuses the `activity-drawer` pattern from `../CRM_History-Event-Page`)
- "Мій день" column (left, 2/3 width): Завдання (inline checkbox complete), Угоди з дедлайном — each sorted (overdue/soonest first) with an empty state; event feed sits on the right (1/3 width)
- Single "Додати" dropdown in the page header, with the "Анонс" item gated behind a `canPublishAnnouncements` permission flag

## Notes

This prototype follows the shared repository guidance in `../SENDPULSE_DESIGN_SYSTEM.md`. The `crm-modal-page` modal chrome and `activity-drawer` styles are re-declared here (not ID-scoped) so they can be reused across this prototype's two modals and one drawer — see `../CRM_History-Event-Page/styles/prototype.css` for the original pattern this was adapted from.
