import { Module } from "@medusajs/framework/utils"
import CalendarEventsModuleService from "./service"

export const CALENDAR_EVENTS_MODULE = "calendarEvents"
export default Module(CALENDAR_EVENTS_MODULE, { service: CalendarEventsModuleService })
