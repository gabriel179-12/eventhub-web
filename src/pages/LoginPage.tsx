import { useEffect, useState } from 'react'
import { getCurrentUser, login, logout } from '../services/auth'
import type { User } from '../services/auth'



function getErrorMessage(error: unknown): string{
    if (error instanceof TypeError){
        return 'Não foi possível conectar ao servidor. Verifique sua concexão.'
    }

    return error instanceof Error
        ? error.message
        : 'Ocorreu um erro inesperado. Tente novamente.'
}

export default function LoginPage(){
    const [user, setUser] = useState<User | null>(null)
    const [checkingSession, setCheckingSession] = useState(true)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()

        async function checkSession(){
            try{
                const currentUser = await getCurrentUser(controller.signal)

                if (!controller.signal.aborted){
                    setUser(currentUser)
                }
            }catch (error:unknown){
                if (!controller.signal.aborted){
                    setError(getErrorMessage(error))
                }
            }finally {
                if (!controller.signal.aborted){
                    setCheckingSession(false)
                }
            }
        }
        void checkSession()

        return () => controller.abort()
    }, [])

    async function handleLogin(form: HTMLFormElement){
        if(busy) return

        const data = new FormData(form)
        const email = String(data.get('email') ?? '').trim()
        const password = String(data.get('password') ?? '')

        setBusy(true);
        setError(null)

        try{
            const authenticatedUser = await login(email, password)

            form.reset()
            setUser(authenticatedUser)
        } catch (error: unknown){
            setError(getErrorMessage(error))
        }finally{
            setBusy(false)
        }
    }

    async function handleLogout() {
        if (busy) return

        setBusy(true)
        setError(null)

        try{
            await logout()
            setUser(null)
        }catch (error:unknown){
            setError(getErrorMessage(error))
        }finally{
            setBusy(false)
        }
    }

    if (checkingSession){
        return(
            <main className='login-page'>
                <section className='login-card'>
                    <p role="status">Verificando sua sessão...</p>
                </section>
            </main>
        )
    }

    if (user){
        return (
            <main className="login-page">
                <section className="login-card" aria-labelledby="welcome-title">
                    <h1 id="welcome-title">Olá, {user.name}!</h1>
                    <p>Você está conectado como {user.email}.</p>

                    {error && (
                        <p className="login-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleLogout()}
                    >
                        {busy ? 'Saindo...' : 'Sair da conta'}
                    </button>
                </section>
            </main>
        )
    }

    return (
        <main className="login-page">
            <section className="login-card" aria-labelledby="login-title">
                <h1 id="login-title">Entrar no EventHub</h1>
                <p>Acesse sua conta para acompanhar seus ingressos.</p>

                {error && (
                    <p id="login-error" className="login-error" role="alert">
                        {error}
                    </p>
                )}

                <form
                    aria-busy={busy}
                    aria-describedby={error ? 'login-error' : undefined}
                    onSubmit={(event) => {
                        event.preventDefault()
                        void handleLogin(event.currentTarget)
                    }}
                >
                    <div className="login-field">
                        <label htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="username"
                            placeholder="você@exemplo.com"
                            disabled={busy}
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">Senha</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            disabled={busy}
                            required
                        />
                    </div>

                    <button type="submit" disabled={busy}>
                        {busy ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </section>
        </main>
    )
}