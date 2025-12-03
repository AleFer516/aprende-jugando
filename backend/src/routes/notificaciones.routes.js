const express = require('express');
const router = express.Router();
const {
  obtenerNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion
} = require('../controllers/notificaciones.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener notificaciones del usuario
router.get('/', obtenerNotificaciones);

// Marcar notificación como leída
router.put('/:id/leida', marcarComoLeida);

// Marcar todas como leídas
router.put('/marcar-todas-leidas', marcarTodasComoLeidas);

// Eliminar notificación
router.delete('/:id', eliminarNotificacion);

module.exports = router;
