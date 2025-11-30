const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');
const { getEstadisticasGlobales } = require('../controllers/admin.estadisticas.controller');

// Todas las rutas requieren autenticación de admin
router.use(verificarToken);
router.use(verificarRol(['admin']));

// GET /api/admin/estadisticas - Obtener estadísticas globales
router.get('/', getEstadisticasGlobales);

module.exports = router;
