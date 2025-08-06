import React, { useState, useEffect, FormEvent } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { PricingSection } from '../components/PricingSection'
import { sendEmail } from '../services/emailService'
import { 
  ArrowRight, 
  Calendar, 
  CheckCircle, 
  Menu, 
  Shield, 
  X,
  Clock,
  Users,
  MessageSquare,
  BarChart3,
  Smartphone,
  Sparkles,
  Headphones,
  Mail,
  MapPin,
  Globe,
  Gift,
  Timer,
  TrendingUp
} from 'lucide-react'
import logo from '../assets/img/logo.png'
import logoblanco from '../assets/img/logo_white.png'

const Landing: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleMobileNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Gestión de Reservas',
      description: 'Calendario interactivo con vistas múltiples y gestión de horarios para tus servicios.',
      gradient: "from-primary-400 to-emerald-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Base de Datos de Clientes',
      description: 'Administra tu cartera de clientes con historial completo de reservas y datos de contacto.',
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Análisis y Reportes',
      description: 'Dashboard con métricas básicas de reservas e ingresos para seguimiento de tu negocio.',
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Seguridad de Datos',
      description: 'Protección de datos y acceso seguro a tu información.',
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Acceso Multiplataforma',
      description: 'Diseño responsive que funciona perfectamente en desktop, tablet y móvil desde cualquier lugar.',
      gradient: "from-red-500 to-pink-600"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Notificaciones',
      description: 'Recordatorios por correo para tus reservas y actualizaciones importantes.',
      gradient: "from-indigo-500 to-purple-600"
    }
  ]

  const benefits = [
    'Sistema intuitivo y fácil de usar',
    'Acceso desde cualquier dispositivo',
    'Almacenamiento seguro de datos',
    'Notificaciones por correo',
    'Reportes básicos de gestión',
    'Soporte técnico por correo'
  ]

  const benefits_cards = [
    {
      title: "Ahorro en gestión",
      description: "Automatiza la gestión de citas: confirmaciones, recordatorios y reprogramaciones",
      metric: "10hr.",
      color: "text-green-400"
    },
    {
      title: "Menos cancelaciones",
      description: "Reduce cancelaciones de último minuto con recordatorios SMS y email",
      metric: "-35%",
      color: "text-blue-400"
    },
    {
      title: "Más clientes nuevos",
      description: "Facilita que nuevos clientes encuentren y reserven tus servicios online",
      metric: "+25%",
      color: "text-purple-400"
    },
    {
      title: "Gestion digital",
      description: "Gestion digital de citas y reservas",
      metric: "100%",
      color: "text-orange-400"
    }
  ];

  const earlyAdopterFeatures = [
    {
      icon: Users,
      title: 'Proyecto en Desarrollo',
      description: 'Únete a nuestro proyecto y ayúdanos a mejorar la plataforma con tu retroalimentación.'
    },
    {
      icon: CheckCircle,
      title: 'Primeros Usuarios',
      description: 'Beneficios especiales para los primeros usuarios: acceso temprano a nuevas funcionalidades.'
    },
    {
      icon: Shield,
      title: 'Periodo de Prueba',
      description: 'Prueba la plataforma sin compromiso durante el periodo de evaluación.'
    }
  ]

  const stats = [
    { number: '30 días', label: 'Prueba gratis sin tarjeta', icon: Gift },
    { number: '4 minutos', label: 'Configura tu negocio y listo', icon: Timer },
    { number: 'Web', label: 'Disponible cuando lo necesites', icon: Globe },
    { number: 'Soporte', label: 'Soporte personalizado', icon: Headphones }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <a href="#hero" onClick={(e) => handleMobileNavClick(e, '#hero')}>
                <img src={logo} alt="Logo" className="h-8 w-46" />
              </a>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">Características</a>
              <a href="#benefits" className="text-gray-600 hover:text-primary-600 transition-colors">Beneficios</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition-colors">Precios</a>
              <a href="#contact" className="text-gray-600 hover:text-primary-600 transition-colors">Contacto</a>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/auth" 
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link to="/onboarding">
                <Button>Prueba Gratis</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg md:hidden">
                <nav className="flex flex-col p-4 space-y-4">
                  <a 
                    href="#features" 
                    className="text-gray-600 hover:text-primary-600 transition-colors block py-2"
                    onClick={(e) => handleMobileNavClick(e, '#features')}
                  >
                    Características
                  </a>
                  <a 
                    href="#benefits" 
                    className="text-gray-600 hover:text-primary-600 transition-colors block py-2"
                    onClick={(e) => handleMobileNavClick(e, '#benefits')}
                  >
                    Beneficios
                  </a>
                  <a 
                    href="#pricing" 
                    className="text-gray-600 hover:text-primary-600 transition-colors block py-2"
                    onClick={(e) => handleMobileNavClick(e, '#pricing')}
                  >
                    Precios
                  </a>
                  <a 
                    href="#contact" 
                    className="text-gray-600 hover:text-primary-600 transition-colors block py-2"
                    onClick={(e) => handleMobileNavClick(e, '#contact')}
                  >
                    Contacto
                  </a>
                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <Link 
                      to="/auth" 
                      className="block text-gray-600 hover:text-primary-600 transition-colors py-3"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button variant="outline" size="lg" className="w-full">Iniciar Sesión</Button>
                    </Link>
                    <Link 
                      to="/onboarding" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button size="lg" className="w-full">Prueba Gratis</Button>
                    </Link>
                  </div>
                </nav>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-10">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(93, 193, 185, 0.1), transparent 40%)`
            }}
          ></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(93, 193, 185, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(93, 193, 185, 0.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                {/* Floating Badge */}
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-600 text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4 mr-2 text-primary-500" />
                  Gestión de Reservas Online
                </div>

                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Gestiona tu Negocio</span>
                  <span className="block mt-2">de Forma Simple</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Simplifica la gestión de tus reservas y clientes con nuestra plataforma
                  intuitiva y fácil de usar. La solución que tu negocio necesita.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/onboarding">
                  <Button size="lg" className="w-full sm:w-auto group relative overflow-hidden">
                    <span className="relative z-10 flex items-center">
                      Prueba 30 Días Gratis
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div className="group flex items-center p-2 bg-gradient-to-br from-white/80 to-white/60 rounded-2xl backdrop-blur-sm border border-primary-100 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-100/20 transition-all duration-300">
                  <div className="mr-3 p-2 rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors duration-300">
                    <CheckCircle className="h-5 w-5 text-primary-500 group-hover:text-primary-600 transition-colors duration-300" />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">Sin costo inicial</span>
                </div>
                <div className="group flex items-center p-4 bg-gradient-to-br from-white/80 to-white/60 rounded-2xl backdrop-blur-sm border border-primary-100 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-100/20 transition-all duration-300">
                  <div className="mr-3 p-2 rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors duration-300">
                    <Clock className="h-5 w-5 text-primary-500 group-hover:text-primary-600 transition-colors duration-300" />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">Configuración sencilla</span>
                </div>
                <div className="group flex items-center p-4 bg-gradient-to-br from-white/80 to-white/60 rounded-2xl backdrop-blur-sm border border-primary-100 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-100/20 transition-all duration-300">
                  <div className="mr-3 p-2 rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors duration-300">
                    <Users className="h-5 w-5 text-primary-500 group-hover:text-primary-600 transition-colors duration-300" />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">Soporte personalizado</span>
                </div>
              </div>
            </div>

            <div className="relative perspective-1000">
              <div className="transform hover:-rotate-y-12 transition-transform duration-700">
                <div className="bg-white rounded-2xl shadow-2xl shadow-primary-100/50 p-4 border border-primary-100">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-3">
                          <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                          Panel de Control
                        </h3>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 p-6 rounded-xl border border-primary-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-primary-600 font-medium">Resumen de Ingresos</p>
                            <p className="text-2xl font-bold text-primary-700 mt-1">$150.000</p>
                            <p className="text-xs text-primary-500 mt-1 flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Análisis diario
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-secondary-50 to-secondary-100/50 p-6 rounded-xl border border-secondary-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-secondary-600 font-medium">Gestión de Reservas</p>
                            <p className="text-2xl font-bold text-secondary-700 mt-1">12</p>
                            <p className="text-xs text-secondary-500 mt-1 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Próximas citas
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-xl p-6 border border-primary-100">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-600">Tendencia Semanal</h4>
                        <div className="flex items-center space-x-2 text-xs text-primary-600">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <span>Reservas</span>
                          <div className="w-2 h-2 bg-secondary-500 rounded-full ml-2"></div>
                          <span>Ingresos</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="relative h-[120px] flex items-end justify-between space-x-1">
                          <div className="absolute inset-0 grid grid-rows-4 gap-6 -z-10">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="w-full border-t border-gray-100"></div>
                            ))}
                          </div>
                          {[35, 45, 55, 40, 50, 30, 35].map((height, i) => (
                            <div key={i} className="w-full flex items-end space-x-0.5">
                              <div className="w-1/2">
                                <div 
                                  className="w-full bg-gradient-to-t from-primary-500/70 to-primary-400/70 rounded-t transition-all duration-700 ease-out hover:from-primary-500/80 hover:to-primary-400/80"
                                  style={{ height: `${height * 2}px` }}
                                ></div>
                              </div>
                              <div className="w-1/2">
                                <div 
                                  className="w-full bg-gradient-to-t from-secondary-500/70 to-secondary-400/70 rounded-t transition-all duration-700 ease-out hover:from-secondary-500/80 hover:to-secondary-400/80"
                                  style={{ height: `${height * 1.8}px` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
                            <div key={i} className="text-center w-full">{day}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative py-20 overflow-hidden bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_70%_50%,rgba(236,72,153,0.08),transparent_40%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="group relative p-6 text-center rounded-2xl border border-gray-800 bg-gray-900/50 hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-700 hover:shadow-lg hover:shadow-primary-900/10">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur"></div>
                <div className="relative space-y-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 group-hover:from-primary-500/30 group-hover:to-secondary-500/30 transition-all duration-300">
                    {React.createElement(stat.icon, { className: "w-6 h-6 text-white/90" })}
                  </div>
                  <div>
                    <div className="text-2xl md:text-4xl font-bold bg-gradient-to-br from-white to-white/80 text-transparent bg-clip-text mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-400 text-sm md:text-base font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Características Poderosas para tu Negocio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas profesionales diseñadas para optimizar cada aspecto de tu operación empresarial
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
              key={index} 
              className="group relative rounded-2xl p-8 border border-gray-700/50 hover:border-[#338B85]/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 backdrop-blur-xl"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}></div>
              
              {/* Icon */}
              <div className={`relative z-10 w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-600 mb-4 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-900 leading-relaxed transition-colors duration-300">
                {feature.description}
              </p>
              
              {/* Hover Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#5DC1B9] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Diseñado para Transformar tu Negocio
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Descubre cómo Axendar puede impulsar el crecimiento de tu empresa
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Link to="/onboarding">
                  <Button size="lg">
                    Comenzar Transformación
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/*<div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Métricas de Rendimiento</h3>
                    <Award className="h-6 w-6 text-primary-500" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ahorro de Tiempo</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-primary-500 h-2 rounded-full" style={{width: '60%'}}></div>
                        </div>
                        <span className="text-primary-600 font-semibold">4h/día</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Gestión Digital</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-secondary-400 h-2 rounded-full" style={{width: '100%'}}></div>
                        </div>
                        <span className="text-secondary-600 font-semibold">100%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Disponibilidad</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
                        </div>
                        <span className="text-green-600 font-semibold">24/7</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>*/}

            <div className="relative grid grid-cols-1 gap-2">
            {benefits_cards.map((benefit, index) => (
              <div 
                key={index} 
                className="group relative rounded-2xl p-6 border transition-all duration-500 backdrop-blur-xl overflow-hidden"
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-secondary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex items-start space-x-6 justify-center items-center">
                  <div className="flex-shrink-0">
                    <div className={`text-4xl font-black ${benefit.color} animate-pulse`}>
                      {benefit.metric}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-600 mb-3 group-hover:text-[#5DC1B9] transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-600 transition-colors duration-300">
                      {benefit.description}
                    </p>
                  </div>
                </div>
                
                {/* Pulse Effect */}
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#5DC1B9]/20 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* Early Adopter Benefits Section */}
      <section id="early-adopter" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sé Parte del Futuro
            </h2>
            <p className="text-xl text-gray-600">
              Beneficios exclusivos para nuestros primeros usuarios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {earlyAdopterFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
                <div className="inline-flex p-3 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-400">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Comienza a Optimizar tu Negocio Hoy
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Sé de los primeros en experimentar el futuro de la gestión de reservas
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/onboarding">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Prueba Gratuita por 30 Días
              </Button>
            </Link>
          </div>
          
          <p className="text-primary-100 text-sm mt-6">
            Sin tarjeta de crédito • Configuración en 5 minutos • Soporte 24/7
          </p>
        </div>
      </section>


      {/* Pricing Section */}
      <PricingSection />

      {/* Contact Section */}
      <section id="contact" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_70%_50%,rgba(236,72,153,0.08),transparent_40%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-secondary-900 to-secondary-900 text-transparent bg-clip-text mb-4">
              ¿Tienes dudas? Contáctanos
            </h2>
            <p className="text-xl text-gray-600">
              Nuestro equipo está listo para ayudarte a potenciar tu negocio
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="relative p-8 rounded-2xl bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary-500 to-secondary-500 rounded-2xl opacity-10 blur"></div>
              <form className="relative space-y-3" onSubmit={async (e: FormEvent) => {
                e.preventDefault()
                if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                  toast.error('Por favor completa todos los campos')
                  return
                }
                setIsSubmitting(true)
                try {
                  await sendEmail(
                    'a.n.zuniga.r@gmail.com',
                    `Nuevo mensaje de contacto: ${formData.subject}`,
                    {
                      title: 'Nuevo Mensaje de Contacto Web Axendar',
                      name: 'Administrador',
                      message: `
                          <b>Nombre:</b> ${formData.name} <br/>
                          <b>Email:</b> ${formData.email} <br/>
                          <b>Asunto:</b> ${formData.subject} <br/>
                          <b>Mensaje:</b> ${formData.message}`,
                      additionalInfo: 'Mensaje enviado desde el formulario de contacto de la landing page'
                    }
                  )
                  toast.success('¡Gracias por contactarnos! Te responderemos pronto.')
                  setFormData({ name: '', email: '', subject: '', message: '' })
                } catch (error) {
                  toast.error('Error al enviar el mensaje. Por favor intenta nuevamente.')
                } finally {
                  setIsSubmitting(false)
                }
              }}>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Nombre</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-lg border border-primary-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 rounded-lg border border-primary-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Asunto</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-primary-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="¿En qué podemos ayudarte?"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Mensaje</label>
                  <textarea 
                    rows={4} 
                    className="w-full px-4 py-3 rounded-lg border border-primary-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe tu consulta aquí..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                  ></textarea>
                </div>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full group relative overflow-hidden" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  <div className="relative flex items-center justify-center gap-2">
                    <Mail className={`h-5 w-5 transition-transform ${isSubmitting ? 'animate-bounce' : ''}`} />
                    <span>{isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}</span>
                  </div>
                  {isSubmitting && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 animate-pulse"></div>
                  )}
                </Button>
              </form>
            </div>

            {/* Company Info */}
            <div className="space-y-4">
              <div className="relative p-8 rounded-2xl bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl opacity-10 blur"></div>
                <div className="relative space-y-6">
                  <img src={logo} alt="Logo" className="w-40" />
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 text-gray-600">
                      <MapPin className="h-5 w-5 text-primary-400" />
                      <span>Santiago, Chile (Servicio Global)</span>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <Mail className="h-5 w-5 text-primary-400" />
                      <span>soporte@axendar.com</span>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <Clock className="h-5 w-5 text-primary-400" />
                      <span>Soporte personalizado</span>
                    </div>
                  </div>

                  <div className="pt-6">
                    <h4 className="text-lg font-semibold text-gray-600 mb-4">¿Por qué elegirnos?</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="items-center justify-center text-center md:text-start p-2 md:p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                        <div className="flex items-center gap-3 flex-col md:flex-row">
                          <div className="p-2 rounded-lg bg-primary-50">
                            <CheckCircle className="h-6 w-6 text-primary-500" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-gray-800">Simple</div>
                            <div className="text-sm text-gray-600">Fácil de usar</div>
                          </div>
                        </div>
                      </div>
                      <div className="items-center justify-center text-center md:text-start p-2 md:p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                        <div className="flex items-center gap-3 flex-col md:flex-row">
                          <div className="p-2 rounded-lg bg-secondary-50">
                            <Shield className="h-6 w-6 text-secondary-500" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-gray-800">Seguro</div>
                            <div className="text-sm text-gray-600">Datos protegidos</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img src={logoblanco} alt="Logo" className="h-8 w-46" />
              </div>
              <p className="text-gray-400">
                Sistema de gestión de reservas simple y efectivo
              </p>
              <div className="flex space-x-4">
                <Mail className="h-5 w-5 text-gray-400 hover:text-primary-400 cursor-pointer" />
                <MessageSquare className="h-5 w-5 text-gray-400 hover:text-primary-400 cursor-pointer" />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#benefits" className="hover:text-white transition-colors">Beneficios</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Precios</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Guía de Inicio</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preguntas Frecuentes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorial</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#contact" className="hover:text-white transition-colors">Soporte 24/7</a></li>
                <li><a href="mailto:soporte@reservaspro.com" className="hover:text-white transition-colors">soporte@reservaspro.com</a></li>
                <li><a href="tel:+1234567890" className="hover:text-white transition-colors">+1 (234) 567-890</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Axendar
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Términos y Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing