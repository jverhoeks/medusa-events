import { test } from "node:test"
import assert from "node:assert/strict"
import { eventInstant, eventInput } from "../src/lib/event-time.ts"
import { EventBody, EventList } from "../src/lib/validators.ts"

const draft = { title: "Example market", starts_at: null, ends_at: null, time_zone: "Europe/Amsterdam", is_published: false }
const published = { ...draft, is_published: true, venue: "Example hall", city: "Dronten",
  starts_at: "2026-12-17T09:00:00Z", ends_at: "2026-12-17T16:00:00Z" }

test("drafts can omit unconfirmed venue/date; publication requires complete details", () => {
  assert.equal(EventBody.parse(draft).is_published, false)
  assert.equal(EventBody.safeParse({ ...draft, is_published: true }).success, false)
  assert.equal(EventBody.parse(published).is_published, true)
})
test("rejects reversed/equal ranges, unknown fields and unsafe organiser links", () => {
  for (const ends_at of [published.starts_at, "2026-12-17T08:00:00Z"]) assert.equal(EventBody.safeParse({ ...published, ends_at }).success, false)
  for (const external_url of ["javascript:alert(1)", "http://example.com", "https://user:pass@example.com"]) assert.equal(EventBody.safeParse({ ...draft, external_url }).success, false)
  assert.equal(EventBody.safeParse({ ...draft, customer_id: "private" }).success, false)
  assert.equal(EventBody.safeParse({ ...draft, time_zone: "not/a/zone" }).success, false)
  assert.equal(EventBody.parse({ ...draft, external_url: "https://www.facebook.com/events/example/123/" }).external_url.includes("facebook.com"), true)
})
test("bounds public/admin pagination", () => {
  assert.deepEqual(EventList.parse({}), { limit: 20, offset: 0 })
  for (const query of [{ limit: 101 }, { offset: -1 }, { offset: 10001 }]) assert.equal(EventList.safeParse(query).success, false)
})
test("Amsterdam input resolves winter/summer offsets without depending on the editor timezone", () => {
  assert.equal(eventInstant("2026-12-17", "10:00", "Europe/Amsterdam"), "2026-12-17T09:00:00.000Z")
  assert.equal(eventInstant("2026-07-17", "10:00", "Europe/Amsterdam"), "2026-07-17T08:00:00.000Z")
  assert.deepEqual(eventInput("2026-12-17T09:00:00Z", "Europe/Amsterdam"), { date: "2026-12-17", time: "10:00" })
})
test("rejects impossible dates and DST gaps/ambiguities rather than silently shifting hours", () => {
  for (const [date, time] of [["2026-02-30", "10:00"], ["2026-03-29", "02:30"], ["2026-10-25", "02:30"], ["2026-12-17", "25:00"]]) assert.throws(() => eventInstant(date, time, "Europe/Amsterdam"))
})
