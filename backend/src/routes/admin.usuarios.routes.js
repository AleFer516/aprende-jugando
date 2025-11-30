const express = require('express');
const router = express.Router();
const {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} = require('../controllers/admin.usuarios.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Proteger todas las rutas con autenticación y verificar rol admin
router.use(verificarToken);
router.use(verificarRol(['admin']));

// Rutas de usuarios
router.get('/', getUsuarios);
router.post('/', crearUsuario);
router.put('/:rut', actualizarUsuario);
router.delete('/:rut', eliminarUsuario);

module.exports = router;
