import type {
  PublicEventDetailResponse,
  PublicEventListResponse,
} from '../types/event'
export type HealthResponse = {
  data: {
    status: string
    service: string
  }
}

export async function getApiHealth(
  signal?: AbortSignal,
): Promise<HealthResponse> {
  const apiUrl = import.meta.env.VITE_API_URL

  if (!apiUrl) {
    throw new Error('Configure VITE_API_URL no .env')
  }

  const response = await fetch(`${apiUrl}/health`, {
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    throw new Error(`A API respondeu com HTTP ${response.status}`)
  }

  return response.json()
}
export async function getPublicEvents(
  signal?: AbortSignal,
): Promise<PublicEventListResponse> {
  const apiUrl = import.meta.env.VITE_API_URL

  if (!apiUrl) {
    throw new Error('Configure VITE_API_URL no .env')
  }

  const response = await fetch(`${apiUrl}/events`, {
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    throw new Error(`Não foi possível buscar os eventos: HTTP ${response.status}`)
  }

  return response.json()
}

export async function getPublicEvent(
  slug: string,
  signal?: AbortSignal,
): Promise<PublicEventDetailResponse> {
  const apiUrl = import.meta.env.VITE_API_URL

  if (!apiUrl) {
    throw new Error('Configure VITE_API_URL no .env')
  }

  const baseUrl = apiUrl.replace(/\/+$/, '')

  const response = await fetch(
    `${baseUrl}/events/${encodeURIComponent(slug)}`,
    {
      headers: {
        Accept: 'application/json',
      },
      signal,
    },
  )

  if (response.status === 404) {
    throw new Error('Este evento não foi encontrado ou não está mais disponível.')
  }

  if (!response.ok) {
    throw new Error('Não foi possível carregar os detalhes do evento.')
  }

  return response.json()
}