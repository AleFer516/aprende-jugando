# API del Game Master - Documentación Completa

Esta documentación cubre todos los endpoints disponibles para el Game Master.

## 🔐 Autenticación

Todos los endpoints requieren:
- Header: `Authorization: Bearer {token}`
- Rol: `gm` o `admin`

---

## 📊 Dashboard

### GET `/api/gm/dashboard/resumen`
Obtiene el resumen completo del dashboard con todas las estadísticas.

**Respuesta:**
```json
{
  "success": true,
  "dashboard": {
    "estadisticas": {
      "estudiantesActivos": 35,
      "misionesAsignadas": 120,
      "misionesPorRevisar": 8,
      "horasAcumuladas": "4.2 h"
    },
    "misionesPorRevisar": [
      {
        "id": 1,
        "mision_id": 5,
        "estudiante": "Alejandra Fernández",
        "mision": "Resolver ecuaciones de primer grado",
        "fechaEntrega": "2025-01-15T10:30:00.000Z"
      }
    ],
    "estadoAvanceCursos": [
      {
        "id": 1,
        "nombre": "Curso A",
        "progreso": 68.5
      }
    ],
    "misionesRecientes": [
      {
        "id": 3,
        "nombre": "Problemas de fracciones",
        "fecha": "Hoy"
      }
    ],
    "indicadoresAvanzados": [
      {
        "id": 1,
        "nombre": "Progreso promedio por misión",
        "descripcion": "Visualiza el avance promedio de todas las misiones asignadas",
        "valor": "68%"
      }
    ]
  }
}
```

### GET `/api/gm/dashboard/estadisticas`
Obtiene solo las estadísticas principales del dashboard.

### GET `/api/gm/dashboard/misiones-revisar`
Obtiene la lista de misiones pendientes de revisar.

### GET `/api/gm/dashboard/avance-cursos`
Obtiene el progreso de cada curso.

### GET `/api/gm/dashboard/misiones-recientes`
Obtiene las últimas 5 misiones creadas.

### GET `/api/gm/dashboard/indicadores`
Obtiene los indicadores avanzados (progreso promedio, competitividad, horas semanales, etc.).

---

## 📝 Misiones

### GET `/api/gm/misiones`
Obtiene todas las misiones del GM.

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

### GET `/api/gm/misiones/:id`
Obtiene detalles completos de una misión (competencias, pistas, actividades, estadísticas).

### POST `/api/gm/misiones`
Crea una nueva misión.

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

### PUT `/api/gm/misiones/:id`
Actualiza una misión existente.

### DELETE `/api/gm/misiones/:id`
Elimina una misión.

---

## ✅ Evaluaciones

### GET `/api/gm/evaluaciones`
Obtiene todas las evaluaciones (con filtro opcional por estado).

**Query params:**
- `estado` (opcional): `pendiente` o `evaluada`

### GET `/api/gm/evaluaciones/pendientes`
Obtiene solo las evaluaciones pendientes.

### GET `/api/gm/evaluaciones/:id`
Obtiene detalles de una evaluación específica con las respuestas del estudiante.

**Respuesta:**
```json
{
  "success": true,
  "evaluacion": {
    "id": 1,
    "estudiante_id": 5,
    "estudiante_nombre": "Alejandra",
    "mision_id": 3,
    "mision_nombre": "Resolver ecuaciones",
    "calificacion": null,
    "retroalimentacion": null,
    "estado": "pendiente",
    "progreso": 100,
    "fecha_completado": "2025-01-15T14:30:00.000Z",
    "respuestas": [
      {
        "id": 10,
        "actividad_id": 5,
        "actividad_titulo": "Ecuaciones básicas",
        "pregunta": "¿Cuánto es x en 2x + 5 = 15?",
        "respuesta": "5",
        "respuesta_correcta": "5",
        "es_correcta": true,
        "intentos": 1,
        "tiempo_respuesta": 45
      }
    ]
  }
}
```

### PUT `/api/gm/evaluaciones/:id/evaluar`
Evalúa una misión asignando calificación y retroalimentación.

**Body:**
```json
{
  "calificacion": 85.5,
  "retroalimentacion": "Excelente trabajo. Puntos a mejorar: ..."
}
```

### GET `/api/gm/evaluaciones/estadisticas`
Obtiene estadísticas generales de evaluaciones.

---

## 👥 Estudiantes

### GET `/api/gm/estudiantes`
Obtiene todos los estudiantes de los cursos del GM.

**Respuesta:**
```json
{
  "success": true,
  "estudiantes": [
    {
      "id": 1,
      "nombre": "Alejandra",
      "email": "alejandra@example.com",
      "nivel": 5,
      "experiencia": 1400,
      "cursos": "Matemáticas 5to Grado,Ciencias 5to",
      "total_misiones": 10,
      "misiones_completadas": 5,
      "misiones_en_progreso": 3,
      "promedio_progreso": 75.5
    }
  ]
}
```

### GET `/api/gm/estudiantes/:id`
Obtiene detalles completos de un estudiante (cursos, misiones, logros, estadísticas).

**Respuesta:**
```json
{
  "success": true,
  "estudiante": {
    "id": 1,
    "nombre": "Alejandra",
    "email": "alejandra@example.com",
    "nivel": 5,
    "experiencia": 1400,
    "cursos": [
      {
        "id": 1,
        "nombre": "Matemáticas 5to Grado",
        "descripcion": "..."
      }
    ],
    "misiones": [
      {
        "id": 3,
        "nombre": "Resolver ecuaciones",
        "dificultad": "Baja",
        "estado": "Completada",
        "progreso": 100,
        "xp_ganado": 150
      }
    ],
    "logros": [
      {
        "id": 1,
        "nombre": "Primer Paso",
        "descripcion": "Completa tu primera misión",
        "fecha_desbloqueo": "2025-01-10T12:00:00.000Z"
      }
    ],
    "estadisticas": {
      "total_misiones": 10,
      "completadas": 5,
      "en_progreso": 3,
      "pendientes": 2,
      "xp_total_ganado": 750,
      "promedio_progreso": 75.5
    }
  }
}
```

### GET `/api/gm/estudiantes/:estudianteId/misiones/:misionId`
Obtiene el progreso detallado de un estudiante en una misión específica.

### GET `/api/gm/estudiantes/estadisticas`
Obtiene estadísticas generales de todos los estudiantes.

---

## 📚 Cursos

### GET `/api/gm/cursos`
Obtiene todos los cursos del GM.

**Respuesta:**
```json
{
  "success": true,
  "cursos": [
    {
      "id": 1,
      "nombre": "Matemáticas 5to Grado",
      "descripcion": "Curso de matemáticas para 5to básico",
      "total_estudiantes": 25,
      "total_misiones": 15
    }
  ]
}
```

### GET `/api/gm/cursos/:id`
Obtiene detalles de un curso (estudiantes, misiones).

**Respuesta:**
```json
{
  "success": true,
  "curso": {
    "id": 1,
    "nombre": "Matemáticas 5to Grado",
    "descripcion": "...",
    "estudiantes": [
      {
        "id": 1,
        "nombre": "Alejandra",
        "email": "alejandra@example.com",
        "nivel": 5,
        "experiencia": 1400,
        "fecha_inscripcion": "2025-01-01T00:00:00.000Z"
      }
    ],
    "misiones": [
      {
        "id": 3,
        "nombre": "Resolver ecuaciones",
        "dificultad": "Baja",
        "estado": "activa",
        "xp_recompensa": 150,
        "estudiantes_asignados": 25,
        "estudiantes_completados": 10
      }
    ]
  }
}
```

### POST `/api/gm/cursos`
Crea un nuevo curso.

**Body:**
```json
{
  "nombre": "Matemáticas 6to Grado",
  "descripcion": "Curso de matemáticas avanzadas"
}
```

### PUT `/api/gm/cursos/:id`
Actualiza un curso.

### DELETE `/api/gm/cursos/:id`
Elimina un curso.

### POST `/api/gm/cursos/:id/estudiantes`
Agrega un estudiante al curso.

**Body:**
```json
{
  "estudiante_id": 5
}
```

### DELETE `/api/gm/cursos/:id/estudiantes/:estudianteId`
Elimina un estudiante del curso.

---

## ⚙️ Configuración

### GET `/api/gm/configuracion`
Obtiene la configuración del GM.

**Respuesta:**
```json
{
  "success": true,
  "configuracion": {
    "notificaciones": {
      "emailNuevasMisiones": true,
      "emailMisionesCompletadas": true,
      "emailNuevosEstudiantes": true,
      "pushNuevasMisiones": false,
      "pushMisionesCompletadas": true
    },
    "privacidad": {
      "perfilPublico": false,
      "mostrarEstadisticas": true
    },
    "preferencias": {
      "idioma": "es",
      "tema": "light",
      "zona_horaria": "America/Santiago"
    }
  }
}
```

### PUT `/api/gm/configuracion`
Actualiza la configuración del GM.

**Body:**
```json
{
  "notificaciones": {
    "emailNuevasMisiones": true,
    "emailMisionesCompletadas": false
  },
  "privacidad": {
    "perfilPublico": true
  },
  "preferencias": {
    "tema": "dark"
  }
}
```

### PUT `/api/gm/configuracion/cambiar-contrasena`
Cambia la contraseña del GM.

**Body:**
```json
{
  "contrasenaActual": "password_actual",
  "contrasenaNueva": "nueva_password_segura"
}
```

---

## 👤 Perfil

### GET `/api/gm/perfil`
Obtiene el perfil completo del GM.

**Respuesta:**
```json
{
  "success": true,
  "perfil": {
    "id": 2,
    "nombre": "Profesor García",
    "email": "gm@test.com",
    "avatar": null,
    "created_at": "2025-01-01T00:00:00.000Z",
    "estadisticas": {
      "total_cursos": 3,
      "total_misiones": 25,
      "total_estudiantes": 75,
      "total_evaluaciones": 150
    },
    "cursos": [
      {
        "id": 1,
        "nombre": "Matemáticas 5to Grado",
        "estudiantes": 25,
        "misiones": 10
      }
    ],
    "actividadReciente": [
      {
        "tipo": "mision",
        "descripcion": "Problemas de fracciones",
        "fecha": "2025-01-15T10:00:00.000Z"
      },
      {
        "tipo": "evaluacion",
        "descripcion": "Evaluó a Alejandra en Resolver ecuaciones",
        "fecha": "2025-01-14T15:30:00.000Z"
      }
    ]
  }
}
```

### PUT `/api/gm/perfil`
Actualiza el perfil del GM.

**Body:**
```json
{
  "nombre": "Felipe García",
  "email": "felipe.garcia@example.com",
  "avatar": "https://example.com/avatar.jpg"
}
```

### GET `/api/gm/perfil/estadisticas`
Obtiene estadísticas detalladas del GM.

**Respuesta:**
```json
{
  "success": true,
  "estadisticas": {
    "cursos": [
      {
        "id": 1,
        "curso": "Matemáticas 5to Grado",
        "estudiantes": 25,
        "misiones": 10,
        "misiones_completadas": 150,
        "promedio_calificaciones": 82.5
      }
    ],
    "distribucionDificultad": [
      { "dificultad": "Baja", "cantidad": 5 },
      { "dificultad": "Media", "cantidad": 12 },
      { "dificultad": "Alta", "cantidad": 8 }
    ],
    "actividadMensual": [
      { "mes": "2024-12", "misiones_creadas": 8 },
      { "mes": "2025-01", "misiones_creadas": 12 }
    ],
    "tasaCompletitud": {
      "total_asignadas": 250,
      "completadas": 180,
      "tasa_completitud": 72.0
    }
  }
}
```

---

## 📊 Resumen de Endpoints

### Dashboard (7 endpoints)
- `GET /api/gm/dashboard/resumen` - Resumen completo
- `GET /api/gm/dashboard/estadisticas` - Estadísticas principales
- `GET /api/gm/dashboard/misiones-revisar` - Misiones pendientes
- `GET /api/gm/dashboard/avance-cursos` - Progreso de cursos
- `GET /api/gm/dashboard/misiones-recientes` - Últimas misiones
- `GET /api/gm/dashboard/indicadores` - Indicadores avanzados

### Misiones (5 endpoints)
- `GET /api/gm/misiones` - Listar todas
- `GET /api/gm/misiones/:id` - Ver detalles
- `POST /api/gm/misiones` - Crear
- `PUT /api/gm/misiones/:id` - Actualizar
- `DELETE /api/gm/misiones/:id` - Eliminar

### Evaluaciones (5 endpoints)
- `GET /api/gm/evaluaciones` - Listar todas
- `GET /api/gm/evaluaciones/pendientes` - Solo pendientes
- `GET /api/gm/evaluaciones/:id` - Ver detalles
- `PUT /api/gm/evaluaciones/:id/evaluar` - Evaluar
- `GET /api/gm/evaluaciones/estadisticas` - Estadísticas

### Estudiantes (4 endpoints)
- `GET /api/gm/estudiantes` - Listar todos
- `GET /api/gm/estudiantes/:id` - Ver detalles
- `GET /api/gm/estudiantes/:estudianteId/misiones/:misionId` - Progreso en misión
- `GET /api/gm/estudiantes/estadisticas` - Estadísticas

### Cursos (7 endpoints)
- `GET /api/gm/cursos` - Listar todos
- `GET /api/gm/cursos/:id` - Ver detalles
- `POST /api/gm/cursos` - Crear
- `PUT /api/gm/cursos/:id` - Actualizar
- `DELETE /api/gm/cursos/:id` - Eliminar
- `POST /api/gm/cursos/:id/estudiantes` - Agregar estudiante
- `DELETE /api/gm/cursos/:id/estudiantes/:estudianteId` - Eliminar estudiante

### Configuración (3 endpoints)
- `GET /api/gm/configuracion` - Ver configuración
- `PUT /api/gm/configuracion` - Actualizar configuración
- `PUT /api/gm/configuracion/cambiar-contrasena` - Cambiar contraseña

### Perfil (3 endpoints)
- `GET /api/gm/perfil` - Ver perfil
- `PUT /api/gm/perfil` - Actualizar perfil
- `GET /api/gm/perfil/estadisticas` - Estadísticas detalladas

**Total: 34 endpoints para el Game Master**
