import React, { useState, useEffect } from 'react'
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { useNotifications } from '../hooks/useNotifications'

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
  IconBell,
} from '../components/ui/Icons'
import logo from '../assets/img/logo.png'
import logo_icono from '../assets/img/ICONO.png'
import { PLAN_LABELS } from '../constants/plans'

const Layout: React.FC = () => {
  const { profile, signOut, user } = useAuthContext()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Modo colapsado para escritorio: solo íconos
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  
  // Use notifications hook
  const { notifications, unreadCount } = useNotifications(user)

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    if (notification.url) {
      navigate(notification.url)
      setShowNotifications(false)
    }
  }


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
      <aside className={`fixed inset-y-0 left-0 z-30 ${sidebarCollapsed ? 'lg:w-14' : 'lg:w-64'} w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-all duration-200 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center h-12 px-2' : 'justify-between h-16 px-6'} bg-primary-100 bg-opacity-50`}>
            <div className={`flex items-center ${sidebarCollapsed ? '' : 'space-x-3'}`}>
              {!sidebarCollapsed ? (
                <img src={logo} alt="Logo" className='h-8 w-auto' />
              ) : (
                <img src={logo_icono} alt="Logo" className='h-10 w-auto' />
              )}
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white hover:bg-primary-600 p-2 rounded-md">
              <IconX className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 ${sidebarCollapsed ? 'px-1' : 'px-4'} py-4 ${sidebarCollapsed ? 'space-y-1' : 'space-y-2'}`}>
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} ${sidebarCollapsed ? 'px-1 py-2' : 'px-4 py-3'} text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href) || (item.submenu?.some(sub => isActive(sub.href)))
                        ? `${sidebarCollapsed ? 'bg-primary-50 text-primary-700' : 'bg-primary-50 text-primary-700 border-r-4 border-primary-500'}`
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } ${sidebarCollapsed ? 'relative group' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`${sidebarCollapsed ? '' : 'mr-3'} ${sidebarCollapsed ? 'h-5 w-5' : 'h-5 w-5'}`} />
                    {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                    {sidebarCollapsed && (
                      <span
                        className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap px-2 py-1 text-xs bg-primary-900 text-white rounded shadow-lg z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        role="tooltip"
                      >
                        {item.displayName || item.name}
                      </span>
                    )}
                  </Link>
                  {item.submenu && !sidebarCollapsed && (
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
          <div className="border-t border-gray-200 p-2">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {profile?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              {!sidebarCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{profile?.name}</p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                  {profile?.subscription_plan && (
                    <p className="mt-1 text-xs text-gray-500">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 font-medium">
                        Plan: {PLAN_LABELS[(profile.subscription_plan as 'free' | 'basic' | 'premium' | 'enterprise')] || profile.subscription_plan}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={signOut}
              className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} ${sidebarCollapsed ? 'px-2' : 'px-4'} py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-900 rounded-lg transition-colors`}>
              <IconLogOut className={`${sidebarCollapsed ? '' : 'mr-3'} h-4 w-4`} />
              {!sidebarCollapsed && 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={`pl-0 ${sidebarCollapsed ? 'lg:pl-14' : 'lg:pl-64'} min-h-screen bg-gray-50`}>
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-2">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden -ml-2 mr-2 p-2 text-gray-600 hover:text-gray-900"
              >
                <IconMenu className="h-6 w-6" />
              </button>
              {/* Desktop toggle for collapse/expand */}
              <button
                onClick={() => setSidebarCollapsed(prev => !prev)}
                className="hidden lg:inline-flex -ml-1 mr-3 p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50"
                title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
              >
                <IconMenu className="h-5 w-5" />
              </button>
              <div className="max-w-[calc(100vw-120px)] lg:max-w-none overflow-hidden">
                <h1 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">
                  {navigation.find(item => 
                    isActive(item.href) || item.submenu?.some(sub => isActive(sub.href))
                  )?.submenu?.find(sub => isActive(sub.href))?.displayName ||
                    navigation.find(item => isActive(item.href))?.displayName ||
                    'Panel Principal'
                  }
                </h1>
                <p className="hidden lg:block text-sm text-gray-500 mt-0.5 truncate">
                  {navigation.find(item => 
                    isActive(item.href) || item.submenu?.some(sub => isActive(sub.href))
                  )?.submenu?.find(sub => isActive(sub.href))?.description ||
                    navigation.find(item => isActive(item.href))?.description
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center">
              {!sidebarCollapsed && (
                <span className="hidden lg:inline text-sm text-gray-600 font-medium">
                  {profile?.company_name || 'Mi Empresa'}
                </span>
              )}

              {/* Notifications */}
              <div className="relative mr-4 ml-2">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Notificaciones"
                >
                  <IconBell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {showNotifications && (
                  <>
                    {/* Backdrop for mobile */}
                    <div 
                      className="fixed inset-0 z-10 lg:hidden" 
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
                          {unreadCount > 0 && (
                            <span className="text-sm text-gray-500">
                              {unreadCount} sin leer
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                notification.unread ? 'bg-blue-50' : ''
                              } ${notification.url ? 'hover:bg-blue-100' : ''}`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                  notification.type === 'success' ? 'bg-green-500' :
                                  notification.type === 'warning' ? 'bg-yellow-500' :
                                  notification.type === 'error' ? 'bg-red-500' :
                                  'bg-blue-500'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {notification.title}
                                    </p>
                                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                      {notification.time}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <IconBell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No hay notificaciones</p>
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200">
                          <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
                            Ver todas las notificaciones
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-x-hidden">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-r-transparent mb-4" />
                <p className="text-gray-600">Cargando...</p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  )
}

export default Layout