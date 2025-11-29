const express = require('express');
const router = express.Router();
const {
  obtenerProgreso,
  obtenerRanking
} = require('../controllers/estudiante.progreso.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol estudiante
router.use(verificarToken);
router.use(verificarRol('estudiante', 'admin'));

// Obtener progreso completo
router.get('/', obtenerProgreso);

// Obtener ranking
router.get('/ranking', obtenerRanking);

module.exports = router;
