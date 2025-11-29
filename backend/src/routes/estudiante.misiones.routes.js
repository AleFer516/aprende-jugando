const express = require('express');
const router = express.Router();
const {
  obtenerMisiones,
  obtenerMisionPorId,
  obtenerActividades,
  responderActividad,
  iniciarMision
} = require('../controllers/estudiante.misiones.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol estudiante
router.use(verificarToken);
router.use(verificarRol('estudiante', 'admin'));

// Obtener todas las misiones del estudiante
router.get('/', obtenerMisiones);

// Obtener detalles de una misión
router.get('/:id', obtenerMisionPorId);

// Iniciar una misión
router.post('/:id/iniciar', iniciarMision);

// Obtener actividades de una misión
router.get('/:id/actividades', obtenerActividades);

// Responder una actividad
router.post('/actividades/:actividadId/responder', responderActividad);

module.exports = router;
