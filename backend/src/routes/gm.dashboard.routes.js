const express = require('express');
const router = express.Router();
const {
  obtenerEstadisticasDashboard,
  obtenerMisionesPorRevisar,
  obtenerAvanceCursos,
  obtenerMisionesRecientes,
  obtenerIndicadoresAvanzados,
  obtenerResumenDashboard
} = require('../controllers/gm.dashboard.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol GM
router.use(verificarToken);
router.use(verificarRol(['gm', 'admin']));

// Obtener resumen completo del dashboard
router.get('/resumen', obtenerResumenDashboard);

// Obtener estadísticas principales
router.get('/estadisticas', obtenerEstadisticasDashboard);

// Obtener misiones por revisar
router.get('/misiones-revisar', obtenerMisionesPorRevisar);

// Obtener avance de cursos
router.get('/avance-cursos', obtenerAvanceCursos);

// Obtener misiones recientes
router.get('/misiones-recientes', obtenerMisionesRecientes);

// Obtener indicadores avanzados
router.get('/indicadores', obtenerIndicadoresAvanzados);

module.exports = router;
