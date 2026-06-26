import { z } from 'zod'
import { TRACKING_MAX_POINTS_PER_REQUEST } from './constants'

export const sessionCreateSchema = z.object({
  participant_name: z.string().trim().min(1, 'Informe um nome').max(80),
  activity_type: z.enum(['rua', 'esteira', 'caminhada']).default('rua'),
  reference_location_name: z.string().trim().max(160).nullable().optional(),
  reference_lat: z.number().min(-90).max(90).nullable().optional(),
  reference_lng: z.number().min(-180).max(180).nullable().optional(),
  planned_route_polyline: z.string().max(60000).nullable().optional(),
})
export type SessionCreateInput = z.infer<typeof sessionCreateSchema>

export const pointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().nullable().optional(),
  altitude: z.number().nullable().optional(),
  speed: z.number().nullable().optional(),
  heading: z.number().nullable().optional(),
  captured_at: z.string().datetime({ offset: true }),
})
export type PointInput = z.infer<typeof pointSchema>

export const pointBatchSchema = z.object({
  token: z.string().min(10),
  points: z.array(pointSchema).min(1).max(TRACKING_MAX_POINTS_PER_REQUEST),
})

export const tokenOnlySchema = z.object({ token: z.string().min(10) })
