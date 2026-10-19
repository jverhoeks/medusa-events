/** Resolve wall-clock input in the event's zone, independently of the editor's zone.
 * Reject clock-change gaps and ambiguities instead of silently moving the event.
 */
export function eventInstant(date: string, time: string, zone: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new Error("Enter a valid date and time")
  }
  const wall = new Date(`${date}T${time}:00Z`)
  if (Number.isNaN(wall.getTime()) || wall.toISOString().slice(0, 10) !== date) {
    throw new Error("Enter a valid date")
  }
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  })
  const matches: string[] = []
  for (let offset = -14 * 60; offset <= 14 * 60; offset += 15) {
    const instant = new Date(wall.getTime() - offset * 60000)
    const parts = Object.fromEntries(formatter.formatToParts(instant).map((part) => [part.type, part.value]))
    if (`${parts.year}-${parts.month}-${parts.day}` === date && `${parts.hour}:${parts.minute}` === time) {
      matches.push(instant.toISOString())
    }
  }
  if (matches.length !== 1) throw new Error("This time is missing or ambiguous because the clocks change. Choose another time.")
  return matches[0]
}

export function eventInput(instant: string | null, zone: string) {
  if (!instant) return { date: "", time: "" }
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(instant)).map((part) => [part.type, part.value]))
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` }
}
