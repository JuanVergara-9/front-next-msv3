# MiServicio Frontend - Configuración

## 🚀 Configuración Rápida

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Ejecutar el Backend

En el directorio `backend`:

```bash
# Instalar dependencias del backend
npm install

# Ejecutar todos los servicios
npm run dev
```

### 4. Ejecutar el Frontend

```bash
npm run dev
```

## 🔧 Funcionalidades Implementadas

### ✅ Backend Conectado
- **Autenticación**: Login, registro, refresh tokens
- **Proveedores**: Búsqueda, filtros, geolocalización
- **Categorías**: Gestión de categorías de servicios
- **Reseñas**: Sistema de calificaciones
- **Contactos**: Intenciones de contacto

### ✅ Diseño Premium
- **Header**: Con logo, ubicación y botones de auth
- **Hero Section**: Cómo funciona con animaciones
- **Búsqueda**: Barra de búsqueda con efectos visuales
- **Tarjetas**: Diseño premium para proveedores
- **Navegación**: Bottom nav con glass effect
- **CTA**: Sección para registro de proveedores

### ✅ Funcionalidades
- **Geolocalización**: Detección automática de ubicación
- **Búsqueda en tiempo real**: Filtros por texto y categoría
- **Contacto directo**: WhatsApp, teléfono, email
- **Responsive**: Diseño adaptativo para móvil y desktop
- **Loading states**: Skeletons y estados de carga
- **Error handling**: Manejo de errores con reintentos

## 🎨 Características del Diseño

- **Glass Effect**: Efectos de cristal en header y navegación
- **Premium Shadows**: Sombras suaves y profesionales
- **Gradients**: Gradientes sutiles en botones y fondos
- **Animations**: Transiciones suaves y animaciones
- **Typography**: Tipografía balanceada y legible
- **Color Scheme**: Paleta azul profesional

## 🔗 Endpoints del Backend

- `GET /api/v1/providers` - Listar proveedores
- `GET /api/v1/categories` - Listar categorías
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrarse
- `GET /api/v1/geo/reverse` - Geocodificación inversa

## 📱 Próximos Pasos

1. **Autenticación**: Implementar páginas de login/registro
2. **Perfil de Proveedor**: Dashboard para gestionar perfil
3. **Reseñas**: Sistema completo de reseñas
4. **Notificaciones**: Push notifications
5. **Pagos**: Integración con sistema de pagos
6. **Admin Panel**: Panel de administración

## 🐛 Troubleshooting

### Error de Conexión
- Verifica que el backend esté ejecutándose en el puerto 4000
- Revisa la variable `NEXT_PUBLIC_API_BASE_URL`

### Error de Geolocalización
- Asegúrate de que el navegador tenga permisos de ubicación
- La app funcionará con ubicación por defecto si no se puede obtener

### Error de CORS
- El backend ya tiene CORS configurado para desarrollo
- En producción, configura los dominios permitidos
