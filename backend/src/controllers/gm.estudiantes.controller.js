const db = require('../db');

// Obtener todos los estudiantes de los cursos del GM
const obtenerEstudiantes = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    const [estudiantes] = await db.query(
      `SELECT DISTINCT
        u.rut,
        u.nombre,
        u.email,
        u.nivel,
        u.experiencia,
        u.avatar,
        u.created_at,
        GROUP_CONCAT(DISTINCT c.nombre) as cursos,
        COUNT(DISTINCT em.mision_id) as total_misiones,
        COUNT(DISTINCT CASE WHEN em.estado = 'Completada' THEN em.mision_id END) as misiones_completadas,
        COUNT(DISTINCT CASE WHEN em.estado = 'En progreso' THEN em.mision_id END) as misiones_en_progreso,
        AVG(CASE WHEN em.estado = 'Completada' THEN em.progreso END) as promedio_progreso
      FROM usuarios u
      INNER JOIN curso_estudiantes ce ON u.rut = ce.estudiante_rut
      INNER JOIN cursos c ON ce.curso_id = c.id
      LEFT JOIN estudiante_misiones em ON u.rut = em.estudiante_rut
      GROUP BY u.rut
      ORDER BY u.nombre`,
      [gmRut]
    );

    res.json({
      success: true,
      estudiantes
    });
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estudiantes',
      error: error.message
    });
  }
};

// Obtener detalles de un estudiante específico
const obtenerEstudiantePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const gmRut = req.usuario.rut;

    // Verificar que el estudiante pertenece a un curso del GM
    const [estudiantes] = await db.query(
      `SELECT DISTINCT
        u.rut,
        u.nombre,
        u.email,
        u.nivel,
        u.experiencia,
        u.avatar,
        u.created_at
      FROM usuarios u
      INNER JOIN curso_estudiantes ce ON u.rut = ce.estudiante_rut
      INNER JOIN cursos c ON ce.curso_id = c.id
      WHERE u.rut = ? AND c.gm_rut = ? AND u.rol = 'estudiante'`,
      [id, gmRut]
    );

    if (estudiantes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    const estudiante = estudiantes[0];

    // Obtener cursos del estudiante
    const [cursos] = await db.query(
      `SELECT
        c.id,
        c.nombre,
        c.descripcion
      FROM cursos c
      INNER JOIN curso_estudiantes ce ON c.id = ce.curso_id
      WHERE ce.estudiante_rut = ? AND c.gm_rut = ?`,
      [id, gmRut]
    );

    // Obtener progreso en misiones
    const [misiones] = await db.query(
      `SELECT
        m.id,
        m.nombre,
        m.dificultad,
        m.xp_recompensa,
        em.estado,
        em.progreso,
        em.xp_ganado,
        em.fecha_inicio,
        em.fecha_completado
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE em.estudiante_rut = ? AND m.gm_rut = ?
      ORDER BY em.created_at DESC`,
      [id, gmRut]
    );

    // Obtener logros del estudiante
    const [logros] = await db.query(
      `SELECT
        l.id,
        l.nombre,
        l.descripcion,
        l.icono,
        el.fecha_desbloqueo
      FROM estudiante_logros el
      INNER JOIN logros l ON el.logro_id = l.id
      WHERE el.estudiante_rut = ?
      ORDER BY el.fecha_desbloqueo DESC`,
      [id]
    );

    // Obtener estadísticas generales
    const [estadisticas] = await db.query(
      `SELECT
        COUNT(*) as total_misiones,
        COUNT(CASE WHEN estado = 'Completada' THEN 1 END) as completadas,
        COUNT(CASE WHEN estado = 'En progreso' THEN 1 END) as en_progreso,
        COUNT(CASE WHEN estado = 'Pendiente' THEN 1 END) as pendientes,
        SUM(xp_ganado) as xp_total_ganado,
        AVG(CASE WHEN estado = 'Completada' THEN progreso END) as promedio_progreso
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE em.estudiante_rut = ? AND m.gm_rut = ?`,
      [id, gmRut]
    );

    res.json({
      success: true,
      estudiante: {
        ...estudiante,
        cursos,
        misiones,
        logros,
        estadisticas: estadisticas[0]
      }
    });
  } catch (error) {
    console.error('Error al obtener estudiante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estudiante',
      error: error.message
    });
  }
};

// Obtener progreso de un estudiante en una misión específica
const obtenerProgresoMision = async (req, res) => {
  try {
    const { estudianteId, misionId } = req.params;
    const gmRut = req.usuario.rut;

    // Verificar que la misión pertenece al GM
    const [misiones] = await db.query(
      'SELECT id FROM misiones WHERE id = ? AND gm_rut = ?',
      [misionId, gmRut]
    );

    if (misiones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Misión no encontrada'
      });
    }

    // Obtener progreso del estudiante
    const [progreso] = await db.query(
      `SELECT
        em.*,
        m.nombre as mision_nombre,
        m.dificultad,
        m.xp_recompensa,
        u.nombre as estudiante_nombre
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      INNER JOIN usuarios u ON em.estudiante_rut = u.rut
      WHERE em.estudiante_rut = ? AND em.mision_id = ?`,
      [estudianteId, misionId]
    );

    if (progreso.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Progreso no encontrado'
      });
    }

    // Obtener respuestas del estudiante en las actividades
    const [respuestas] = await db.query(
      `SELECT
        er.*,
        a.titulo as actividad_titulo,
        a.pregunta,
        a.respuesta_correcta
      FROM estudiante_respuestas er
      INNER JOIN actividades a ON er.actividad_id = a.id
      WHERE er.estudiante_rut = ? AND a.mision_id = ?
      ORDER BY a.orden, er.created_at`,
      [estudianteId, misionId]
    );

    res.json({
      success: true,
      progreso: {
        ...progreso[0],
        respuestas
      }
    });
  } catch (error) {
    console.error('Error al obtener progreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener progreso',
      error: error.message
    });
  }
};

// Obtener estadísticas generales de todos los estudiantes
const obtenerEstadisticasGenerales = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    const [estadisticas] = await db.query(
      `SELECT
        COUNT(DISTINCT u.rut) as total_estudiantes,
        COUNT(DISTINCT em.mision_id) as total_misiones_asignadas,
        COUNT(DISTINCT CASE WHEN em.estado = 'Completada' THEN em.id END) as total_completadas,
        AVG(u.nivel) as promedio_nivel,
        AVG(u.experiencia) as promedio_experiencia
      FROM usuarios u
      INNER JOIN curso_estudiantes ce ON u.rut = ce.estudiante_rut
      INNER JOIN cursos c ON ce.curso_id = c.id
      LEFT JOIN estudiante_misiones em ON u.rut = em.estudiante_rut
      WHERE c.gm_rut = ? AND u.rol = 'estudiante'`,
      [gmRut]
    );

    res.json({
      success: true,
      estadisticas: estadisticas[0]
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

module.exports = {
  obtenerEstudiantes,
  obtenerEstudiantePorId,
  obtenerProgresoMision,
  obtenerEstadisticasGenerales
};
