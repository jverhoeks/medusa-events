import { z } from "@medusajs/framework/zod"

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional().transform((value) => value || null)
export const EventBody = z.object({
  title: z.string().trim().min(1).max(200),
  title_en: optionalText(200),
  description: optionalText(5000),
  description_en: optionalText(5000),
  venue: optionalText(200),
  city: optionalText(200),
  address: optionalText(500),
  starts_at: z.string().datetime({ offset: true }).nullable(),
  ends_at: z.string().datetime({ offset: true }).nullable(),
  time_zone: z.string().max(100).refine((zone) => {
    try { new Intl.DateTimeFormat("en", { timeZone: zone }); return true } catch { return false }
  }, "Use a valid IANA time zone"),
  external_url: optionalText(2048).refine((value) => {
    if (!value) return true
    try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password } catch { return false }
  }, "Use an HTTPS URL without credentials"),
  is_published: z.boolean(),
}).strict().superRefine((event, context) => {
  if (event.is_published && (!event.starts_at || !event.ends_at || !event.venue || !event.city)) {
    context.addIssue({ code: "custom", message: "Published events need a venue, city, start and end time", path: ["is_published"] })
  }
  if (event.starts_at && event.ends_at && new Date(event.ends_at) <= new Date(event.starts_at)) {
    context.addIssue({ code: "custom", message: "The end must be after the start", path: ["ends_at"] })
  }
})
export type EventInput = z.infer<typeof EventBody>
export const EventList = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
})
