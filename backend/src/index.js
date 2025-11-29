const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/auth.routes');

// Rutas del Game Master
const gmMisionesRoutes = require('./routes/gm.misiones.routes');
const gmEvaluacionesRoutes = require('./routes/gm.evaluaciones.routes');
const gmEstudiantesRoutes = require('./routes/gm.estudiantes.routes');
const gmCursosRoutes = require('./routes/gm.cursos.routes');
const gmDashboardRoutes = require('./routes/gm.dashboard.routes');
const gmConfiguracionRoutes = require('./routes/gm.configuracion.routes');
const gmPerfilRoutes = require('./routes/gm.perfil.routes');

// Rutas del Estudiante
const estudianteDashboardRoutes = require('./routes/estudiante.dashboard.routes');
const estudianteMisionesRoutes = require('./routes/estudiante.misiones.routes');
const estudianteProgresoRoutes = require('./routes/estudiante.progreso.routes');
const estudianteLogrosRoutes = require('./routes/estudiante.logros.routes');
const estudiantePersonajeRoutes = require('./routes/estudiante.personaje.routes');
const estudiantePerfilRoutes = require('./routes/estudiante.perfil.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas del Game Master
app.use('/api/gm/dashboard', gmDashboardRoutes);
app.use('/api/gm/misiones', gmMisionesRoutes);
app.use('/api/gm/evaluaciones', gmEvaluacionesRoutes);
app.use('/api/gm/estudiantes', gmEstudiantesRoutes);
app.use('/api/gm/cursos', gmCursosRoutes);
app.use('/api/gm/configuracion', gmConfiguracionRoutes);
app.use('/api/gm/perfil', gmPerfilRoutes);

// Rutas del Estudiante
app.use('/api/estudiante/dashboard', estudianteDashboardRoutes);
app.use('/api/estudiante/misiones', estudianteMisionesRoutes);
app.use('/api/estudiante/progreso', estudianteProgresoRoutes);
app.use('/api/estudiante/logros', estudianteLogrosRoutes);
app.use('/api/estudiante/personaje', estudiantePersonajeRoutes);
app.use('/api/estudiante/perfil', estudiantePerfilRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Aprende Jugando funcionando ✅',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      gm: {
        dashboard: '/api/gm/dashboard',
        misiones: '/api/gm/misiones',
        evaluaciones: '/api/gm/evaluaciones',
        estudiantes: '/api/gm/estudiantes',
        cursos: '/api/gm/cursos',
        configuracion: '/api/gm/configuracion',
        perfil: '/api/gm/perfil'
      },
      estudiante: {
        dashboard: '/api/estudiante/dashboard',
        misiones: '/api/estudiante/misiones',
        progreso: '/api/estudiante/progreso',
        logros: '/api/estudiante/logros',
        personaje: '/api/estudiante/personaje',
        perfil: '/api/estudiante/perfil'
      }
    }
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Documentación de la API en http://localhost:${PORT}/`);
});
