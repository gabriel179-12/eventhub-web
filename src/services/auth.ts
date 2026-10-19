export type User = {
  id: number
  name: string
  email: string
}

type UserResponse = {
  data: User
}

function getApiUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL

  if (!apiUrl) {
    throw new Error('Configure VITE_API_URL no .env')
  }

  return apiUrl.replace(/\/+$/, '')
}

function getCsrfToken(): string {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith('XSRF-TOKEN='))

  if (!cookie) {
    throw new Error('Não foi possível preparar a sessão. Tente novamente.')
  }

  return decodeURIComponent(cookie.slice('XSRF-TOKEN='.length))
}

async function prepareCsrf(): Promise<void> {
  const url = new URL('/sanctum/csrf-cookie', getApiUrl())

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Não foi possível iniciar a sessão.')
  }
}

export async function getCurrentUser(
  signal?: AbortSignal,
): Promise<User | null> {
  const response = await fetch(`${getApiUrl()}/me`, {
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
    signal,
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('Não foi possível verificar sua sessão.')
  }

  const result: UserResponse = await response.json()

  return result.data
}

export async function login(
  email: string,
  password: string,
): Promise<User> {
  await prepareCsrf()

  const response = await fetch(`${getApiUrl()}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': getCsrfToken(),
    },
    body: JSON.stringify({ email, password }),
  })

  if (response.status === 422) {
    throw new Error('E-mail ou senha inválidos.')
  }

  if (response.status === 419) {
    throw new Error('A sessão expirou. Tente entrar novamente.')
  }

  if (response.status === 429) {
    throw new Error('Muitas tentativas. Aguarde um pouco e tente novamente.')
  }

  if (!response.ok) {
    throw new Error('Não foi possível entrar. Tente novamente mais tarde.')
  }

  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Não foi possível confirmar sua sessão.')
  }

  return user
}

export async function logout(): Promise<void> {
  await prepareCsrf()

  const response = await fetch(`${getApiUrl()}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-XSRF-TOKEN': getCsrfToken(),
    },
  })

  if (!response.ok && response.status !== 401) {
    throw new Error('Não foi possível sair da conta. Tente novamente.')
  }
}