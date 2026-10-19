import type { PublicEventListResponse } from '../types/event'
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