# 📖 Documentación Técnica del Sistema - Aprende Jugando

Esta documentación proporciona información técnica detallada sobre la arquitectura, APIs, y funcionalidades del sistema.

---

## 📑 Tabla de Contenidos

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Roles y Permisos](#roles-y-permisos)
3. [API Endpoints](#api-endpoints)
4. [Sistema de Diagnósticos](#sistema-de-diagnósticos)
5. [Sistema de Respaldos](#sistema-de-respaldos)
6. [Sistema de Alertas](#sistema-de-alertas)
7. [Base de Datos](#base-de-datos)
8. [Autenticación y Seguridad](#autenticación-y-seguridad)

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

**Backend:**
- Node.js v16+
- Express.js - Framework web
- MySQL2 - Driver de base de datos
- JWT - Autenticación basada en tokens
- Nodemailer - Envío de emails (recuperación de contraseñas)
- Bcrypt - Hash de contraseñas
- Multer - Carga de archivos (logos, avatares)

**Frontend:**
- React 18
- Vite - Build tool
- React Router v6 - Navegación
- Axios - Cliente HTTP
- CSS Modules - Estilos

**Base de Datos:**
- MySQL 8.0+
- InnoDB engine
- Charset: utf8mb4

### Estructura de Directorios

```
aprende-jugando/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── routes/           # Definición de rutas
│   │   ├── middlewares/      # Autenticación, validación
│   │   ├── utils/            # Utilidades (email, logging)
│   │   ├── db.js             # Configuración de MySQL
│   │   └── index.js          # Punto de entrada
│   ├── database/
│   │   └── SCHEMA_COMPLETO.sql
│   ├── backups/              # Respaldos de BD
│   ├── uploads/              # Archivos subidos
│   └── .env                  # Variables de entorno
└── frontend/
    ├── src/
    │   ├── components/       # Componentes reutilizables
    │   ├── pages/            # Páginas por rol
    │   ├── services/         # APIs y servicios
    │   ├── layouts/          # Layouts (Admin, GM, Student)
    │   └── styles/           # CSS por componente
    └── public/
```

---

## 👥 Roles y Permisos

El sistema implementa 3 roles principales:

### 1. Admin (Administrador)
**Permisos:**
- Gestión completa de usuarios (crear, editar, eliminar, activar/desactivar)
- Gestión de cursos e instituciones
- Acceso a estadísticas avanzadas del sistema
- Configuración del sistema (políticas, autenticación, respaldos)
- Ejecución de diagnósticos del sistema
- Generación y programación de respaldos
- Gestión de roles personalizados
- Ver todas las misiones del sistema
- Centro de notificaciones completo

**Rutas Backend:**
- `/api/admin/*` - Todas las rutas de administración

**Rutas Frontend:**
- `/admin/inicio` - Dashboard principal
- `/admin/usuarios` - Gestión de usuarios
- `/admin/cursos` - Gestión de cursos
- `/admin/estadisticas` - Estadísticas avanzadas
- `/admin/configuracion` - Configuración del sistema
- `/admin/notificaciones` - Centro de notificaciones

### 2. GM (Game Master / Profesor)
**Permisos:**
- Crear y gestionar misiones educativas
- Evaluar entregas de estudiantes
- Asignar calificaciones y retroalimentación
- Ver progreso de estudiantes en sus misiones
- Gestión de sus propios cursos
- Notificaciones de entregas pendientes

**Rutas Backend:**
- `/api/gm/*` - Rutas de Game Master

**Rutas Frontend:**
- `/gm/inicio` - Dashboard del profesor
- `/gm/misiones` - Gestión de misiones
- `/gm/misiones/:id` - Editar misión
- `/gm/evaluar/:id` - Evaluar entregas
- `/gm/notificaciones` - Notificaciones

### 3. Estudiante
**Permisos:**
- Ver misiones disponibles
- Inscribirse en misiones
- Subir entregas y evidencias
- Ver retroalimentación y calificaciones
- Ver su progreso y logros
- Actualizar su perfil

**Rutas Backend:**
- `/api/estudiante/*` - Rutas de estudiante

**Rutas Frontend:**
- `/estudiante/inicio` - Dashboard del estudiante
- `/estudiante/misiones` - Misiones disponibles
- `/estudiante/misiones/:id` - Detalle de misión
- `/estudiante/perfil` - Perfil del estudiante
- `/estudiante/logros` - Logros obtenidos

---

## 🔌 API Endpoints

### Autenticación

#### POST `/api/auth/login`
Login de usuario.

**Request Body:**
```json
{
  "email": "admin@test.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "rut": "11.111.111-1",
    "nombre": "Administrador",
    "email": "admin@test.com",
    "rol": "admin"
  }
}
```

#### POST `/api/auth/forgot-password`
Solicitar recuperación de contraseña.

**Request Body:**
```json
{
  "email": "usuario@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Si existe una cuenta con ese email, recibirás instrucciones"
}
```

#### POST `/api/auth/reset-password/:token`
Restablecer contraseña con token.

**Request Body:**
```json
{
  "password": "NuevaPassword123!"
}
```

---

### Admin - Dashboard

#### GET `/api/admin/dashboard/estadisticas`
Obtener estadísticas del dashboard.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "usuarios": 150,
    "instituciones": 8,
    "misionesTotales": 45,
    "misionesCompletadas": 68,
    "estudiantesActivos": 82
  }
}
```

#### GET `/api/admin/dashboard/estado-sistema`
Obtener estado del sistema y alertas.

**Response:**
```json
{
  "success": true,
  "data": {
    "baseDatos": "Operativa",
    "respaldos": "Hace 2 días",
    "respaldoAutomatico": true,
    "frecuenciaRespaldo": "diaria",
    "tamanoBackup": "12.5 MB",
    "tamanoBaseDatos": "45.23 MB",
    "usuariosActivos7Dias": 42,
    "totalUsuarios": 150,
    "alertas": [
      {
        "tipo": "warning",
        "mensaje": "El último respaldo fue hace 8 días",
        "icono": "backup"
      }
    ]
  }
}
```

#### GET `/api/admin/dashboard/actividad?limit=10`
Obtener registro de actividad del sistema.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fecha": "2025-12-06",
      "titulo": "Respaldo de base de datos generado",
      "usuario": "Admin",
      "hora": "14:30:00",
      "tipo": "sistema"
    }
  ]
}
```

---

### Admin - Configuración

#### GET `/api/admin/configuracion`
Obtener toda la configuración del sistema.

**Response:**
```json
{
  "success": true,
  "data": {
    "nombreSistema": "Aprende Jugando",
    "tema": "light",
    "tiempoInactividad": 30,
    "zonaHoraria": "America/Santiago",
    "logoUrl": "/uploads/logos/logo.png",
    "politicasPassword": {
      "longitudMinima": 8,
      "requiereNumeros": true,
      "requiereMayusculas": true,
      "requiereSimbolos": true,
      "expiracionDias": 90
    },
    "autenticacion": {
      "maxIntentosLogin": 5,
      "tiempoBloqueo": 15,
      "permitirSesionesMultiples": false
    },
    "respaldoAutomatico": true,
    "frecuenciaRespaldo": "diaria",
    "ultimoRespaldo": "2025-12-06 14:30:00",
    "tamanoBackup": "12.5 MB"
  }
}
```

#### POST `/api/admin/configuracion/respaldo`
Generar respaldo manual de la base de datos.

**Response:**
```json
{
  "success": true,
  "message": "Respaldo generado exitosamente",
  "nombreArchivo": "backup_2025-12-06_14-30-00.sql",
  "tamano": "12.5 MB"
}
```

#### PUT `/api/admin/configuracion/respaldo-automatico`
Actualizar configuración de respaldo automático.

**Request Body:**
```json
{
  "respaldoAutomatico": true,
  "frecuenciaRespaldo": "semanal"
}
```

#### POST `/api/admin/configuracion/diagnostico`
Ejecutar diagnóstico completo del sistema.

**Response:**
```json
{
  "success": true,
  "estadoGeneral": "warning",
  "resultados": {
    "baseDatos": {
      "estado": "ok",
      "mensaje": "Base de datos operativa",
      "detalles": [
        { "tipo": "ok", "mensaje": "Conexión a base de datos: OK" },
        { "tipo": "ok", "mensaje": "Tamaño de BD: 45.23 MB" },
        { "tipo": "ok", "mensaje": "Tablas en la BD: 23" }
      ]
    },
    "rendimiento": {
      "estado": "ok",
      "mensaje": "Rendimiento del sistema óptimo",
      "detalles": [
        { "tipo": "ok", "mensaje": "Usuarios totales: 150" },
        { "tipo": "ok", "mensaje": "Usuarios activos (30d): 82 (54.7%)" },
        { "tipo": "ok", "mensaje": "Misiones creadas: 45" },
        { "tipo": "ok", "mensaje": "Misiones en progreso: 128" }
      ]
    },
    "mantenimiento": {
      "estado": "warning",
      "mensaje": "Se recomienda mantenimiento",
      "detalles": [
        { "tipo": "warning", "mensaje": "125 logs antiguos (>90 días) - Considerar limpieza" },
        { "tipo": "info", "mensaje": "8 cuentas inactivas (>6 meses)" },
        { "tipo": "ok", "mensaje": "No hay misiones inactivas" }
      ]
    },
    "seguridad": {
      "estado": "ok",
      "mensaje": "Seguridad y respaldos configurados correctamente",
      "detalles": [
        { "tipo": "ok", "mensaje": "Último respaldo hace 2 día(s)" },
        { "tipo": "ok", "mensaje": "Respaldo automático: Activo (diaria)" },
        { "tipo": "ok", "mensaje": "Administradores: 3" }
      ]
    }
  }
}
```

---

### Admin - Usuarios

#### GET `/api/admin/usuarios`
Obtener todos los usuarios.

**Query Params:**
- `rol` (opcional): Filtrar por rol (admin, gm, estudiante)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rut": "11.111.111-1",
      "nombre": "Admin User",
      "email": "admin@test.com",
      "rol": "admin",
      "institucion": null,
      "activo": true,
      "ultimo_acceso": "2025-12-06 14:30:00"
    }
  ]
}
```

---

### Game Master - Misiones

#### GET `/api/gm/misiones`
Obtener todas las misiones del GM.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Suma de Números",
      "descripcion": "Aprende a sumar números del 1 al 10",
      "tipo": "ejercicio",
      "dificultad": "facil",
      "xp_recompensa": 50,
      "estado": "activa",
      "estudiantes_inscritos": 12,
      "entregas_pendientes": 3
    }
  ]
}
```

#### POST `/api/gm/misiones`
Crear nueva misión.

**Request Body:**
```json
{
  "titulo": "Nueva Misión",
  "descripcion": "Descripción completa",
  "tipo": "ejercicio",
  "dificultad": "media",
  "xp_recompensa": 100,
  "curso_id": 1,
  "fecha_limite": "2025-12-31"
}
```

---

### Estudiante - Misiones

#### GET `/api/estudiante/misiones`
Obtener misiones disponibles para el estudiante.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Suma de Números",
      "descripcion": "Aprende a sumar números del 1 al 10",
      "tipo": "ejercicio",
      "dificultad": "facil",
      "xp_recompensa": 50,
      "progreso": 75,
      "estado": "En progreso",
      "calificacion": null
    }
  ]
}
```

#### POST `/api/estudiante/misiones/:id/inscribir`
Inscribirse en una misión.

#### POST `/api/estudiante/misiones/:id/entregar`
Subir entrega de una misión.

**Request Body:**
```json
{
  "descripcion_entrega": "He completado todos los ejercicios",
  "archivo_url": "/uploads/entregas/archivo.pdf"
}
```

---

## 🔍 Sistema de Diagnósticos

El sistema de diagnósticos analiza 4 áreas principales:

### 1. Base de Datos
- **Conexión**: Verifica que la conexión a MySQL esté activa
- **Tamaño**: Mide el tamaño total de la base de datos
- **Tablas**: Cuenta el número de tablas en el esquema
- **Alerta**: Si la BD supera 500 MB

**Implementación:** `backend/src/controllers/admin.configuracion.controller.js:542-585`

### 2. Rendimiento
- **Usuarios totales**: Cuenta todos los usuarios registrados
- **Usuarios activos**: Usuarios con acceso en los últimos 30 días
- **Porcentaje de actividad**: Calcula el % de usuarios activos
- **Misiones**: Total de misiones y misiones en progreso
- **Alerta**: Si menos del 20% de usuarios están activos

**Implementación:** `backend/src/controllers/admin.configuracion.controller.js:587-620`

### 3. Mantenimiento
- **Logs antiguos**: Detecta logs de más de 90 días
- **Cuentas inactivas**: Usuarios sin acceso en 6+ meses
- **Misiones sin uso**: Misiones de más de 1 año sin estudiantes
- **Alerta**: Recomienda limpieza si hay datos antiguos

**Implementación:** `backend/src/controllers/admin.configuracion.controller.js:622-685`

### 4. Seguridad
- **Estado de respaldos**: Verifica último respaldo y su antigüedad
- **Respaldo automático**: Verifica si está activado
- **Administradores**: Cuenta el número de admins
- **Alerta**: Si el último respaldo tiene más de 7 días

**Implementación:** `backend/src/controllers/admin.configuracion.controller.js:687-749`

### Estados de Diagnóstico

Cada categoría puede tener uno de 3 estados:
- **ok** (verde): Todo funciona correctamente
- **warning** (amarillo): Se recomienda atención
- **error** (rojo): Problema crítico

El sistema determina un **estado general** basado en el peor estado de las 4 categorías.

---

## 💾 Sistema de Respaldos

### Características

1. **Respaldo Manual**:
   - Genera archivo `.sql` con timestamp
   - Formato: `backup_YYYY-MM-DD_HH-MM-SS.sql`
   - Ubicación: `backend/backups/`
   - Limpieza automática (mantiene últimos 10)

2. **Respaldo Automático**:
   - Frecuencias: diaria, semanal, mensual
   - Configuración en tabla `configuracion_sistema`
   - Estado visible en dashboard

3. **Información Rastreada**:
   - Fecha/hora del último respaldo
   - Tamaño del archivo de respaldo
   - Frecuencia configurada
   - Estado activado/desactivado

### Requisitos Técnicos

**Windows:**
- `mysqldump.exe` debe estar instalado
- Rutas buscadas automáticamente:
  - WAMP: `D:\wamp64\bin\mysql\mysql8.0.27\bin\mysqldump.exe`
  - MySQL Server: `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe`
  - XAMPP: `C:\xampp\mysql\bin\mysqldump.exe`

**Linux/Mac:**
- `mysqldump` disponible en PATH

**Documentación Completa:** Ver `backend/backups/README.md`

### Implementación

**Controller:** `backend/src/controllers/admin.configuracion.controller.js`
- `generarRespaldo()` (líneas 216-355): Genera respaldo manual
- `actualizarRespaldoAutomatico()` (líneas 357-402): Configura respaldos automáticos

**Tabla en BD:**
```sql
configuracion_sistema:
  - respaldo_automatico (BOOLEAN)
  - frecuencia_respaldo (VARCHAR: 'diaria', 'semanal', 'mensual')
  - ultimo_respaldo (DATETIME)
  - tamano_backup (VARCHAR)
```

---

## 🚨 Sistema de Alertas

Las alertas se generan automáticamente en el dashboard de admin basándose en condiciones del sistema.

### Tipos de Alertas

1. **Error** (rojo):
   - No se ha generado ningún respaldo
   - Problemas críticos de base de datos

2. **Warning** (amarillo):
   - Último respaldo tiene más de 7 días
   - Base de datos muy grande (>500 MB)

3. **Info** (azul):
   - Respaldo automático desactivado
   - Baja actividad de usuarios (<10% activos en 7 días)

### Estructura de Alerta

```javascript
{
  tipo: 'warning',        // 'error', 'warning', 'info'
  mensaje: 'El último respaldo fue hace 8 días',
  icono: 'backup'         // 'backup', 'database', 'users', 'info'
}
```

### Iconos Disponibles

- **backup**: Alertas de respaldo
- **database**: Alertas de base de datos
- **users**: Alertas de usuarios
- **info**: Información general

**Implementación:** `backend/src/controllers/admin.dashboard.controller.js:145-194`

---

## 🗄️ Base de Datos

### Tablas Principales

#### usuarios
Almacena todos los usuarios del sistema.

```sql
CREATE TABLE usuarios (
  rut VARCHAR(12) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'gm', 'estudiante') NOT NULL,
  institucion VARCHAR(100),
  fecha_nacimiento DATE,
  avatar_url VARCHAR(255),
  xp_total INT DEFAULT 0,
  nivel INT DEFAULT 1,
  activo BOOLEAN DEFAULT TRUE,
  ultimo_acceso DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### configuracion_sistema
Configuración global del sistema.

```sql
CREATE TABLE configuracion_sistema (
  id INT PRIMARY KEY,
  nombre_sistema VARCHAR(100) DEFAULT 'Aprende Jugando',
  tema VARCHAR(20) DEFAULT 'light',
  tiempo_inactividad INT DEFAULT 30,
  zona_horaria VARCHAR(50) DEFAULT 'America/Santiago',
  logo_url VARCHAR(255),
  politicas_password JSON,
  autenticacion JSON,
  respaldo_automatico BOOLEAN DEFAULT FALSE,
  frecuencia_respaldo ENUM('diaria', 'semanal', 'mensual') DEFAULT 'diaria',
  ultimo_respaldo DATETIME,
  tamano_backup VARCHAR(20)
);
```

#### actividad_admin
Registro de actividad del sistema.

```sql
CREATE TABLE actividad_admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  usuario VARCHAR(100) NOT NULL,
  hora TIME NOT NULL,
  tipo ENUM('sistema', 'configuracion', 'usuario', 'mision') DEFAULT 'sistema',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### password_reset_tokens
Tokens para recuperación de contraseñas.

```sql
CREATE TABLE password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_rut VARCHAR(12) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_rut) REFERENCES usuarios(rut) ON DELETE CASCADE
);
```

### Relaciones Principales

```
usuarios
  ├─> cursos (gm_rut)
  ├─> misiones (creador_rut)
  ├─> estudiante_misiones (estudiante_rut)
  ├─> notificaciones (usuario_rut)
  └─> password_reset_tokens (usuario_rut)

cursos
  ├─> misiones (curso_id)
  └─> estudiante_cursos (curso_id)

misiones
  └─> estudiante_misiones (mision_id)
```

---

## 🔐 Autenticación y Seguridad

### JWT (JSON Web Tokens)

**Generación de Token:**
```javascript
const token = jwt.sign(
  { rut: usuario.rut, rol: usuario.rol },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

**Middleware de Verificación:**
```javascript
// backend/src/middlewares/auth.middleware.js
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
```

**Middleware de Roles:**
```javascript
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
  };
};
```

### Hash de Contraseñas

**Generación:**
```javascript
const bcrypt = require('bcrypt');
const passwordHash = await bcrypt.hash(password, 10);
```

**Verificación:**
```javascript
const esValida = await bcrypt.compare(password, usuario.password_hash);
```

### Políticas de Contraseñas

Configurables desde el panel de admin:
- Longitud mínima (default: 8)
- Requiere números (default: true)
- Requiere mayúsculas (default: true)
- Requiere símbolos (default: true)
- Expiración en días (default: 90)

**Validación en Frontend:**
```javascript
const validarPassword = (password) => {
  const requisitos = {
    longitudMinima: password.length >= 8,
    tieneNumero: /[0-9]/.test(password),
    tieneMayuscula: /[A-Z]/.test(password),
    tieneSimbolo: /[!@#$%^&*()_\-+={}[\]:;"'<>,.?/~`]/.test(password)
  };
  return Object.values(requisitos).every(Boolean);
};
```

### CORS

Configurado en `backend/src/index.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## 📧 Sistema de Emails

### Configuración (Nodemailer + Gmail)

```javascript
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD  // App Password, no contraseña normal
  }
});
```

### Recuperación de Contraseñas

**Flujo:**
1. Usuario solicita recuperación (`/api/auth/forgot-password`)
2. Sistema genera token único y lo guarda en BD
3. Email enviado con link: `http://localhost:3000/restablecer-contrasena/{token}`
4. Usuario hace clic y establece nueva contraseña
5. Token se marca como usado

**Token:**
- Generado con `crypto.randomBytes(32)`
- Expira en 1 hora
- Uso único (campo `used` en BD)

---

## 🛠️ Utilidades del Sistema

### Logger de Actividad

**Ubicación:** `backend/src/utils/actividadLogger.js`

```javascript
const registrarActividad = async (titulo, usuario, tipo = 'sistema') => {
  const fecha = new Date();
  await pool.query(
    'INSERT INTO actividad_admin (fecha, titulo, usuario, hora, tipo) VALUES (?, ?, ?, ?, ?)',
    [fecha.toISOString().split('T')[0], titulo, usuario, fecha.toTimeString().split(' ')[0], tipo]
  );
};
```

**Uso:**
```javascript
await registrarActividad(
  'Respaldo de base de datos generado',
  'Admin',
  'sistema'
);
```

---

## 📊 Frontend - Servicios

### API Service

**Ubicación:** `frontend/src/services/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Admin Service

**Ubicación:** `frontend/src/services/adminService.js`

```javascript
import api from './api';

const adminService = {
  getEstadisticasDashboard: async () => {
    const response = await api.get('/admin/dashboard/estadisticas');
    return response.data;
  },

  ejecutarDiagnostico: async () => {
    const response = await api.post('/admin/configuracion/diagnostico');
    return response.data;
  },

  generarRespaldo: async () => {
    const response = await api.post('/admin/configuracion/respaldo');
    return response.data;
  }
};

export default adminService;
```

---

## 🎨 Guía de Estilos CSS

### Convenciones de Nomenclatura

- **BEM (Block Element Modifier)**: `bloque__elemento--modificador`
- Prefijos por componente: `admin-`, `gm-`, `estudiante-`

**Ejemplos:**
```css
.admin-dashboard { }                  /* Bloque */
.admin-dashboard__header { }          /* Elemento */
.admin-dashboard__header--active { }  /* Modificador */
```

### Colores del Sistema

```css
:root {
  --primary: #6366f1;      /* Indigo */
  --success: #22c55e;      /* Verde */
  --warning: #fbbf24;      /* Amarillo */
  --error: #ef4444;        /* Rojo */
  --info: #3b82f6;         /* Azul */

  --bg-light: #f9fafb;
  --bg-dark: #1f2937;
  --text-light: #374151;
  --text-dark: #f9fafb;
}
```

---

## 🧪 Testing y Desarrollo

### Usuarios de Prueba

**Admin:**
- Email: `admin@test.com`
- Password: `password123`
- RUT: `11.111.111-1`

**Game Master:**
- Email: `gm@test.com`
- Password: `password123`
- RUT: `22.222.222-2`

**Estudiantes:**
- Email: `estudiante@test.com`, `estudiante2@test.com`, `estudiante3@test.com`
- Password: `password123`

### Scripts Útiles

**Backend:**
```bash
npm run dev      # Desarrollo con nodemon
npm start        # Producción
```

**Frontend:**
```bash
npm run dev      # Desarrollo con Vite
npm run build    # Build para producción
npm run preview  # Preview del build
```

---

## 🔄 Flujos de Trabajo Principales

### Flujo de Login

1. Usuario ingresa email y password
2. Frontend envía POST a `/api/auth/login`
3. Backend valida credenciales
4. Backend genera JWT token
5. Frontend guarda token en localStorage
6. Frontend redirige según rol:
   - Admin → `/admin/inicio`
   - GM → `/gm/inicio`
   - Estudiante → `/estudiante/inicio`

### Flujo de Creación de Misión (GM)

1. GM accede a `/gm/misiones`
2. Click en "Crear Misión"
3. Completa formulario (título, descripción, tipo, dificultad, XP, curso, fecha límite)
4. Frontend envía POST a `/api/gm/misiones`
5. Backend valida y crea misión en BD
6. Frontend muestra mensaje de éxito
7. Lista de misiones se actualiza

### Flujo de Inscripción en Misión (Estudiante)

1. Estudiante ve misiones disponibles en `/estudiante/misiones`
2. Click en "Inscribirse" en una misión
3. Frontend envía POST a `/api/estudiante/misiones/:id/inscribir`
4. Backend crea registro en `estudiante_misiones`
5. Estado cambia a "En progreso"
6. Estudiante puede ver detalles y subir entregas

### Flujo de Diagnóstico del Sistema

1. Admin accede a `/admin/configuracion`
2. Click en "Ejecutar Diagnóstico"
3. Frontend envía POST a `/api/admin/configuracion/diagnostico`
4. Backend ejecuta 4 análisis en paralelo:
   - Base de datos
   - Rendimiento
   - Mantenimiento
   - Seguridad
5. Backend determina estado general (ok/warning/error)
6. Frontend muestra modal con resultados categorizados
7. Actividad registrada en log del sistema

---

## 📈 Optimizaciones y Mejores Prácticas

### Backend

1. **Conexión a BD con Pool**: Reutilización de conexiones MySQL
2. **Bcrypt con Salt Rounds**: 10 rounds para balance seguridad/performance
3. **JWT con Expiración**: Tokens expiran en 24h
4. **Validación de Datos**: En controladores antes de queries
5. **Manejo de Errores**: Try-catch en todos los endpoints
6. **Logging**: Console.log con emojis para mejor legibilidad

### Frontend

1. **Lazy Loading**: Componentes cargados según necesidad
2. **localStorage para Token**: Persistencia de sesión
3. **Axios Interceptors**: Token automático en requests
4. **React Router v6**: Navegación optimizada
5. **CSS Modules**: Estilos aislados por componente
6. **Componentes Reutilizables**: DRY principle

---

## 🚀 Deployment (Producción)

### Checklist Pre-Deployment

- [ ] Cambiar `JWT_SECRET` a valor aleatorio y seguro
- [ ] Configurar CORS para dominio de producción
- [ ] Cambiar passwords de usuarios de prueba
- [ ] Configurar variables de entorno en servidor
- [ ] Usar HTTPS (certificado SSL)
- [ ] Configurar respaldos automáticos diarios
- [ ] Probar recuperación de contraseñas con email real
- [ ] Optimizar imágenes y assets
- [ ] Minificar y comprimir código frontend
- [ ] Configurar logs en producción
- [ ] Implementar rate limiting en API
- [ ] Configurar firewall y seguridad del servidor

---

**Última actualización:** Diciembre 2024
**Versión de la documentación:** 1.0
