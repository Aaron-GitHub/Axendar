import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Bell, 
  BarChart3, 
  Shield, 
  Smartphone, 
  CreditCard,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Facebook,
  Star,
  Zap,
  TrendingUp,
  Globe,
  Sparkles,
  ArrowRight,
  Play,
  Cpu,
  Wifi,
  Database,
  Lock
} from 'lucide-react';

const Landing2: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const features = [
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "IA Predictiva Avanzada",
      description: "Algoritmos de machine learning que predicen patrones de reservas y optimizan automáticamente tu agenda para maximizar ingresos.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Automatización Inteligente",
      description: "Sistema neuronal que aprende de tus clientes y automatiza recordatorios, reprogramaciones y seguimientos personalizados.",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Sincronización Cuántica",
      description: "Tecnología de sincronización en tiempo real que conecta múltiples plataformas instantáneamente sin conflictos.",
      gradient: "from-blue-500 to-cyan-400"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Analytics Predictivos",
      description: "Dashboard con visualizaciones 3D y predicciones de tendencias basadas en big data y análisis comportamental.",
      gradient: "from-green-400 to-emerald-500"
    },
    {
      icon: <Wifi className="w-8 h-8" />,
      title: "API Híper-Conectada",
      description: "Integración instantánea con más de 500+ aplicaciones mediante webhooks inteligentes y conectores nativos.",
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Seguridad Blockchain",
      description: "Protección de datos con encriptación cuántica y respaldos distribuidos en blockchain para máxima seguridad.",
      gradient: "from-red-500 to-pink-600"
    }
  ];

  const benefits = [
    {
      title: "🚀 Aumenta ingresos hasta 300%",
      description: "IA que optimiza precios dinámicos y detecta oportunidades de upselling automáticamente",
      metric: "+300%",
      color: "text-green-400"
    },
    {
      title: "⚡ Ahorra 40+ horas semanales",
      description: "Automatización completa elimina tareas repetitivas y optimiza flujos de trabajo",
      metric: "40h",
      color: "text-blue-400"
    },
    {
      title: "🎯 Reduce ausencias en 95%",
      description: "Sistema predictivo de recordatorios multicanal con análisis comportamental",
      metric: "95%",
      color: "text-purple-400"
    },
    {
      title: "🔥 ROI de 2000% garantizado",
      description: "Retorno de inversión comprobado con métricas en tiempo real y optimización continua",
      metric: "2000%",
      color: "text-orange-400"
    }
  ];

  const plans = [
    {
      name: "Starter AI",
      price: "$49",
      period: "/mes",
      description: "IA básica para emprendedores digitales",
      features: [
        "IA Predictiva Básica",
        "Hasta 500 reservas/mes",
        "2 usuarios conectados",
        "Analytics en tiempo real",
        "Soporte 24/7 por chat",
        "Integración con 50+ apps"
      ],
      recommended: false,
      gradient: "from-gray-100 to-gray-200",
      textColor: "text-gray-700"
    },
    {
      name: "Pro Quantum",
      price: "$149",
      period: "/mes",
      description: "Tecnología cuántica para profesionales",
      features: [
        "IA Avanzada + Machine Learning",
        "Reservas ilimitadas",
        "10 usuarios simultáneos",
        "Dashboard 3D interactivo",
        "API híper-conectada",
        "Blockchain security",
        "Manager dedicado",
        "Predicciones de mercado"
      ],
      recommended: true,
      gradient: "from-[#338B85] to-[#5DC1B9]",
      textColor: "text-white"
    },
    {
      name: "Enterprise Neural",
      price: "$399",
      period: "/mes",
      description: "Red neuronal para corporaciones",
      features: [
        "Todo en Pro Quantum",
        "Usuarios ilimitados",
        "Multi-ubicaciones globales",
        "White label completo",
        "IA personalizada",
        "Consultoría estratégica",
        "SLA 99.99% garantizado",
        "Desarrollo custom"
      ],
      recommended: false,
      gradient: "from-purple-600 to-pink-600",
      textColor: "text-white"
    }
  ];

  const faqs = [
    {
      question: "¿Cómo funciona la IA predictiva de Axendar?",
      answer: "Nuestros algoritmos de machine learning analizan patrones históricos, comportamiento de clientes, tendencias estacionales y datos de mercado para predecir demanda, optimizar precios y sugerir horarios ideales. La IA se entrena continuamente con tus datos para mejorar las predicciones."
    },
    {
      question: "¿Qué significa 'sincronización cuántica' en términos prácticos?",
      answer: "Es nuestra tecnología propietaria que sincroniza datos entre múltiples plataformas en menos de 50ms, eliminando conflictos de horarios y garantizando consistencia absoluta entre calendarios, CRMs, sistemas de pago y aplicaciones conectadas."
    },
    {
      question: "¿Cómo garantizan un ROI del 2000%?",
      answer: "Nuestros clientes ven resultados medibles: optimización de precios (+40% ingresos), reducción de ausencias (95% menos), automatización (40h/semana ahorradas), y upselling automático. Ofrecemos garantía de resultados con métricas transparentes."
    },
    {
      question: "¿Qué incluye la seguridad blockchain?",
      answer: "Implementamos encriptación de grado militar, respaldos distribuidos en blockchain, autenticación biométrica opcional, y cumplimiento GDPR/CCPA. Tus datos están protegidos con la misma tecnología que usan los bancos centrales."
    },
    {
      question: "¿Puedo personalizar la IA para mi industria específica?",
      answer: "Absolutamente. En el plan Enterprise Neural, entrenamos modelos de IA específicos para tu sector (salud, belleza, consultoría, etc.) usando datasets especializados y parámetros optimizados para tu tipo de negocio."
    },
    {
      question: "¿Cómo funciona la integración con 500+ aplicaciones?",
      answer: "Nuestra API híper-conectada usa webhooks inteligentes, conectores nativos y adaptadores automáticos. Se integra con Zapier, Make, CRMs, ERPs, sistemas de pago, calendarios y herramientas de marketing sin código."
    },
    {
      question: "¿Qué soporte técnico incluye cada plan?",
      answer: "Starter: Chat 24/7. Pro Quantum: Chat + videollamadas + manager dedicado. Enterprise Neural: Todo lo anterior + consultoría estratégica + desarrollo personalizado + SLA garantizado del 99.99%."
    },
    {
      question: "¿Puedo migrar mis datos actuales automáticamente?",
      answer: "Sí, nuestro sistema de migración automática transfiere datos desde cualquier plataforma (Google Calendar, Calendly, Acuity, etc.) en menos de 24 horas, manteniendo historial completo y configuraciones personalizadas."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(51, 139, 133, 0.15), transparent 40%)`
          }}
        ></div>
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(51, 139, 133, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(51, 139, 133, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}></div>
        </div>
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#5DC1B9] rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* Floating Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#338B85]/20 to-[#5DC1B9]/20 border border-[#338B85]/30 text-[#5DC1B9] text-sm font-medium mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              IA Cuántica • +50,000 empresas transformadas
              <Zap className="w-4 h-4 ml-2 animate-bounce" />
            </div>
            
            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-[#5DC1B9] to-[#338B85] bg-clip-text text-transparent animate-pulse">
                AXENDAR
              </span>
              <br />
              <span className="text-4xl md:text-6xl bg-gradient-to-r from-[#5DC1B9] to-white bg-clip-text text-transparent">
                Reservas del Futuro
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              <span className="text-[#5DC1B9] font-semibold">Inteligencia Artificial Cuántica</span> que revoluciona tu negocio.
              <br />
              Automatización neuronal, predicciones precisas, y crecimiento exponencial garantizado.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button className="group relative w-full sm:w-auto bg-gradient-to-r from-[#338B85] to-[#5DC1B9] hover:from-[#5DC1B9] hover:to-[#338B85] text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-[#5DC1B9]/25 overflow-hidden">
                <span className="relative z-10 flex items-center">
                  <Play className="w-5 h-5 mr-2" />
                  Activar IA Gratis
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button className="group w-full sm:w-auto border-2 border-[#338B85] text-[#338B85] hover:bg-[#338B85] hover:text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 backdrop-blur-sm hover:backdrop-blur-none">
                <span className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Ver Demo Interactiva
                </span>
              </button>
            </div>
            
            {/* Hero Dashboard Mockup */}
            <div className="relative max-w-6xl mx-auto perspective-1000">
              <div className="transform rotate-x-12 hover:rotate-x-0 transition-transform duration-700">
                <div className="bg-gradient-to-br from-gray-900/90 to-black/90 rounded-3xl p-8 border border-[#338B85]/30 shadow-2xl backdrop-blur-xl">
                  {/* Dashboard Header */}
                  <div className="bg-gradient-to-r from-[#338B85] to-[#5DC1B9] rounded-2xl p-6 text-white mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold flex items-center">
                        <Cpu className="w-6 h-6 mr-2 animate-spin" />
                        Neural Dashboard
                      </h3>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                        <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                      </div>
                    </div>
                    
                    {/* Real-time Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="text-3xl font-black text-green-300 animate-pulse">2,847</div>
                        <div className="text-white/80">Reservas IA</div>
                        <div className="text-green-300 text-xs">+340% vs mes anterior</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="text-3xl font-black text-blue-300 animate-pulse">98.7%</div>
                        <div className="text-white/80">Precisión IA</div>
                        <div className="text-blue-300 text-xs">Predicciones cuánticas</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="text-3xl font-black text-purple-300 animate-pulse">$89,450</div>
                        <div className="text-white/80">Ingresos Auto</div>
                        <div className="text-purple-300 text-xs">Optimización neuronal</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="text-3xl font-black text-orange-300 animate-pulse">47.2h</div>
                        <div className="text-white/80">Tiempo Ahorrado</div>
                        <div className="text-orange-300 text-xs">Automatización total</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Visualization */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/30">
                      <h4 className="text-lg font-semibold text-purple-300 mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2 animate-pulse" />
                        IA Predictiva en Vivo
                      </h4>
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: `${i * 0.2}s`}}></div>
                            <div className="flex-1 bg-gray-700/50 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse"
                                style={{width: `${60 + Math.random() * 40}%`, animationDelay: `${i * 0.3}s`}}
                              ></div>
                            </div>
                            <span className="text-xs text-purple-300">{85 + Math.floor(Math.random() * 15)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-xl p-6 border border-blue-500/30">
                      <h4 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
                        <Globe className="w-5 h-5 mr-2 animate-spin" />
                        Sincronización Cuántica
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[...Array(9)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg animate-pulse"
                            style={{animationDelay: `${i * 0.1}s`}}
                          ></div>
                        ))}
                      </div>
                      <div className="mt-4 text-center">
                        <span className="text-cyan-300 text-sm font-semibold">
                          <span className="animate-pulse">●</span> Conectado a 500+ apps
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-[#5DC1B9] to-white bg-clip-text text-transparent">
                Tecnología del Futuro
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Cada función está potenciada por IA avanzada y tecnología cuántica para resultados extraordinarios
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl p-8 border border-gray-700/50 hover:border-[#338B85]/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 backdrop-blur-xl"
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
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#5DC1B9] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
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
      <section className="relative z-10 py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-white to-[#5DC1B9] bg-clip-text text-transparent">
                Resultados Cuantificables
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Métricas reales de empresas que ya transformaron su negocio con Axendar
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="group relative bg-gradient-to-br from-gray-900/80 to-black/80 rounded-2xl p-8 border border-gray-700/50 hover:border-[#338B85]/50 transition-all duration-500 backdrop-blur-xl overflow-hidden"
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#338B85]/5 to-[#5DC1B9]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className={`text-6xl font-black ${benefit.color} animate-pulse`}>
                      {benefit.metric}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#5DC1B9] transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
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
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-[#5DC1B9] to-white bg-clip-text text-transparent">
                Planes Evolutivos
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Cada plan incluye IA avanzada. Escala según tu crecimiento exponencial.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 ${
                  plan.recommended 
                    ? 'bg-gradient-to-br from-[#338B85] to-[#5DC1B9] shadow-2xl shadow-[#5DC1B9]/25 scale-110 z-10' 
                    : 'bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-700/50 hover:border-[#338B85]/50 backdrop-blur-xl'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-3 rounded-full text-sm font-black flex items-center">
                      <Star className="w-4 h-4 mr-2 animate-spin" />
                      MÁS POPULAR
                      <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className={`text-3xl font-black mb-2 ${plan.recommended ? 'text-white' : 'text-white'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className={`text-6xl font-black ${plan.recommended ? 'text-white' : 'text-[#5DC1B9]'}`}>
                      {plan.price}
                    </span>
                    <span className={`ml-2 ${plan.recommended ? 'text-white/80' : 'text-gray-400'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`${plan.recommended ? 'text-white/90' : 'text-gray-400'}`}>
                    {plan.description}
                  </p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className={`w-5 h-5 mr-3 flex-shrink-0 ${plan.recommended ? 'text-white' : 'text-[#5DC1B9]'}`} />
                      <span className={`${plan.recommended ? 'text-white/90' : 'text-gray-300'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  plan.recommended 
                    ? 'bg-white text-[#338B85] hover:bg-gray-100 shadow-lg hover:shadow-xl' 
                    : 'bg-gradient-to-r from-[#338B85] to-[#5DC1B9] text-white hover:from-[#5DC1B9] hover:to-[#338B85] shadow-lg hover:shadow-[#5DC1B9]/25'
                }`}>
                  {plan.recommended ? 'Activar IA Ahora' : 'Comenzar Evolución'}
                </button>
                
                {plan.recommended && (
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center text-sm text-white/80">
                      <Shield className="w-4 h-4 mr-2" />
                      Garantía de resultados 30 días
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-white to-[#5DC1B9] bg-clip-text text-transparent">
                FAQ Técnico
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Respuestas sobre nuestra tecnología avanzada
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-700/50 rounded-2xl overflow-hidden backdrop-blur-xl hover:border-[#338B85]/50 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-[#338B85]/10 transition-colors duration-300"
                >
                  <span className="text-lg font-bold text-white pr-4">{faq.question}</span>
                  <div className="flex-shrink-0">
                    {openFaq === index ? (
                      <ChevronUp className="w-6 h-6 text-[#5DC1B9] animate-bounce" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-[#5DC1B9] transition-colors duration-300" />
                    )}
                  </div>
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-6 animate-fadeIn">
                    <div className="border-t border-gray-700/50 pt-6">
                      <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-br from-[#215956] to-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#5DC1B9] to-[#338B85] rounded-2xl flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-black text-white">AXENDAR</span>
              </div>
              <p className="text-gray-300 mb-8 max-w-md leading-relaxed">
                La plataforma de reservas más avanzada del planeta. Potenciada por IA cuántica 
                para resultados extraordinarios y crecimiento exponencial garantizado.
              </p>
              <div className="flex space-x-4">
                {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                  <a 
                    key={i}
                    href="#" 
                    className="w-12 h-12 bg-gradient-to-br from-[#338B85] to-[#5DC1B9] rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
                  >
                    <Icon className="w-5 h-5 text-white group-hover:animate-pulse" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-bold text-white mb-6">Tecnología</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-[#5DC1B9] transition-colors duration-200 flex items-center"><Cpu className="w-4 h-4 mr-2" />IA Cuántica</a></li>
                <li><a href="#" className="hover:text-[#5DC1B9] transition-colors duration-200 flex items-center"><Zap className="w-4 h-4 mr-2" />Automatización</a></li>
                <li><a href="#" className="hover:text-[#5DC1B9] transition-colors duration-200 flex items-center"><Globe className="w-4 h-4 mr-2" />API Híbrida</a></li>
                <li><a href="#" className="hover:text-[#5DC1B9] transition-colors duration-200 flex items-center"><Lock className="w-4 h-4 mr-2" />Blockchain</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-bold text-white mb-6">Soporte Neural</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-[#5DC1B9] transition-colors duration-200">Centro IA</a></li>
                <li><a href="#" className="hover:text-[#5DC1B9] transition-colors duration-200">Chat Cuántico 24/7</a></li>
                <li><a href="#" className="hover:text-[#5DC1B9] transition-colors duration-200">Academia Neural</a></li>
                <li><a href="#" className="hover:text-[#5DC1B9] transition-colors duration-200">Status Tiempo Real</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#338B85]/30 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-8 mb-6 md:mb-0 text-gray-300">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-[#5DC1B9]" />
                  <span>neural@axendar.ai</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-[#5DC1B9]" />
                  <span>+1 (555) QUANTUM</span>
                </div>
              </div>
              <div className="flex space-x-8 text-sm text-gray-400">
                <a href="#" className="hover:text-[#5DC1B9] transition-colors duration-200">Privacidad Cuántica</a>
                <a href="#" className="hover:text-[#5DC1B9] transition-colors duration-200">Términos IA</a>
                <a href="#" className="hover:text-[#5DC1B9] transition-colors duration-200">Cookies Neurales</a>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                © 2024 AXENDAR AI SYSTEMS. Tecnología Cuántica Patentada. 
                <span className="text-[#5DC1B9]"> Transformando el futuro de los negocios.</span>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .rotate-x-12 {
          transform: rotateX(12deg);
        }
        
        .rotate-x-0 {
          transform: rotateX(0deg);
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Landing2;