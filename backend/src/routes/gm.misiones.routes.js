const express = require('express');
const router = express.Router();
const {
  obtenerMisiones,
  obtenerMisionPorId,
  crearMision,
  actualizarMision,
  eliminarMision,
  obtenerProgresoEstudiantes,
  asignarMisionACurso,
  eliminarAsignacionCurso
} = require('../controllers/gm.misiones.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol GM
router.use(verificarToken);
router.use(verificarRol(['gm', 'admin']));

// Obtener todas las misiones del GM
router.get('/', obtenerMisiones);

// Obtener una misión específica
router.get('/:id', obtenerMisionPorId);

// Obtener progreso de estudiantes en una misión
router.get('/:id/progreso/:cursoId', obtenerProgresoEstudiantes);

// Asignar misión a un curso
router.post('/:id/asignar/:cursoId', asignarMisionACurso);

// Eliminar asignación de misión a un curso
router.delete('/:id/asignar/:cursoId', eliminarAsignacionCurso);

// Crear una nueva misión
router.post('/', crearMision);

// Actualizar una misión
router.put('/:id', actualizarMision);

// Eliminar una misión
router.delete('/:id', eliminarMision);

module.exports = router;
