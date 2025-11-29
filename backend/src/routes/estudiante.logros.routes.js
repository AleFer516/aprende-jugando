const express = require('express');
const router = express.Router();
const {
  obtenerLogros,
  verificarLogros
} = require('../controllers/estudiante.logros.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol estudiante
router.use(verificarToken);
router.use(verificarRol('estudiante', 'admin'));

// Obtener todos los logros
router.get('/', obtenerLogros);

// Verificar y desbloquear logros
router.post('/verificar', verificarLogros);

module.exports = router;
