export type PublicEvent = {
  id: number
  name: string
  slug: string
  description: string
  starts_at: string
  ends_at: string | null
  venue_name: string
  city: string
  state: string
  banner_path: string | null
}

export type PublicEventListResponse = {
  data: PublicEvent[]
}