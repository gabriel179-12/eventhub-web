import { useEffect, useState } from 'react'
import { getPublicEvents } from '../services/api'
import type { User } from '../services/auth'
import type { PublicEvent } from '../types/event'

type HomePageProps = {
    user: User
    onLogout: () => void
    busy: boolean
    logoutError: string | null
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
})

export default function HomePage({
    user,
    onLogout,
    busy,
    logoutError,
}: HomePageProps) {
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
                        error instanceof TypeError
                        ? 'Não foi possível conectar ao servidor.'
                        : error instanceof Error
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
        <div className='home-page'>
            <header className='home-header'>
                <span className='home-brand'>EventHub</span>

                <div className='home-account'>
                    <span>Olá, {user.name}!</span>

                    <button type='button' disabled={busy} onClick={onLogout}>
                        {busy ? 'Saindo...' : 'Sair da conta'}
                    </button>
                </div>
            </header>

            <main className='home-content'>
                <h1>Próximos eventos</h1>
                <p className='home-intro'>
                    Encontre seu próximo evento e viva novas experiênicas.
                </p>

                {logoutError && (
                    <p className='home-error' role='alert'>
                        {logoutError}
                    </p>
                )}

                {loading && <p role='status'>Carregando eventos</p>}

                {error && (
                    <p className='home-error' role='alert'>
                        {error}
                    </p>
                )}

                {!loading && !error && events.length === 0 && (
                    <p>Nenhum evento disponível no momento. Volte em breve!</p>
                )}

                <div className='events-grid'>
                    {events.map((event) => (
                        <article key={event.id} className='event-card'>
                            <h2>{event.name}</h2>

                            <time dateTime={event.starts_at}>
                                {dateFormatter.format(new Date(event.starts_at))}
                            </time>

                            <p>{event.venue_name}</p>
                            <p>
                                {event.city} — {event.state}
                            </p>
                        </article>
                    ))}
                </div>
            </main>
        </div>
    )
}