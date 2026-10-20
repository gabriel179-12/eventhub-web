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

export type PublicTicketType = {
  id: number
  name: string
  description: string | null
  price_in_cents: number
}

export type PublicEventDetails = PublicEvent & {
  address_line: string
  postal_code: string
  organizer: {
    id: number
    name: string
    slug: string
    logo_path: string | null
  }
  category: {
    id: number
    name: string
    slug: string
  }
  ticket_types: PublicTicketType[]
}

export type PublicEventDetailResponse = {
  data: PublicEventDetails
}