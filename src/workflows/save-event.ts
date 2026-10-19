import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { CALENDAR_EVENTS_MODULE } from "../modules/calendar-events"
import CalendarEventsModuleService from "../modules/calendar-events/service"
import { EventInput } from "../lib/validators"

type SaveEventInput = EventInput & { id?: string }
const saveEventStep = createStep("save-calendar-event", async (input: SaveEventInput, { container }) => {
  const service: CalendarEventsModuleService = container.resolve(CALENDAR_EVENTS_MODULE)
  const { id, ...values } = input
  const fields = { ...values, starts_at: values.starts_at ? new Date(values.starts_at) : null,
    ends_at: values.ends_at ? new Date(values.ends_at) : null }
  const original = id ? await service.retrieveCalendarEvent(id) : null
  const event = id ? await service.updateCalendarEvents({ id, ...fields }) : await service.createCalendarEvents(fields)
  return new StepResponse(event, { id: event.id, original })
}, async (rollback, { container }) => {
  if (!rollback) return
  const service: CalendarEventsModuleService = container.resolve(CALENDAR_EVENTS_MODULE)
  if (!rollback.original) { await service.deleteCalendarEvents(rollback.id); return }
  const { created_at, updated_at, deleted_at, ...fields } = rollback.original
  await service.updateCalendarEvents(fields)
})
export const saveEventWorkflow = createWorkflow("save-calendar-event", (input: SaveEventInput) => {
  const event = saveEventStep(input)
  return new WorkflowResponse({ event })
})
