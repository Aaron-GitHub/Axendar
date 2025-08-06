# Sistema SaaS de Gestión de Reservas y Facturación

Una aplicación web completa para gestionar reservas, clientes, profesionales y servicios con capacidades de proyección de facturación en tiempo real.

## 🚀 Características Principales

### ✅ Implementado
- **Sistema de Autenticación Completo**
  - Login seguro con email/contraseña
  - Registro de usuarios con validación
  - Recuperación de contraseña por email
  - Sesiones persistentes con JWT

- **Dashboard Interactivo**
  - Métricas de facturación en tiempo real
  - Gráficos de ingresos y tendencias
  - KPIs de ocupación y clientes activos
  - Resumen de reservas y estadísticas

- **Módulo de Reservas**
  - Calendario interactivo con múltiples vistas
  - Estados de reserva (pendiente, confirmada, completada, cancelada)
  - Formularios de creación y edición
  - Vista de lista y detalles completos

- **Gestión de Clientes**
  - CRUD completo para clientes
  - Búsqueda y filtrado avanzado
  - Exportación a CSV
  - Historial y estadísticas

### 🚧 En Desarrollo
- **Módulo de Profesionales** - Gestión de staff y especialidades
- **Módulo de Servicios** - Catálogo de servicios y precios
- **Panel de Administración** - Configuración empresarial

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS con paleta de colores personalizada
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth con JWT
- **Estado**: React Context + Hooks
- **Formularios**: React Hook Form + Yup
- **Gráficos**: Recharts
- **Calendario**: React Big Calendar
- **Iconos**: Lucide React
- **Notificaciones**: React Hot Toast

## 🎨 Diseño

### Paleta de Colores
- **Primario**: #338B85
- **Secundario**: #5DC1B9
- **Oscuro**: #215956
- **Blanco**: #fff
- **Negro**: #000

### Características de Diseño
- Diseño minimalista y profesional
- Responsive design (mobile-first)
- Tipografía clara con fuente Inter
- Componentes con bordes redondeados sutiles
- Sistema de espaciado consistente de 8px
- Iconografía coherente con Lucide React

## 📋 Requisitos Previos

- Node.js 18+ 
- Cuenta de Supabase
- Variables de entorno configuradas

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd reservation-system
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Supabase**
   - Crear un proyecto en [Supabase](https://supabase.com)
   - Configurar la base de datos con las migraciones incluidas
   - Obtener las claves de API

4. **Variables de entorno**
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

## 📊 Base de Datos

### Estructura de Tablas

1. **profiles** - Perfiles de usuario
2. **clients** - Información de clientes
3. **professionals** - Datos de profesionales
4. **services** - Catálogo de servicios
5. **reservations** - Gestión de reservas

### Migraciones SQL

Las migraciones están incluidas en el directorio `supabase/migrations/` y configuran:
- Tablas con relaciones apropiadas
- Row Level Security (RLS) habilitado
- Políticas de seguridad por usuario
- Índices para optimización

## 🔐 Seguridad

- **Autenticación**: JWT tokens con Supabase Auth
- **Autorización**: Row Level Security (RLS) en todas las tablas
- **Validación**: Formularios con validación en tiempo real
- **Sanitización**: Datos limpios en todas las operaciones CRUD

## 🌟 Funcionalidades Avanzadas

### Dashboard
- Métricas en tiempo real
- Gráficos interactivos
- Proyecciones de facturación
- KPIs empresariales

### Reservas
- Calendario con múltiples vistas
- Gestión de estados completa
- Integración con clientes y servicios
- Validaciones de horarios

### Clientes
- Búsqueda y filtrado avanzado
- Exportación de datos
- Historial de reservas
- Estadísticas de clientes

## 📱 Responsive Design

- **Mobile**: < 768px - Diseño optimizado para móviles
- **Tablet**: 768px - 1024px - Experiencia adaptada
- **Desktop**: > 1024px - Funcionalidad completa

## 🚀 Despliegue

### Frontend (Vercel/Netlify)
```bash
npm run build
```

### Variables de Producción
```env
VITE_SUPABASE_URL=tu_supabase_url_prod
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_prod
```

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] Módulo completo de Profesionales
- [ ] Módulo completo de Servicios  
- [ ] Panel de Administración avanzado
- [ ] Notificaciones en tiempo real
- [ ] Integración con sistemas de pago
- [ ] Reportes avanzados y analytics
- [ ] API REST para integraciones
- [ ] Aplicación móvil nativa

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@reservaspro.com
- Documentación: [docs.reservaspro.com](https://docs.reservaspro.com)
- Issues: GitHub Issues

---

**ReservasPro** - La solución completa para gestión de reservas empresariales 🚀