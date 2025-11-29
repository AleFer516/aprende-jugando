const express = require('express');
const router = express.Router();
const {
  obtenerPerfil,
  actualizarPerfil,
  obtenerConfiguracion,
  actualizarConfiguracion,
  cambiarContrasena
} = require('../controllers/estudiante.perfil.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol estudiante
router.use(verificarToken);
router.use(verificarRol('estudiante', 'admin'));

// Obtener perfil
router.get('/', obtenerPerfil);

// Actualizar perfil
router.put('/', actualizarPerfil);

// Obtener configuración
router.get('/configuracion', obtenerConfiguracion);

// Actualizar configuración
router.put('/configuracion', actualizarConfiguracion);

// Cambiar contraseña
router.put('/cambiar-contrasena', cambiarContrasena);

module.exports = router;
