const db = require('../db');
const { registrarActividad } = require('../utils/actividadLogger');

// Obtener todos los cursos del GM
const obtenerCursos = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    const [cursos] = await db.query(
      `SELECT
        c.id,
        c.nombre,
        c.descripcion,
        c.created_at,
        c.updated_at,
        COUNT(DISTINCT ce.estudiante_rut) as total_estudiantes,
        COUNT(DISTINCT m.id) as total_misiones
      FROM cursos c
      LEFT JOIN curso_estudiantes ce ON c.id = ce.curso_id
      LEFT JOIN misiones m ON c.id = m.curso_id
      WHERE c.gm_rut = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC`,
      [gmRut]
    );

    res.json({
      success: true,
      cursos
    });
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cursos',
      error: error.message
    });
  }
};

// Obtener un curso específico con detalles
const obtenerCursoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const gmRut = req.usuario.rut;

    // Obtener datos del curso
    const [cursos] = await db.query(
      'SELECT * FROM cursos WHERE id = ? AND gm_rut = ?',
      [id, gmRut]
    );

    if (cursos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    const curso = cursos[0];

    // Obtener estudiantes del curso
    const [estudiantes] = await db.query(
      `SELECT
        u.rut,
        u.nombre,
        u.email,
        u.nivel,
        u.experiencia,
        ce.fecha_inscripcion
      FROM curso_estudiantes ce
      INNER JOIN usuarios u ON ce.estudiante_rut = u.rut
      WHERE ce.curso_id = ?
      ORDER BY u.nombre`,
      [id]
    );

    // Obtener misiones del curso
    const [misiones] = await db.query(
      `SELECT
        m.id,
        m.nombre,
        m.dificultad,
        m.estado,
        m.xp_recompensa,
        COUNT(DISTINCT em.estudiante_rut) as estudiantes_asignados,
        COUNT(DISTINCT CASE WHEN em.estado = 'Completada' THEN em.estudiante_rut END) as estudiantes_completados
      FROM misiones m
      LEFT JOIN estudiante_misiones em ON m.id = em.mision_id
      WHERE m.curso_id = ?
      GROUP BY m.id
      ORDER BY m.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      curso: {
        ...curso,
        estudiantes,
        misiones
      }
    });
  } catch (error) {
    console.error('Error al obtener curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener curso',
      error: error.message
    });
  }
};

// Crear un nuevo curso
const crearCurso = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del curso es requerido'
      });
    }

    const [result] = await db.query(
      'INSERT INTO cursos (nombre, descripcion, gm_rut) VALUES (?, ?, ?)',
      [nombre, descripcion, gmRut]
    );

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Game Master';
    await registrarActividad(
      `Nuevo curso creado: ${nombre}`,
      usuario,
      'sistema'
    );

    res.status(201).json({
      success: true,
      message: 'Curso creado exitosamente',
      cursoId: result.insertId
    });
  } catch (error) {
    console.error('Error al crear curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear curso',
      error: error.message
    });
  }
};

// Actualizar un curso
const actualizarCurso = async (req, res) => {
  try {
    const { id } = req.params;
    const gmRut = req.usuario.rut;
    const { nombre, descripcion } = req.body;

    // Verificar que el curso pertenece al GM
    const [cursos] = await db.query(
      'SELECT id FROM cursos WHERE id = ? AND gm_rut = ?',
      [id, gmRut]
    );

    if (cursos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    await db.query(
      'UPDATE cursos SET nombre = ?, descripcion = ? WHERE id = ? AND gm_rut = ?',
      [nombre, descripcion, id, gmRut]
    );

    res.json({
      success: true,
      message: 'Curso actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar curso',
      error: error.message
    });
  }
};

// Eliminar un curso
const eliminarCurso = async (req, res) => {
  try {
    const { id } = req.params;
    const gmRut = req.usuario.rut;

    // Verificar que el curso pertenece al GM
    const [cursos] = await db.query(
      'SELECT id FROM cursos WHERE id = ? AND gm_rut = ?',
      [id, gmRut]
    );

    if (cursos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    await db.query('DELETE FROM cursos WHERE id = ? AND gm_rut = ?', [id, gmRut]);

    res.json({
      success: true,
      message: 'Curso eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar curso',
      error: error.message
    });
  }
};

// Agregar un estudiante a un curso
const agregarEstudiante = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const gmRut = req.usuario.rut;
    const { estudiante_rut } = req.body;

    // Verificar que el curso pertenece al GM
    const [cursos] = await connection.query(
      'SELECT id FROM cursos WHERE id = ? AND gm_rut = ?',
      [id, gmRut]
    );

    if (cursos.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    // Verificar que el estudiante existe
    const [estudiantes] = await connection.query(
      'SELECT rut FROM usuarios WHERE rut = ? AND rol = "estudiante"',
      [estudiante_rut]
    );

    if (estudiantes.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    // Agregar estudiante al curso
    await connection.query(
      'INSERT INTO curso_estudiantes (curso_id, estudiante_rut) VALUES (?, ?)',
      [id, estudiante_rut]
    );

    // Asignar todas las misiones activas del curso al estudiante
    await connection.query(
      `INSERT INTO estudiante_misiones (estudiante_rut, mision_id, estado)
      SELECT ?, m.id, 'Pendiente'
      FROM misiones m
      WHERE m.curso_id = ? AND m.estado = 'activa'`,
      [estudiante_rut, id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Estudiante agregado al curso exitosamente'
    });
  } catch (error) {
    await connection.rollback();

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'El estudiante ya está inscrito en este curso'
      });
    }

    console.error('Error al agregar estudiante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar estudiante',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Eliminar un estudiante de un curso
const eliminarEstudiante = async (req, res) => {
  try {
    const { id, estudianteRut } = req.params;
    const gmRut = req.usuario.rut;

    // Verificar que el curso pertenece al GM
    const [cursos] = await db.query(
      'SELECT id FROM cursos WHERE id = ? AND gm_rut = ?',
      [id, gmRut]
    );

    if (cursos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    await db.query(
      'DELETE FROM curso_estudiantes WHERE curso_id = ? AND estudiante_rut = ?',
      [id, estudianteRut]
    );

    res.json({
      success: true,
      message: 'Estudiante eliminado del curso exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar estudiante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar estudiante',
      error: error.message
    });
  }
};

module.exports = {
  obtenerCursos,
  obtenerCursoPorId,
  crearCurso,
  actualizarCurso,
  eliminarCurso,
  agregarEstudiante,
  eliminarEstudiante
};
