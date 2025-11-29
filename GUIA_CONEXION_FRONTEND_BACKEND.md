# Guía de Conexión Frontend-Backend

## ✅ Configuración Completada

### Backend (Puerto 4000)
- ✅ Base de datos MySQL configurada
- ✅ API REST funcionando
- ✅ Autenticación con JWT
- ✅ Endpoints de estudiante implementados
- ✅ Endpoints de GM implementados

### Frontend (Puerto 5174)
- ✅ Axios instalado
- ✅ Servicios API creados
- ✅ Login conectado al backend
- ✅ Variables de entorno configuradas

---

## 🚀 Cómo Probar la Conexión

### 1. Asegúrate que ambos servidores estén corriendo

**Backend:**
```bash
cd backend
npm start
```
Deberías ver: `🚀 Servidor corriendo en http://localhost:4000`

**Frontend:**
```bash
cd frontend
npm run dev
```
Deberías ver: `➜  Local:   http://localhost:5174/`

### 2. Probar el Login

Abre tu navegador en: `http://localhost:5174/login`

**Credenciales de prueba:**

#### Estudiante:
- **Email:** estudiante@test.com
- **Contraseña:** password123
- **Redirección:** `/estudiante/inicio`

#### Game Master:
- **Email:** gm@test.com
- **Contraseña:** password123
- **Redirección:** `/gm/inicio`

#### Admin:
- **Email:** admin@test.com
- **Contraseña:** password123
- **Redirección:** `/admin/dashboard`

### 3. Qué debería pasar:

1. Al hacer login exitoso:
   - ✅ Verás un mensaje: "¡Bienvenido/a [Nombre]!"
   - ✅ El token se guardará en localStorage
   - ✅ Serás redirigido según tu rol
   - ✅ La información del usuario se guardará en localStorage

2. Si hay error:
   - ❌ "Credenciales incorrectas" - Email o contraseña mal
   - ❌ "No se pudo conectar con el servidor" - Backend no está corriendo
   - ❌ "Token expirado" - Token JWT expirado (24 horas)

---

## 📁 Archivos Creados

### Servicios (frontend/src/services/):
- ✅ **api.js** - Configuración de axios con interceptors
- ✅ **authService.js** - Servicio de autenticación
- ✅ **estudianteService.js** - Servicios del estudiante
- ✅ **gmService.js** - Servicios del GM

### Configuración:
- ✅ **frontend/.env** - Variables de entorno (API_URL)

### Archivos Modificados:
- ✅ **frontend/src/pages/Login.jsx** - Login conectado al backend

---

## 🔧 Estructura de Servicios

### authService

```javascript
import authService from '../services/authService';

// Login
const response = await authService.login(email, password);
// response.success, response.token, response.usuario

// Logout
authService.logout();

// Verificar autenticación
const isAuth = authService.isAuthenticated();

// Obtener usuario actual
const user = authService.getCurrentUser();
```

### estudianteService

```javascript
import estudianteService from '../services/estudianteService';

// Dashboard
const dashboard = await estudianteService.getDashboard();

// Misiones
const misiones = await estudianteService.getMisiones();
const detalle = await estudianteService.getMisionDetalle(misionId);
await estudianteService.iniciarMision(misionId);

// Actividades
const actividades = await estudianteService.getActividades(misionId);
await estudianteService.responderActividad(actividadId, respuesta);

// Progreso
const progreso = await estudianteService.getProgreso();
const ranking = await estudianteService.getRanking();

// Logros
const logros = await estudianteService.getLogros();
await estudianteService.verificarLogros();

// Personaje
const personaje = await estudianteService.getPersonaje();
await estudianteService.actualizarPersonaje(personalizaciones);

// Perfil
const perfil = await estudianteService.getPerfil();
await estudianteService.actualizarPerfil(datos);
```

### gmService

```javascript
import gmService from '../services/gmService';

// Dashboard
const resumen = await gmService.getDashboardResumen();
const estadisticas = await gmService.getEstadisticas();

// Misiones
const misiones = await gmService.getMisiones({ curso, dificultad, estado });
const detalle = await gmService.getMisionDetalle(misionId);
await gmService.crearMision(misionData);
await gmService.actualizarMision(misionId, misionData);

// Evaluaciones
const evaluaciones = await gmService.getEvaluaciones('pendiente');
await gmService.evaluarMision(evaluacionId, calificacion, retroalimentacion);

// Estudiantes
const estudiantes = await gmService.getEstudiantes(cursoId);
const detalle = await gmService.getEstudianteDetalle(estudianteId);

// Cursos
const cursos = await gmService.getCursos();
await gmService.crearCurso(cursoData);
```

---

## 🛠️ Próximos Pasos para Conectar Componentes

### Para Estudiante:

1. **EstudianteInicio.jsx** - Usar `estudianteService.getDashboard()`
2. **EstudianteMisiones.jsx** - Usar `estudianteService.getMisiones()`
3. **EstudianteMisionDetalle.jsx** - Usar `estudianteService.getMisionDetalle(id)`
4. **EstudianteMisionActividad.jsx** - Usar `estudianteService.responderActividad()`
5. **EstudianteProgreso.jsx** - Usar `estudianteService.getProgreso()`
6. **EstudianteLogros.jsx** - Usar `estudianteService.getLogros()`
7. **EstudiantePersonaje.jsx** - Usar `estudianteService.getPersonaje()`
8. **EstudiantePerfil.jsx** - Usar `estudianteService.getPerfil()`

### Para GM:

1. **GMInicio.jsx** - Usar `gmService.getDashboardResumen()`
2. **GMMisiones.jsx** - Usar `gmService.getMisiones()`
3. **GMGestionarMision.jsx** - Usar `gmService.crearMision()` / `actualizarMision()`
4. **GMEvaluaciones.jsx** - Usar `gmService.getEvaluaciones()`
5. **GMEvaluarMision.jsx** - Usar `gmService.evaluarMision()`
6. **GMEstudiantes.jsx** - Usar `gmService.getEstudiantes()`
7. **GMPerfil.jsx** - Usar `gmService.getPerfil()`

---

## 🐛 Solución de Problemas

### Error: "No se pudo conectar con el servidor"
**Solución:** Verifica que el backend esté corriendo en el puerto 4000
```bash
cd backend
npm start
```

### Error: "CORS policy"
**Solución:** El backend ya tiene CORS habilitado, reinicia el servidor backend

### Error: "Token expirado"
**Solución:** Vuelve a hacer login. El token JWT expira en 24 horas

### Error: "Credenciales incorrectas"
**Solución:** Verifica que uses las credenciales correctas:
- estudiante@test.com / password123
- gm@test.com / password123
- admin@test.com / password123

### Los datos no aparecen en localStorage
**Solución:** Abre DevTools (F12) > Application > Local Storage > localhost:5174
Deberías ver: `token` y `usuario`

---

## 📊 Verificar Conexión con DevTools

1. Abre el navegador en `http://localhost:5174/login`
2. Presiona F12 para abrir DevTools
3. Ve a la pestaña "Network"
4. Haz login con `estudiante@test.com` / `password123`
5. Deberías ver una petición POST a `http://localhost:4000/api/auth/login`
6. Si la respuesta es 200 OK, la conexión funciona ✅

---

## 🎯 Ejemplo Completo de Uso

```javascript
// En cualquier componente de estudiante
import { useEffect, useState } from 'react';
import estudianteService from '../services/estudianteService';

function EstudianteInicio() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const data = await estudianteService.getDashboard();
      setDashboard(data.dashboard);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Error al cargar dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>¡Hola {dashboard.estudiante.nombre}!</h1>
      <p>Nivel: {dashboard.estudiante.nivel}</p>
      <p>XP: {dashboard.estudiante.xpActual}/{dashboard.estudiante.xpSiguienteNivel}</p>
    </div>
  );
}
```

---

## ✨ Listo para Usar

Ahora tu frontend está completamente conectado con el backend. Puedes:

1. ✅ Hacer login con usuarios reales
2. ✅ Obtener datos del backend
3. ✅ Crear, actualizar y eliminar recursos
4. ✅ Gestión automática de tokens
5. ✅ Redirección automática si el token expira

**Siguiente paso:** Actualizar los componentes de estudiante y GM para usar los servicios API.
