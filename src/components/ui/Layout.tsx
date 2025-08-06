import React, { useState, useEffect } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'

interface NavigationSubmenuItem {
  name: string
  displayName: string
  href: string
  description: string
}

interface NavigationItem {
  name: string
  displayName: string
  href: string
  icon: React.FC<{ className?: string }>
  description: string
  submenu?: NavigationSubmenuItem[]
}

import {
  IconHome,
  IconCalendar,
  IconUsers,
  IconUserCheck,
  IconBriefcase,
  IconSettings,
  IconLogOut,
  IconMenu,
  IconX,
} from './Icons'
import logo from '../../assets/img/logo.png'

const Layout: React.FC = () => {
  const { profile, signOut } = useAuthContext()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // Simular un tiempo de carga mínimo para mostrar la transición
    const timer = setTimeout(() => {
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [location.pathname])

  const navigation: NavigationItem[] = [
    { 
      name: 'Panel',
      displayName: 'Panel Principal',
      href: '/app/dashboard',
      icon: IconHome,
      description: 'Vista general de tu negocio'
    },
    { 
      name: 'Reservas',
      displayName: 'Gestión de Reservas',
      href: '/app/reservations',
      icon: IconCalendar,
      description: 'Gestiona las reservas de tus clientes'
    },
    { 
      name: 'Clientes',
      displayName: 'Gestión de Clientes',
      href: '/app/clients',
      icon: IconUsers,
      description: 'Administra tu base de datos de clientes'
    },
    { 
      name: 'Profesionales',
      displayName: 'Gestión de Profesionales',
      href: '/app/professionals',
      icon: IconUserCheck,
      description: 'Gestiona tu equipo de trabajo'
    },
    { 
      name: 'Servicios',
      displayName: 'Gestión de Servicios',
      href: '/app/services',
      icon: IconBriefcase,
      description: 'Configura los servicios que ofreces'
    },
    {
      name: 'Administración',
      displayName: 'Panel de Administración',
      href: '/app/admin',
      icon: IconSettings,
      description: 'Configura los ajustes de tu negocio'
    },
  ]

  const isActive = (href: string) => location.pathname === href

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-r-transparent mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-primary-100 bg-opacity-50">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Logo" className="h-8 w-auto" />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-primary-600 p-2 rounded-md"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href) || (item.submenu?.some(sub => isActive(sub.href)))
                        ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                  {item.submenu && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isActive(subItem.href)
                              ? 'text-primary-700 bg-primary-50'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className="truncate">{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {profile?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{profile?.name}</p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <IconLogOut className="mr-3 h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-0 lg:pl-64 min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden -ml-2 mr-2 p-2 text-gray-600 hover:text-gray-900"
              >
                <IconMenu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {navigation.find(item => 
                    isActive(item.href) || item.submenu?.some(sub => isActive(sub.href))
                  )?.submenu?.find(sub => isActive(sub.href))?.displayName ||
                    navigation.find(item => isActive(item.href))?.displayName ||
                    'Panel Principal'
                  }
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {navigation.find(item => 
                    isActive(item.href) || item.submenu?.some(sub => isActive(sub.href))
                  )?.submenu?.find(sub => isActive(sub.href))?.description ||
                    navigation.find(item => isActive(item.href))?.description
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 font-medium">
                {profile?.company_name || 'Mi Empresa'}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout