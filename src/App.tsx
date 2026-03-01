import { useEffect, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import WebApp from '@twa-dev/sdk'

import Home from './pages/Home'
import Admin from './pages/Admin'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Layout from './components/Layout'
import SplashScreen from './components/SplashScreen'

function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    WebApp.ready()
    WebApp.expand()
    document.documentElement.classList.add('dark')
  }, [])

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false)
  }, [])

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
      <Toaster
        position="top-center"
        containerStyle={{
          top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        }}
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            fontSize: '14px',
          },
          duration: 3000,
        }}
      />
    </BrowserRouter>
  )
}

export default App
