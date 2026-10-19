import { useEffect, useState } from 'react'
import { getPublicEvents } from './services/api'
import type { PublicEvent } from './types/event'
import './App.css'

export default function App() {
  const [events, setEvents] = useState<PublicEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadEvents() {
      try {
        const response = await getPublicEvents(controller.signal)

        if (!controller.signal.aborted) {
          setEvents(response.data)
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os eventos.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadEvents()

    return () => controller.abort()
  }, [])

  return (
    <main>
      <header>
        <h1>EventHub</h1>
        <p>Encontre seu próximo evento.</p>
      </header>

      <section aria-labelledby="events-heading">
        <h2 id="events-heading">Próximos eventos</h2>

        {loading && <p role="status">Carregando eventos...</p>}

        {error && <p role="alert">{error}</p>}

        {!loading && !error && events.length === 0 && (
          <p>Nenhum evento disponível no momento. Volte em breve!</p>
        )}

        {events.map((event) => (
          <article key={event.id}>
            <h3>{event.name}</h3>

            <p>
              <time dateTime={event.starts_at}>
                {new Intl.DateTimeFormat('pt-BR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(event.starts_at))}
              </time>
            </p>

            <p>{event.venue_name}</p>
            <p>
              {event.city} — {event.state}
            </p>
          </article>
        ))}
      </section>
    </main>
  )
}