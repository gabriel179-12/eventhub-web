import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import './App.css'

export default function App(){
  const [page, setPage] = useState<'login' | 'register'>('login')

  if (page === 'register') {
    return <RegisterPage onGoToLogin={() => setPage('login')} />
  }

  return <LoginPage onGoToRegister={() => setPage('register')} />
}