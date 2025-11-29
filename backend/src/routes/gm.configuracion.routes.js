const express = require('express');
const router = express.Router();
const {
  obtenerConfiguracion,
  actualizarConfiguracion,
  cambiarContrasena
} = require('../controllers/gm.configuracion.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol GM
router.use(verificarToken);
router.use(verificarRol('gm', 'admin'));

// Obtener configuración
router.get('/', obtenerConfiguracion);

// Actualizar configuración
router.put('/', actualizarConfiguracion);

// Cambiar contraseña
router.put('/cambiar-contrasena', cambiarContrasena);

module.exports = router;
