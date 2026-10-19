import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CALENDAR_EVENTS_MODULE } from "../../../modules/calendar-events"
import CalendarEventsModuleService from "../../../modules/calendar-events/service"
import { EventInput } from "../../../lib/validators"
import { saveEventWorkflow } from "../../../workflows/save-event"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { limit, offset } = req.validatedQuery as { limit: number; offset: number }
  const service: CalendarEventsModuleService = req.scope.resolve(CALENDAR_EVENTS_MODULE)
  const [events, count] = await service.listAndCountCalendarEvents({}, { take: limit, skip: offset, order: { created_at: "DESC" } })
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ events, count, limit, offset })
}
export async function POST(req: AuthenticatedMedusaRequest<EventInput>, res: MedusaResponse) {
  const { result } = await saveEventWorkflow(req.scope).run({ input: req.validatedBody })
  res.status(201).json(result)
}
