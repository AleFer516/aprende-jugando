const express = require('express');
const router = express.Router();
const {
  obtenerCursos,
  obtenerCursoPorId,
  crearCurso,
  actualizarCurso,
  eliminarCurso,
  agregarEstudiante,
  eliminarEstudiante
} = require('../controllers/gm.cursos.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol GM
router.use(verificarToken);
router.use(verificarRol(['gm', 'admin']));

// Obtener todos los cursos
router.get('/', obtenerCursos);

// Obtener un curso específico
router.get('/:id', obtenerCursoPorId);

// Crear un nuevo curso
router.post('/', crearCurso);

// Actualizar un curso
router.put('/:id', actualizarCurso);

// Eliminar un curso
router.delete('/:id', eliminarCurso);

// Agregar un estudiante al curso
router.post('/:id/estudiantes', agregarEstudiante);

// Eliminar un estudiante del curso
router.delete('/:id/estudiantes/:estudianteId', eliminarEstudiante);

module.exports = router;
