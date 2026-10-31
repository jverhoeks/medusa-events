# Medusa Events

A small events-listing plugin for Medusa v2.22.1. Manage events in the admin and
fetch published upcoming/ongoing listings for any storefront. This plugin does
not sell tickets, import Facebook data or embed tracking widgets.

## Install

Install the pinned release tarball (or an npm version when published), then add:

```ts
plugins: [{ resolve: "@jverhoeks/medusa-events", options: {} }]
```

Run `npx medusa db:migrate` as an explicit release job after reviewing the new
`calendar_event` table migration and taking a backup. Rebuild the admin. Open
**Events** to create, edit, publish, unpublish and remove listings.

An event has Dutch/default and optional English title/description, venue, city,
street address, start/end timestamps, IANA timezone and an HTTPS organiser link.
The admin accepts dates and opening hours in the event's zone. Incomplete events
can be saved as drafts. Publication requires a venue, city and valid start/end
range. End dates support multi-day events. Descriptions are plain text.

`GET /store/events?limit=20&offset=0` returns explicit public fields for published
records whose end time is still in the future, ordered by start/id. Drafts and
soft-deleted records are excluded. Response: `{events, count, limit, offset}`.
Render timestamps in each event's `time_zone`; do not use the visitor's timezone
for advertised opening hours. Pages are not cached so publication/expiry changes
are reflected on the next request. Timezone gap/ambiguity handling and pagination
are validated. Limits are 1–100 and offsets 0–10000.

`GET/POST /admin/events` and `POST/DELETE /admin/events/:id` use Medusa's admin
authentication. POST supplies the full editable record; it is not a partial patch.
Mutations run through compensating workflows. Removal uses soft deletion.
Future integrations may import the save workflow from
`@jverhoeks/medusa-events/workflows/save-event`.

The plugin has no Botica Doro configuration or seed data. Storefront rendering,
navigation, branding and business event entries belong in the consuming app.
It is intentionally an announcement/calendar feature, not ticket booking.

## Development

Use Node 22 and npm 11.19.0. `npm ci`, `npm test`, `npm run typecheck` and
`npm run build` compile/test backend and admin. Generate migrations with
`npx medusa plugin:db:generate` against an isolated PostgreSQL fixture using
`DB_HOST`, `DB_PORT`, `DB_USERNAME` and `DB_PASSWORD`; never target live data for
schema generation. `npm pack` runs the plugin build and packages compiled
`.medusa/server` output, documentation and licence only.

The plugin is pre-release. Validate it with the consuming app's integration,
authentication and production-build checks before promoting it to a live shop.
