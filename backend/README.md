# API Backend - Aprende Jugando

Backend para el sistema de gamificación educativa "Aprende Jugando".

## 🚀 Tecnologías

- Node.js
- Express.js
- MySQL
- JWT para autenticación
- bcryptjs para encriptación de contraseñas

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/          # Controladores de la aplicación
│   │   ├── gm.cursos.controller.js
│   │   ├── gm.estudiantes.controller.js
│   │   ├── gm.evaluaciones.controller.js
│   │   └── gm.misiones.controller.js
│   ├── middlewares/          # Middlewares personalizados
│   │   └── auth.middleware.js
│   ├── routes/               # Definición de rutas
│   │   ├── auth.routes.js
│   │   ├── gm.cursos.routes.js
│   │   ├── gm.estudiantes.routes.js
│   │   ├── gm.evaluaciones.routes.js
│   │   └── gm.misiones.routes.js
│   ├── db.js                 # Configuración de base de datos
│   └── index.js              # Punto de entrada
├── database/
│   └── schema.sql            # Esquema de base de datos
├── .env                      # Variables de entorno
└── package.json
```

## 🔧 Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=aprende_jugando
DB_PORT=3306
JWT_SECRET=tu_secreto_jwt_muy_seguro
NODE_ENV=development
```

### 3. Crear base de datos

Ejecutar el script SQL ubicado en `database/schema.sql`:

```bash
mysql -u root -p < database/schema.sql
```

O importar manualmente desde tu cliente MySQL.

### 4. Iniciar servidor

**Modo desarrollo:**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará disponible en `http://localhost:4000`

## 📡 Endpoints de la API

### Autenticación

#### POST `/api/auth/login`
Iniciar sesión

**Body:**
```json
{
  "email": "gm@test.com",
  "password": "123456"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "token": "jwt_token_aqui",
  "usuario": {
    "id": 1,
    "nombre": "Profesor García",
    "email": "gm@test.com",
    "rol": "gm",
    "nivel": 1,
    "experiencia": 0
  }
}
```

#### POST `/api/auth/register`
Registrar nuevo usuario

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "rol": "estudiante"
}
```

---

### Misiones del GM

**Requiere autenticación:** Sí
**Rol permitido:** GM, Admin

#### GET `/api/gm/misiones`
Obtener todas las misiones del GM

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "misiones": [
    {
      "id": 1,
      "nombre": "Resolver ecuaciones de primer grado",
      "descripcion": "...",
      "dificultad": "Baja",
      "categoria": "Matemáticas",
      "xp_recompensa": 150,
      "estado": "activa",
      "fecha_inicio": "2025-01-01",
      "fecha_fin": "2025-01-31",
      "curso_nombre": "Matemáticas 5to Grado",
      "total_estudiantes": 25,
      "estudiantes_completados": 10
    }
  ]
}
```

#### GET `/api/gm/misiones/:id`
Obtener detalles de una misión específica

#### POST `/api/gm/misiones`
Crear una nueva misión

**Body:**
```json
{
  "nombre": "Nueva Misión",
  "descripcion": "Descripción de la misión",
  "objetivo": "Objetivo de aprendizaje",
  "dificultad": "Media",
  "categoria": "Matemáticas",
  "xp_recompensa": 200,
  "curso_id": 1,
  "fecha_inicio": "2025-01-15",
  "fecha_fin": "2025-02-15",
  "competencias": [
    "Competencia 1",
    "Competencia 2"
  ],
  "pistas": [
    "Pista 1",
    "Pista 2"
  ],
  "actividades": [
    {
      "titulo": "Actividad 1",
      "enunciado": "Texto del enunciado",
      "pregunta": "¿Pregunta?",
      "tipo_pregunta": "opcion_multiple",
      "respuesta_correcta": "2",
      "consejo": "Consejo útil",
      "opciones": [
        { "valor": "Opción 1", "es_correcta": false },
        { "valor": "Opción 2", "es_correcta": true },
        { "valor": "Opción 3", "es_correcta": false },
        { "valor": "Opción 4", "es_correcta": false }
      ]
    }
  ]
}
```

#### PUT `/api/gm/misiones/:id`
Actualizar una misión

#### DELETE `/api/gm/misiones/:id`
Eliminar una misión

---

### Evaluaciones del GM

**Requiere autenticación:** Sí
**Rol permitido:** GM, Admin

#### GET `/api/gm/evaluaciones`
Obtener todas las evaluaciones

**Query params (opcionales):**
- `estado`: filtrar por estado (`pendiente` o `evaluada`)

#### GET `/api/gm/evaluaciones/pendientes`
Obtener evaluaciones pendientes

#### GET `/api/gm/evaluaciones/:id`
Obtener detalles de una evaluación específica

#### PUT `/api/gm/evaluaciones/:id/evaluar`
Evaluar una misión

**Body:**
```json
{
  "calificacion": 85.5,
  "retroalimentacion": "Excelente trabajo, sigue así..."
}
```

#### GET `/api/gm/evaluaciones/estadisticas`
Obtener estadísticas de evaluaciones

---

### Estudiantes del GM

**Requiere autenticación:** Sí
**Rol permitido:** GM, Admin

#### GET `/api/gm/estudiantes`
Obtener todos los estudiantes

**Respuesta:**
```json
{
  "success": true,
  "estudiantes": [
    {
      "id": 1,
      "nombre": "Alejandra",
      "email": "estudiante@test.com",
      "nivel": 5,
      "experiencia": 1400,
      "cursos": "Matemáticas 5to Grado",
      "total_misiones": 10,
      "misiones_completadas": 5,
      "misiones_en_progreso": 3,
      "promedio_progreso": 75.5
    }
  ]
}
```

#### GET `/api/gm/estudiantes/:id`
Obtener detalles de un estudiante específico

#### GET `/api/gm/estudiantes/:estudianteId/misiones/:misionId`
Obtener progreso de un estudiante en una misión

#### GET `/api/gm/estudiantes/estadisticas`
Obtener estadísticas generales de estudiantes

---

### Cursos del GM

**Requiere autenticación:** Sí
**Rol permitido:** GM, Admin

#### GET `/api/gm/cursos`
Obtener todos los cursos

#### GET `/api/gm/cursos/:id`
Obtener detalles de un curso específico

#### POST `/api/gm/cursos`
Crear un nuevo curso

**Body:**
```json
{
  "nombre": "Matemáticas 6to Grado",
  "descripcion": "Curso de matemáticas avanzadas"
}
```

#### PUT `/api/gm/cursos/:id`
Actualizar un curso

#### DELETE `/api/gm/cursos/:id`
Eliminar un curso

#### POST `/api/gm/cursos/:id/estudiantes`
Agregar un estudiante al curso

**Body:**
```json
{
  "estudiante_id": 5
}
```

#### DELETE `/api/gm/cursos/:id/estudiantes/:estudianteId`
Eliminar un estudiante del curso

---

## 🔒 Autenticación

Todas las rutas protegidas requieren un token JWT en el header:

```
Authorization: Bearer {token}
```

El token se obtiene al hacer login y tiene una duración de 8 horas.

## 👥 Roles de Usuario

- **estudiante**: Acceso a sus propias misiones y progreso
- **gm** (Game Master): Gestión completa de cursos, misiones y evaluaciones
- **admin**: Acceso completo al sistema

## 🗄️ Base de Datos

El esquema de la base de datos incluye las siguientes tablas principales:

- `usuarios`: Información de usuarios (estudiantes, GMs, admins)
- `cursos`: Cursos creados por los GMs
- `curso_estudiantes`: Relación estudiantes-cursos
- `misiones`: Misiones educativas
- `actividades`: Actividades/ejercicios de las misiones
- `estudiante_misiones`: Progreso de estudiantes en misiones
- `evaluaciones`: Evaluaciones de GMs a estudiantes
- `logros`: Logros del sistema
- `personalizaciones`: Personalizaciones del avatar

## 📝 Usuarios de Prueba

El schema SQL incluye 3 usuarios de prueba (password123):

```
Estudiante:
- email: estudiante@test.com
- rol: estudiante

Game Master:
- email: gm@test.com
- rol: gm

Administrador:
- email: admin@test.com
- rol: admin
```

## 🐛 Manejo de Errores

Todas las respuestas de error siguen este formato:

```json
{
  "success": false,
  "message": "Descripción del error"
}
```

Códigos de estado HTTP:
- `200`: Éxito
- `201`: Recurso creado
- `400`: Error en la solicitud
- `401`: No autenticado
- `403`: No autorizado (sin permisos)
- `404`: Recurso no encontrado
- `500`: Error del servidor

## 🚀 Despliegue

Para despliegue en producción:

1. Configurar variables de entorno en el servidor
2. Asegurar que `NODE_ENV=production`
3. Configurar MySQL en el servidor
4. Importar el schema SQL
5. Ejecutar `npm install --production`
6. Iniciar con `npm start` o usar PM2

## 📄 Licencia

Este proyecto es parte del sistema educativo "Aprende Jugando".
