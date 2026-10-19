import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { EventInput } from "../../../../lib/validators"
import { saveEventWorkflow } from "../../../../workflows/save-event"
import { deleteEventWorkflow } from "../../../../workflows/delete-event"

export async function POST(req: AuthenticatedMedusaRequest<EventInput>, res: MedusaResponse) {
  const { result } = await saveEventWorkflow(req.scope).run({ input: { ...req.validatedBody, id: req.params.id } })
  res.json(result)
}
export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await deleteEventWorkflow(req.scope).run({ input: { id: req.params.id } })
  res.json({ id: req.params.id, deleted: true })
}
