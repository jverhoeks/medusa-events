import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Calendar } from "@medusajs/icons"
import { Badge, Button, Container, Drawer, Heading, Input, Label, Prompt, Switch, Table, Text, Textarea, toast, Toaster } from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, type FormEvent } from "react"
import { sdk } from "../../lib/sdk"
import { eventInstant, eventInput } from "../../lib/event-time"

type Event = {
  id: string; title: string; title_en: string | null; description: string | null; description_en: string | null
  venue: string | null; city: string | null; address: string | null; external_url: string | null
  starts_at: string | null; ends_at: string | null; time_zone: string; is_published: boolean
}
const empty = { title: "", title_en: "", description: "", description_en: "", venue: "", city: "", address: "", external_url: "",
  date: "", end_date: "", from: "", to: "", time_zone: "Europe/Amsterdam", is_published: false }
type Form = typeof empty
const key = ["calendar-events"]

function Editor({ event, close }: { event: Event | null; close: () => void }) {
  const start = eventInput(event?.starts_at ?? null, event?.time_zone ?? empty.time_zone)
  const end = eventInput(event?.ends_at ?? null, event?.time_zone ?? empty.time_zone)
  const [form, setForm] = useState<Form>(event ? {
    title: event.title, title_en: event.title_en || "",
    description: event.description || "", description_en: event.description_en || "",
    venue: event.venue || "", city: event.city || "", address: event.address || "",
    external_url: event.external_url || "", time_zone: event.time_zone,
    is_published: event.is_published, date: start.date, end_date: end.date,
    from: start.time, to: end.time,
  } : { ...empty })
  const [error, setError] = useState("")
  const client = useQueryClient()
  const save = useMutation({
    mutationFn: async () => {
      const { date, end_date, from, to, ...fields } = form
      if (Boolean(date) !== Boolean(from) || Boolean(end_date || date) !== Boolean(to)) {
        if (date || from || to || end_date) throw new Error("Enter both the date and opening/closing times, or leave all times empty for a draft.")
      }
      return sdk.client.fetch(event ? `/admin/events/${event.id}` : "/admin/events", { method: "POST", body: {
        ...fields,
        starts_at: date && from ? eventInstant(date, from, form.time_zone) : null,
        ends_at: (end_date || date) && to ? eventInstant(end_date || date, to, form.time_zone) : null,
      } })
    },
    onSuccess: async () => { await client.invalidateQueries({ queryKey: key }); toast.success("Event saved"); close() },
    onError: (err: Error) => setError(err.message),
  })
  const field = (name: keyof Form, label: string, type = "text", required = false) => (
    <div className="flex flex-col gap-2"><Label htmlFor={`event-${name}`}>{label}</Label>
      <Input id={`event-${name}`} type={type} value={String(form[name])} required={required}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })} /></div>
  )
  const submit = (e: FormEvent) => { e.preventDefault(); setError(""); save.mutate() }
  return <Drawer open onOpenChange={(open) => { if (!open && !save.isPending) close() }}>
    <Drawer.Content><form onSubmit={submit} className="flex h-full flex-col">
      <Drawer.Header><Drawer.Title>{event ? "Edit event" : "New event"}</Drawer.Title></Drawer.Header>
      <Drawer.Body className="flex flex-col gap-5 overflow-y-auto">
        {field("title", "Title (Dutch)", "text", true)}{field("title_en", "Title (English, optional)")}
        {field("venue", "Venue / location")}{field("city", "City / place")}{field("address", "Street address")}
        {field("time_zone", "Event time zone (IANA)", "text", true)}
        <Text size="small">Dates and opening hours use the event’s time zone, regardless of your computer’s time zone.</Text>
        {field("date", "Start date", "date")}
        <div className="grid grid-cols-2 gap-3">{field("from", "From", "time")}{field("to", "To", "time")}</div>
        {field("end_date", "End date (leave empty for the same day)", "date")}
        {(["description", "description_en"] as const).map((name) => <div key={name} className="flex flex-col gap-2">
          <Label htmlFor={`event-${name}`}>Description ({name === "description" ? "Dutch" : "English, optional"})</Label>
          <Textarea id={`event-${name}`} rows={5} maxLength={5000} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
        </div>)}
        {field("external_url", "Facebook / organiser link (HTTPS)", "url")}
        <div className="flex items-center gap-3"><Switch id="event-published" checked={form.is_published} onCheckedChange={(value) => setForm({ ...form, is_published: value })} />
          <Label htmlFor="event-published">Published on the website</Label></div>
        <Text size="small">Drafts stay private. Published events disappear from the upcoming list after their end time.</Text>
        {error && <Text role="alert" className="text-ui-fg-error">{error}</Text>}
      </Drawer.Body>
      <Drawer.Footer><Button type="button" variant="secondary" disabled={save.isPending} onClick={close}>Cancel</Button>
        <Button type="submit" isLoading={save.isPending}>Save event</Button></Drawer.Footer>
    </form></Drawer.Content>
  </Drawer>
}

export default function EventsPage() {
  const [offset, setOffset] = useState(0)
  const [editing, setEditing] = useState<Event | null | undefined>(undefined)
  const [removing, setRemoving] = useState<Event | null>(null)
  const client = useQueryClient()
  const { data, isLoading, isError } = useQuery({ queryKey: [...key, offset], queryFn: () =>
    sdk.client.fetch<{ events: Event[]; count: number }>("/admin/events", { query: { limit: 20, offset } }) })
  const remove = useMutation({ mutationFn: (id: string) => sdk.client.fetch(`/admin/events/${id}`, { method: "DELETE" }),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: key }); setRemoving(null); toast.success("Event removed") },
    onError: (err: Error) => toast.error(err.message) })
  return <Container><Toaster /><div className="flex items-center justify-between"><div><Heading>Events</Heading>
    <Text>Manage dates, locations and opening hours for the website.</Text></div><Button onClick={() => setEditing(null)}>New event</Button></div>
    {isLoading ? <Text className="py-6">Loading events…</Text> : isError ? <Text role="alert" className="py-6 text-ui-fg-error">Could not load events. Please retry.</Text> : <>
      <Table><Table.Header><Table.Row><Table.HeaderCell>Event</Table.HeaderCell><Table.HeaderCell>Date / place</Table.HeaderCell><Table.HeaderCell>Status</Table.HeaderCell><Table.HeaderCell>Actions</Table.HeaderCell></Table.Row></Table.Header>
      <Table.Body>{data?.events.map((event) => <Table.Row key={event.id}>
        <Table.Cell>{event.title}</Table.Cell><Table.Cell>{event.starts_at ? new Intl.DateTimeFormat("en-GB", { timeZone: event.time_zone, dateStyle: "medium", timeStyle: "short" }).format(new Date(event.starts_at)) : "Date to confirm"}<br />{[event.venue, event.city].filter(Boolean).join(", ")}</Table.Cell>
        <Table.Cell><Badge color={!event.is_published ? "grey" : event.ends_at && new Date(event.ends_at) <= new Date() ? "orange" : "green"}>{!event.is_published ? "Draft" : event.ends_at && new Date(event.ends_at) <= new Date() ? "Ended" : "Published"}</Badge></Table.Cell>
        <Table.Cell><div className="flex gap-2"><Button variant="secondary" size="small" onClick={() => setEditing(event)}>Edit</Button><Button variant="danger" size="small" onClick={() => setRemoving(event)}>Remove</Button></div></Table.Cell>
      </Table.Row>)}</Table.Body></Table>
      {!data?.events.length && <Text className="py-6">No events yet. Add a draft or publish your first event.</Text>}
      <div className="flex items-center justify-end gap-3 py-4"><Text size="small">{data?.count ?? 0} events</Text><Button variant="secondary" size="small" disabled={!offset} onClick={() => setOffset(Math.max(0, offset - 20))}>Previous</Button><Button variant="secondary" size="small" disabled={offset + 20 >= (data?.count ?? 0)} onClick={() => setOffset(offset + 20)}>Next</Button></div>
    </>}
    {editing !== undefined && <Editor event={editing} close={() => setEditing(undefined)} />}
    <Prompt open={Boolean(removing)} onOpenChange={(open) => { if (!open && !remove.isPending) setRemoving(null) }}><Prompt.Content><Prompt.Header><Prompt.Title>Remove event?</Prompt.Title><Prompt.Description>This removes the listing from the website.</Prompt.Description></Prompt.Header><Prompt.Footer><Prompt.Cancel disabled={remove.isPending}>Cancel</Prompt.Cancel><Button variant="danger" isLoading={remove.isPending} onClick={() => removing && remove.mutate(removing.id)}>Remove</Button></Prompt.Footer></Prompt.Content></Prompt>
  </Container>
}
export const config = defineRouteConfig({ label: "Events", icon: Calendar })
