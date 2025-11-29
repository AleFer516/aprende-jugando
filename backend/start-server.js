// Script de inicio con manejo de errores mejorado
console.log('🔍 Iniciando servidor con diagnóstico...\n');

try {
  // Cargar variables de entorno
  require('dotenv').config();
  console.log('✅ Variables de entorno cargadas');

  // Verificar conexión a base de datos
  const db = require('./src/db');
  console.log('✅ Conexión a base de datos configurada');

  // Cargar Express
  const express = require('express');
  const cors = require('cors');
  console.log('✅ Express y CORS cargados');

  const app = express();
  const PORT = process.env.PORT || 4000;

  // Middlewares
  app.use(cors());
  app.use(express.json());
  console.log('✅ Middlewares configurados');

  // Cargar rutas una por una con manejo de errores
  console.log('\n📁 Cargando rutas...');

  try {
    const authRoutes = require('./src/routes/auth.routes');
    app.use('/api/auth', authRoutes);
    console.log('  ✅ auth.routes');
  } catch (err) {
    console.error('  ❌ Error en auth.routes:', err.message);
  }

  try {
    const gmDashboardRoutes = require('./src/routes/gm.dashboard.routes');
    app.use('/api/gm/dashboard', gmDashboardRoutes);
    console.log('  ✅ gm.dashboard.routes');
  } catch (err) {
    console.error('  ❌ Error en gm.dashboard.routes:', err.message);
  }

  try {
    const gmMisionesRoutes = require('./src/routes/gm.misiones.routes');
    app.use('/api/gm/misiones', gmMisionesRoutes);
    console.log('  ✅ gm.misiones.routes');
  } catch (err) {
    console.error('  ❌ Error en gm.misiones.routes:', err.message);
  }

  try {
    const gmEvaluacionesRoutes = require('./src/routes/gm.evaluaciones.routes');
    app.use('/api/gm/evaluaciones', gmEvaluacionesRoutes);
    console.log('  ✅ gm.evaluaciones.routes');
  } catch (err) {
    console.error('  ❌ Error en gm.evaluaciones.routes:', err.message);
  }

  try {
    const gmEstudiantesRoutes = require('./src/routes/gm.estudiantes.routes');
    app.use('/api/gm/estudiantes', gmEstudiantesRoutes);
    console.log('  ✅ gm.estudiantes.routes');
  } catch (err) {
    console.error('  ❌ Error en gm.estudiantes.routes:', err.message);
  }

  try {
    const gmCursosRoutes = require('./src/routes/gm.cursos.routes');
    app.use('/api/gm/cursos', gmCursosRoutes);
    console.log('  ✅ gm.cursos.routes');
  } catch (err) {
    console.error('  ❌ Error en gm.cursos.routes:', err.message);
  }

  try {
    const gmConfiguracionRoutes = require('./src/routes/gm.configuracion.routes');
    app.use('/api/gm/configuracion', gmConfiguracionRoutes);
    console.log('  ✅ gm.configuracion.routes');
  } catch (err) {
    console.error('  ❌ Error en gm.configuracion.routes:', err.message);
  }

  try {
    const gmPerfilRoutes = require('./src/routes/gm.perfil.routes');
    app.use('/api/gm/perfil', gmPerfilRoutes);
    console.log('  ✅ gm.perfil.routes');
  } catch (err) {
    console.error('  ❌ Error en gm.perfil.routes:', err.message);
  }

  try {
    const estudianteDashboardRoutes = require('./src/routes/estudiante.dashboard.routes');
    app.use('/api/estudiante/dashboard', estudianteDashboardRoutes);
    console.log('  ✅ estudiante.dashboard.routes');
  } catch (err) {
    console.error('  ❌ Error en estudiante.dashboard.routes:', err.message);
  }

  try {
    const estudianteMisionesRoutes = require('./src/routes/estudiante.misiones.routes');
    app.use('/api/estudiante/misiones', estudianteMisionesRoutes);
    console.log('  ✅ estudiante.misiones.routes');
  } catch (err) {
    console.error('  ❌ Error en estudiante.misiones.routes:', err.message);
  }

  try {
    const estudianteProgresoRoutes = require('./src/routes/estudiante.progreso.routes');
    app.use('/api/estudiante/progreso', estudianteProgresoRoutes);
    console.log('  ✅ estudiante.progreso.routes');
  } catch (err) {
    console.error('  ❌ Error en estudiante.progreso.routes:', err.message);
  }

  try {
    const estudianteLogrosRoutes = require('./src/routes/estudiante.logros.routes');
    app.use('/api/estudiante/logros', estudianteLogrosRoutes);
    console.log('  ✅ estudiante.logros.routes');
  } catch (err) {
    console.error('  ❌ Error en estudiante.logros.routes:', err.message);
  }

  try {
    const estudiantePersonajeRoutes = require('./src/routes/estudiante.personaje.routes');
    app.use('/api/estudiante/personaje', estudiantePersonajeRoutes);
    console.log('  ✅ estudiante.personaje.routes');
  } catch (err) {
    console.error('  ❌ Error en estudiante.personaje.routes:', err.message);
  }

  try {
    const estudiantePerfilRoutes = require('./src/routes/estudiante.perfil.routes');
    app.use('/api/estudiante/perfil', estudiantePerfilRoutes);
    console.log('  ✅ estudiante.perfil.routes');
  } catch (err) {
    console.error('  ❌ Error en estudiante.perfil.routes:', err.message);
  }

  // Ruta raíz
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'API Aprende Jugando funcionando ✅',
      version: '1.0.0'
    });
  });

  // Manejo de errores
  app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: err.message
    });
  });

  // Iniciar servidor
  const server = app.listen(PORT, () => {
    console.log('\n✨ Servidor iniciado exitosamente ✨');
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📚 Documentación de la API en http://localhost:${PORT}/\n`);
    console.log('⚠️  NO CIERRES ESTA VENTANA - El servidor debe permanecer activo\n');
  });

  // Manejo de cierre del servidor
  process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    server.close(() => {
      console.log('✅ Servidor cerrado correctamente');
      process.exit(0);
    });
  });

} catch (error) {
  console.error('\n❌ ERROR FATAL al iniciar el servidor:');
  console.error(error);
  console.error('\n📋 Stack trace:');
  console.error(error.stack);
  process.exit(1);
}
