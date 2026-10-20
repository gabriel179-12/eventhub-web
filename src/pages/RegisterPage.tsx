import { useState } from 'react'
import { register, RegistrationValidationError } from '../services/auth'
import type {
  RegistrationErrors,
  User,
} from '../services/auth'

type RegisterPageProps = {
  onGoToLogin: () => void
}

export default function RegisterPage({
  onGoToLogin,
}: RegisterPageProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<RegistrationErrors>({})
  const [createdUser, setCreatedUser] = useState<User | null>(null)

  async function handleRegister(form: HTMLFormElement) {
    if (busy) return

    const formData = new FormData(form)

    const data = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      password: String(formData.get('password') ?? ''),
      password_confirmation: String(
        formData.get('password_confirmation') ?? '',
      ),
    }

    setError(null)
    setFieldErrors({})

    if (data.password !== data.password_confirmation) {
      setFieldErrors({
        password_confirmation: ['As senhas precisam ser iguais.'],
      })
      return
    }

    setBusy(true)

    try {
      const user = await register(data)

      form.reset()
      setCreatedUser(user)
    } catch (error: unknown) {
      if (error instanceof RegistrationValidationError) {
        setFieldErrors(error.errors)
        setError(error.message)
      } else if (error instanceof TypeError) {
        setError('Não foi possível conectar ao servidor.')
      } else {
        setError(
          error instanceof Error
            ? error.message
            : 'Não foi possível criar sua conta.',
        )
      }
    } finally {
      setBusy(false)
    }
  }

  if (createdUser) {
    return (
      <main className="login-page">
        <section className="login-card" aria-labelledby="success-title">
          <h1 id="success-title">Conta criada!</h1>
          <p role="status">
            {createdUser.name}, seu cadastro foi concluído.
            Entre com seu e-mail e senha para acessar sua conta.
          </p>

          <button type="button" onClick={onGoToLogin}>
            Ir para o login
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="register-title">
        <h1 id="register-title">Criar sua conta</h1>
        <p>Cadastre-se no EventHub para participar dos eventos.</p>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <form
          aria-busy={busy}
          onSubmit={(event) => {
            event.preventDefault()
            void handleRegister(event.currentTarget)
          }}
        >
          <div className="login-field">
            <label htmlFor="name">Nome</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={255}
              disabled={busy}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
              required
            />
            {fieldErrors.name && (
              <small id="name-error" className="field-error">
                {fieldErrors.name.join(' ')}
              </small>
            )}
          </div>

          <div className="login-field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="voce@exemplo.com"
              maxLength={255}
              disabled={busy}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              required
            />
            {fieldErrors.email && (
              <small id="email-error" className="field-error">
                {fieldErrors.email.join(' ')}
              </small>
            )}
          </div>

          <div className="login-field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              disabled={busy}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password
                  ? 'password-help password-error'
                  : 'password-help'
              }
              required
            />
            <small id="password-help">
              Use pelo menos 8 caracteres.
            </small>
            {fieldErrors.password && (
              <small id="password-error" className="field-error">
                {fieldErrors.password.join(' ')}
              </small>
            )}
          </div>

          <div className="login-field">
            <label htmlFor="password_confirmation">
              Confirmar senha
            </label>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              minLength={8}
              disabled={busy}
              aria-invalid={Boolean(fieldErrors.password_confirmation)}
              aria-describedby={
                fieldErrors.password_confirmation
                  ? 'confirmation-error'
                  : undefined
              }
              required
            />
            {fieldErrors.password_confirmation && (
              <small id="confirmation-error" className="field-error">
                {fieldErrors.password_confirmation.join(' ')}
              </small>
            )}
          </div>

          <button type="submit" disabled={busy}>
            {busy ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <button
          type="button"
          className="auth-link"
          disabled={busy}
          onClick={onGoToLogin}
        >
          Já tenho uma conta
        </button>
      </section>
    </main>
  )
}