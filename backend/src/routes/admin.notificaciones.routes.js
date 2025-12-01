const express = require('express');
const router = express.Router();
const {
  getNotificaciones,
  marcarComoLeida,
  marcarTodasLeidas,
  eliminarNotificacion
} = require('../controllers/admin.notificaciones.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Proteger todas las rutas con autenticación y verificar rol admin
router.use(verificarToken);
router.use(verificarRol(['admin']));

// Rutas de notificaciones
router.get('/', getNotificaciones);
router.put('/:id/leida', marcarComoLeida);
router.put('/marcar-todas-leidas', marcarTodasLeidas);
router.delete('/:id', eliminarNotificacion);

module.exports = router;
