import { model } from "@medusajs/framework/utils"

const CalendarEvent = model.define("calendar_event", {
  id: model.id({ prefix: "evt" }).primaryKey(),
  title: model.text(),
  title_en: model.text().nullable(),
  description: model.text().nullable(),
  description_en: model.text().nullable(),
  venue: model.text().nullable(),
  city: model.text().nullable(),
  address: model.text().nullable(),
  starts_at: model.dateTime().nullable(),
  ends_at: model.dateTime().nullable(),
  time_zone: model.text().default("Europe/Amsterdam"),
  external_url: model.text().nullable(),
  is_published: model.boolean().default(false),
})

export default CalendarEvent
