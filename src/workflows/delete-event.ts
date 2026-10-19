import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { CALENDAR_EVENTS_MODULE } from "../modules/calendar-events"
import CalendarEventsModuleService from "../modules/calendar-events/service"

const deleteEventStep = createStep("delete-calendar-event", async (input: { id: string }, { container }) => {
  const service: CalendarEventsModuleService = container.resolve(CALENDAR_EVENTS_MODULE)
  await service.retrieveCalendarEvent(input.id)
  await service.softDeleteCalendarEvents(input.id)
  return new StepResponse(input, input.id)
}, async (id, { container }) => {
  if (!id) return
  const service: CalendarEventsModuleService = container.resolve(CALENDAR_EVENTS_MODULE)
  await service.restoreCalendarEvents(id)
})
export const deleteEventWorkflow = createWorkflow("delete-calendar-event", (input: { id: string }) => {
  const result = deleteEventStep(input)
  return new WorkflowResponse(result)
})
