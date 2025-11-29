const express = require('express');
const router = express.Router();
const {
  obtenerPerfil,
  actualizarPerfil,
  obtenerEstadisticasDetalladas
} = require('../controllers/gm.perfil.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol GM
router.use(verificarToken);
router.use(verificarRol('gm', 'admin'));

// Obtener estadísticas detalladas
router.get('/estadisticas', obtenerEstadisticasDetalladas);

// Obtener perfil
router.get('/', obtenerPerfil);

// Actualizar perfil
router.put('/', actualizarPerfil);

module.exports = router;
