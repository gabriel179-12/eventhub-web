import { useEffect, useState } from 'react'
import { getApiHealth } from './services/api'
import './App.css'

export default function App() {
  const [message, setMessage] = useState('Conectando à API...')

  useEffect(() => {
    const controller = new AbortController()

    async function checkConnection() {
      try {
        const response = await getApiHealth(controller.signal)

        if (!controller.signal.aborted) {
          setMessage(
            `${response.data.service}: ${response.data.status}`,
          )
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setMessage(
            error instanceof Error
              ? error.message
              : 'Não foi possível conectar à API.',
          )
        }
      }
    }

    void checkConnection()

    return () => controller.abort()
  }, [])

  return (
    <main>
      <h1>EventHub</h1>
      <p role="status">{message}</p>
    </main>
  )
}