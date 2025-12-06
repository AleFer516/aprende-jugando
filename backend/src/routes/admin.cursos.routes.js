const express = require('express');
const router = express.Router();
const {
  getCursos,
  getGMs,
  crearCurso,
  actualizarCurso,
  eliminarCurso
} = require('../controllers/admin.cursos.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Proteger todas las rutas con autenticación y verificar rol admin
router.use(verificarToken);
router.use(verificarRol(['admin']));

// Rutas de cursos
router.get('/', getCursos);
router.get('/gms', getGMs);
router.post('/', crearCurso);
router.put('/:id', actualizarCurso);
router.delete('/:id', eliminarCurso);

module.exports = router;
