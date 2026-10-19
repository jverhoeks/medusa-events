import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CALENDAR_EVENTS_MODULE } from "../../../modules/calendar-events"
import CalendarEventsModuleService from "../../../modules/calendar-events/service"

/** Published ongoing/upcoming events only; never return drafts or accept field expansion. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { limit, offset } = req.validatedQuery as { limit: number; offset: number }
  const service: CalendarEventsModuleService = req.scope.resolve(CALENDAR_EVENTS_MODULE)
  const [events, count] = await service.listAndCountCalendarEvents({
    is_published: true, ends_at: { $gt: new Date() },
  }, { take: limit, skip: offset, order: { starts_at: "ASC", id: "ASC" } })
  res.setHeader("Cache-Control", "no-store")
  res.json({ events: events.map((event) => ({
    id: event.id, title: event.title, title_en: event.title_en,
    description: event.description, description_en: event.description_en,
    venue: event.venue, city: event.city, address: event.address,
    starts_at: event.starts_at, ends_at: event.ends_at, time_zone: event.time_zone,
    external_url: event.external_url,
  })), count, limit, offset })
}
