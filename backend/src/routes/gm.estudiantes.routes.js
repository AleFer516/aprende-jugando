const express = require('express');
const router = express.Router();
const {
  obtenerEstudiantes,
  obtenerEstudiantePorId,
  obtenerProgresoMision,
  obtenerEstadisticasGenerales
} = require('../controllers/gm.estudiantes.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol GM
router.use(verificarToken);
router.use(verificarRol(['gm', 'admin']));

// Obtener estadísticas generales
router.get('/estadisticas', obtenerEstadisticasGenerales);

// Obtener todos los estudiantes
router.get('/', obtenerEstudiantes);

// Obtener un estudiante específico
router.get('/:id', obtenerEstudiantePorId);

// Obtener progreso de un estudiante en una misión
router.get('/:estudianteId/misiones/:misionId', obtenerProgresoMision);

module.exports = router;
