import { test } from "node:test"
import assert from "node:assert/strict"
import { GET } from "../src/api/store/events/route.ts"

test("public listings query published, unexpired rows and project fields without accepting expansion", async () => {
  let query, response, cache
  const service = { listAndCountCalendarEvents: async (filters, options) => {
    query = { filters, options }
    return [[{ id: "evt_1", title: "Market", title_en: null, description: "Details", description_en: null,
      venue: "Hall", city: "Dronten", address: null, starts_at: new Date(), ends_at: new Date(Date.now() + 3600000),
      time_zone: "Europe/Amsterdam", external_url: null, is_published: true, metadata: { private: true } }], 1]
  } }
  await GET({ validatedQuery: { limit: 12, offset: 0 }, query: { fields: "*" }, scope: { resolve: () => service } }, {
    setHeader: (name, value) => { cache = [name, value] }, json: (body) => { response = body },
  })
  assert.equal(query.filters.is_published, true)
  assert.ok(query.filters.ends_at.$gt instanceof Date)
  assert.deepEqual(query.options.order, { starts_at: "ASC", id: "ASC" })
  assert.equal(query.options.take, 12)
  assert.equal(response.events[0].metadata, undefined)
  assert.equal(response.events[0].is_published, undefined)
  assert.deepEqual(cache, ["Cache-Control", "no-store"])
})
