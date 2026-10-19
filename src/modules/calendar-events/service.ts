import { MedusaService } from "@medusajs/framework/utils"
import CalendarEvent from "./models/calendar-event"

export default class CalendarEventsModuleService extends MedusaService({ CalendarEvent }) {}
