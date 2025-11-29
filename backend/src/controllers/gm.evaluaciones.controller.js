const db = require('../db');

// Obtener todas las evaluaciones pendientes del GM
const obtenerEvaluacionesPendientes = async (req, res) => {
  try {
    const gmId = req.usuario.id;

    const [evaluaciones] = await db.query(
      `SELECT
        ev.id,
        ev.estado,
        ev.created_at,
        u.id as estudiante_id,
        u.nombre as estudiante_nombre,
        u.email as estudiante_email,
        u.nivel as estudiante_nivel,
        m.id as mision_id,
        m.nombre as mision_nombre,
        m.dificultad,
        em.progreso,
        em.fecha_completado,
        em.xp_ganado
      FROM evaluaciones ev
      INNER JOIN usuarios u ON ev.estudiante_id = u.id
      INNER JOIN misiones m ON ev.mision_id = m.id
      LEFT JOIN estudiante_misiones em ON ev.estudiante_id = em.estudiante_id AND ev.mision_id = em.mision_id
      WHERE ev.gm_id = ? AND ev.estado = 'pendiente'
      ORDER BY ev.created_at DESC`,
      [gmId]
    );

    res.json({
      success: true,
      evaluaciones
    });
  } catch (error) {
    console.error('Error al obtener evaluaciones pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener evaluaciones pendientes',
      error: error.message
    });
  }
};

// Obtener todas las evaluaciones (pendientes y evaluadas)
const obtenerTodasEvaluaciones = async (req, res) => {
  try {
    const gmId = req.usuario.id;
    const { estado } = req.query;

    let query = `
      SELECT
        ev.id,
        ev.calificacion,
        ev.retroalimentacion,
        ev.estado,
        ev.created_at,
        ev.updated_at,
        u.id as estudiante_id,
        u.nombre as estudiante_nombre,
        u.email as estudiante_email,
        u.nivel as estudiante_nivel,
        m.id as mision_id,
        m.nombre as mision_nombre,
        m.dificultad,
        em.progreso,
        em.fecha_completado,
        em.xp_ganado
      FROM evaluaciones ev
      INNER JOIN usuarios u ON ev.estudiante_id = u.id
      INNER JOIN misiones m ON ev.mision_id = m.id
      LEFT JOIN estudiante_misiones em ON ev.estudiante_id = em.estudiante_id AND ev.mision_id = em.mision_id
      WHERE ev.gm_id = ?`;

    const params = [gmId];

    if (estado) {
      query += ' AND ev.estado = ?';
      params.push(estado);
    }

    query += ' ORDER BY ev.created_at DESC';

    const [evaluaciones] = await db.query(query, params);

    res.json({
      success: true,
      evaluaciones
    });
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener evaluaciones',
      error: error.message
    });
  }
};

// Obtener detalles de una evaluación específica
const obtenerEvaluacionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const gmId = req.usuario.id;

    // Obtener datos de la evaluación
    const [evaluaciones] = await db.query(
      `SELECT
        ev.*,
        u.id as estudiante_id,
        u.nombre as estudiante_nombre,
        u.email as estudiante_email,
        u.nivel as estudiante_nivel,
        u.experiencia as estudiante_experiencia,
        m.id as mision_id,
        m.nombre as mision_nombre,
        m.descripcion as mision_descripcion,
        m.dificultad,
        m.xp_recompensa,
        em.progreso,
        em.estado as estado_mision,
        em.fecha_inicio as fecha_inicio_mision,
        em.fecha_completado,
        em.xp_ganado
      FROM evaluaciones ev
      INNER JOIN usuarios u ON ev.estudiante_id = u.id
      INNER JOIN misiones m ON ev.mision_id = m.id
      LEFT JOIN estudiante_misiones em ON ev.estudiante_id = em.estudiante_id AND ev.mision_id = em.mision_id
      WHERE ev.id = ? AND ev.gm_id = ?`,
      [id, gmId]
    );

    if (evaluaciones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evaluación no encontrada'
      });
    }

    const evaluacion = evaluaciones[0];

    // Obtener respuestas del estudiante en esta misión
    const [respuestas] = await db.query(
      `SELECT
        er.id,
        er.respuesta,
        er.es_correcta,
        er.intentos,
        er.tiempo_respuesta,
        er.created_at,
        a.id as actividad_id,
        a.titulo as actividad_titulo,
        a.pregunta,
        a.respuesta_correcta
      FROM estudiante_respuestas er
      INNER JOIN actividades a ON er.actividad_id = a.id
      WHERE er.estudiante_id = ? AND a.mision_id = ?
      ORDER BY a.orden, er.created_at`,
      [evaluacion.estudiante_id, evaluacion.mision_id]
    );

    res.json({
      success: true,
      evaluacion: {
        ...evaluacion,
        respuestas
      }
    });
  } catch (error) {
    console.error('Error al obtener evaluación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener evaluación',
      error: error.message
    });
  }
};

// Evaluar una misión (asignar calificación y retroalimentación)
const evaluarMision = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const gmId = req.usuario.id;
    const { calificacion, retroalimentacion } = req.body;

    // Validaciones
    if (calificacion === undefined || calificacion === null) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'La calificación es requerida'
      });
    }

    if (calificacion < 0 || calificacion > 100) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'La calificación debe estar entre 0 y 100'
      });
    }

    // Verificar que la evaluación existe y pertenece al GM
    const [evaluaciones] = await connection.query(
      'SELECT estudiante_id, mision_id FROM evaluaciones WHERE id = ? AND gm_id = ?',
      [id, gmId]
    );

    if (evaluaciones.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Evaluación no encontrada'
      });
    }

    // Actualizar evaluación
    await connection.query(
      `UPDATE evaluaciones
      SET calificacion = ?, retroalimentacion = ?, estado = 'evaluada'
      WHERE id = ? AND gm_id = ?`,
      [calificacion, retroalimentacion, id, gmId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Evaluación guardada exitosamente'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al evaluar misión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al evaluar misión',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Obtener estadísticas de evaluaciones del GM
const obtenerEstadisticas = async (req, res) => {
  try {
    const gmId = req.usuario.id;

    const [estadisticas] = await db.query(
      `SELECT
        COUNT(*) as total_evaluaciones,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        COUNT(CASE WHEN estado = 'evaluada' THEN 1 END) as evaluadas,
        AVG(CASE WHEN estado = 'evaluada' THEN calificacion END) as promedio_calificaciones
      FROM evaluaciones
      WHERE gm_id = ?`,
      [gmId]
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
  obtenerEvaluacionesPendientes,
  obtenerTodasEvaluaciones,
  obtenerEvaluacionPorId,
  evaluarMision,
  obtenerEstadisticas
};
