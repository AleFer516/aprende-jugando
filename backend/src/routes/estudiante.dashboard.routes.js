const express = require('express');
const router = express.Router();
const { obtenerDashboard } = require('../controllers/estudiante.dashboard.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol estudiante
router.use(verificarToken);
router.use(verificarRol('estudiante', 'admin'));

// Obtener dashboard completo
router.get('/', obtenerDashboard);

module.exports = router;
