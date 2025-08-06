import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import { OnboardingAuthProvider } from './contexts/OnboardingAuthContext'
import LoadingSpinner from './components/ui/LoadingSpinner'
import Layout from './components/ui/Layout'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Reservations from './pages/Reservations'
import Clients from './pages/Clients'
import Professionals from './pages/Professionals'
import Services from './pages/Services'
import Admin from './pages/Admin'
import BookingUrl from './pages/admin/BookingUrl'
import ReservarPage from './routes/ReservarPage'
import ConfirmacionPage from './routes/ConfirmacionPage'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Financial from './pages/admin/Financial'
import Profile from './pages/admin/Profile'
import Landing2 from './pages/Landing2'
import ProfessionalDetails from './pages/ProfessionalDetails'
import NotFound from './pages/NotFound'

// Componente para las rutas protegidas que requieren autenticación
const PrivateRoutes: React.FC = () => {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

   
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/professionals" element={<Professionals />} />
        <Route path="/professionals/new" element={<ProfessionalDetails />} />
        <Route path="/professionals/:id" element={<ProfessionalDetails />} />
        <Route path="/services" element={<Services />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/booking-url" element={<BookingUrl />} />
        <Route path="/admin/financial" element={<Financial />} />
        <Route path="/admin/profile" element={<Profile />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Página de inicio pública */}
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing2 />} />

        {/* Rutas de reservas */}
        <Route path="/reservar/:userId" element={<ReservarPage />} />
        <Route path="/confirmacion" element={<ConfirmacionPage />} />

        {/* Ruta de onboarding con autenticación temporal */}
        <Route path="/onboarding" element={
          <OnboardingAuthProvider>
            <Onboarding />
          </OnboardingAuthProvider>
        } />

        {/* Rutas protegidas bajo AuthProvider */}
        <Route path="/auth" element={<AuthProvider><Auth /></AuthProvider>} />
        <Route path="/app/*" element={
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              <PrivateRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    style: {
                      background: '#338B85',
                    },
                  },
                  error: {
                    style: {
                      background: '#EF4444',
                    },
                  },
                }}
              />
            </div>
          </AuthProvider>
        } />

        {/* Página 404 para rutas no encontradas */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App