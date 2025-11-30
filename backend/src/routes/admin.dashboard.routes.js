const express = require('express');
const router = express.Router();
const {
  getEstadisticasDashboard,
  getRegistroActividad,
  getEstadoSistema
} = require('../controllers/admin.dashboard.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Proteger todas las rutas con autenticación y verificar rol admin
router.use(verificarToken);
router.use(verificarRol(['admin']));

// Rutas del dashboard
router.get('/estadisticas', getEstadisticasDashboard);
router.get('/actividad', getRegistroActividad);
router.get('/estado-sistema', getEstadoSistema);

module.exports = router;
