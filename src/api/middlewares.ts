import { defineMiddlewares, validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework/http"
import { EventBody, EventList } from "../lib/validators"

export default defineMiddlewares({ routes: [
  { matcher: "/admin/events", methods: ["GET"], middlewares: [validateAndTransformQuery(EventList, { defaults: [] })] },
  { matcher: "/store/events", methods: ["GET"], middlewares: [validateAndTransformQuery(EventList, { defaults: [] })] },
  { matcher: "/admin/events", methods: ["POST"], middlewares: [validateAndTransformBody(EventBody)] },
  { matcher: "/admin/events/:id", methods: ["POST"], middlewares: [validateAndTransformBody(EventBody)] },
] })
