const express = require('express');
const router = express.Router();
const {
  obtenerEvaluacionesPendientes,
  obtenerTodasEvaluaciones,
  obtenerEvaluacionPorId,
  evaluarMision,
  obtenerEstadisticas
} = require('../controllers/gm.evaluaciones.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol GM
router.use(verificarToken);
router.use(verificarRol(['gm', 'admin']));

// Obtener estadísticas de evaluaciones
router.get('/estadisticas', obtenerEstadisticas);

// Obtener evaluaciones pendientes
router.get('/pendientes', obtenerEvaluacionesPendientes);

// Obtener todas las evaluaciones (con filtro opcional)
router.get('/', obtenerTodasEvaluaciones);

// Obtener una evaluación específica
router.get('/:id', obtenerEvaluacionPorId);

// Evaluar una misión (asignar calificación y retroalimentación)
router.put('/:id/evaluar', evaluarMision);

module.exports = router;
