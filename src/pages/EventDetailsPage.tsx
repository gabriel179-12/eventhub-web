import { useEffect, useState } from 'react'
import { getPublicEvent } from '../services/api'
import type { PublicEventDetails } from '../types/event'


type EventDetailsPageProps = {
    slug: string
    onBack: () => void
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
})

const priceFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
})

export default function EventDetailsPage({
    slug,
    onBack,
}: EventDetailsPageProps) {
    const [event, setEvent] = useState<PublicEventDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() =>{
        const controller = new AbortController()

        async function loadEvent() {
            try {
                const response = await getPublicEvent(slug, controller.signal)

                if (!controller.signal.aborted) {
                    setEvent(response.data)
                }
            } catch (error: unknown) {
                if (!controller.signal.aborted) {
                    setError(
                        error instanceof TypeError
                        ? 'Não foi possível conectar ao servidor.'
                        :  error instanceof Error
                            ? error.message
                            : 'Não foi possível carregar o evento.',
                    )
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        void loadEvent()

        return () => controller.abort()
    }, [slug])

    const ticketType = event?.ticket_types[0]

    return (
        <main className='home-content'>
            <button type='button' className='back-button' onClick={onBack}>
                ← Voltar ao catálogo
            </button>

            {loading && <p role='status'>Carregando evento...</p>}

            {error && (
                <p className='home-error' role='alert'>
                    {error}
                </p>
            )}

            {!loading && !error && event && (
                <div className='event-details-body'>
                    <header>
                        <h1>{event.name}</h1>
                        <p className='home-intro'>
                            {event.category.name} . Organizado por {event.organizer.name}
                        </p>
                    </header>

                    <section className='event-card' aria-labelledby='about-title'>
                        <h2 id="about-title">Sobre o evento</h2>
                        <p className='event-description'>{event.description}</p>
                    </section>

                    <section className='event-card' aria-labelledby='location-title'>
                        <h2 id='location-title'>Data e local</h2>

                        <p>
                            Início: {' '}
                            <time dateTime={event.starts_at}>
                                {dateFormatter.format(new Date(event.starts_at))}
                            </time>
                        </p>

                        {event.ends_at && (
                            <p>
                                Término: {' '}
                                <time dateTime={event.ends_at}>
                                    {dateFormatter.format(new Date(event.ends_at))}
                                </time>
                            </p>
                        )}

                        <p>{event.venue_name}</p>
                        <p>{event.address_line}</p>
                        <p>
                            {event.city} — {event.state}
                        </p>
                        <p>CEP: {event.postal_code}</p>
                    </section>

                    <section className="event-card" aria-labelledby="ticket-title">
                        <h2 id="ticket-title">Ingresso</h2>

                        {ticketType ? (
                            <>
                            <p className="event-price">
                                {ticketType.price_in_cents === 0
                                ? 'Gratuito'
                                : priceFormatter.format(ticketType.price_in_cents / 100)}
                            </p>
                            <p>Valor por pessoa.</p>
                            </>
                        ) : (
                            <p>Ingressos indisponíveis no momento.</p>
                        )}
                    </section>
                </div>
            )}
        </main>
    )
}