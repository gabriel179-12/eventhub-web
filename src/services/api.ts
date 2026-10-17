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