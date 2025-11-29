const express = require('express');
const router = express.Router();
const {
  obtenerPersonalizaciones,
  guardarPersonalizaciones
} = require('../controllers/estudiante.personaje.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol estudiante
router.use(verificarToken);
router.use(verificarRol('estudiante', 'admin'));

// Obtener personalizaciones disponibles y activas
router.get('/', obtenerPersonalizaciones);

// Guardar personalizaciones activas
router.put('/', guardarPersonalizaciones);

module.exports = router;
