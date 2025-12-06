const db = require('../db');

// Obtener todas las evaluaciones pendientes del GM
const obtenerEvaluacionesPendientes = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    const [evaluaciones] = await db.query(
      `SELECT
        ev.id,
        ev.estado,
        ev.created_at,
        u.rut as estudiante_rut,
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
      INNER JOIN usuarios u ON ev.estudiante_rut = u.rut
      INNER JOIN misiones m ON ev.mision_id = m.id
      LEFT JOIN estudiante_misiones em ON ev.estudiante_rut = em.estudiante_rut AND ev.mision_id = em.mision_id
      WHERE ev.gm_rut = ? AND ev.estado = 'pendiente'
      ORDER BY ev.created_at DESC`,
      [gmRut]
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
    const gmRut = req.usuario.rut;
    const { estado } = req.query;

    let query = `
      SELECT
        ev.id,
        ev.calificacion,
        ev.retroalimentacion,
        ev.estado,
        ev.created_at,
        ev.updated_at,
        u.rut as estudiante_rut,
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
      INNER JOIN usuarios u ON ev.estudiante_rut = u.rut
      INNER JOIN misiones m ON ev.mision_id = m.id
      LEFT JOIN estudiante_misiones em ON ev.estudiante_rut = em.estudiante_rut AND ev.mision_id = em.mision_id
      WHERE ev.gm_rut = ?`;

    const params = [gmRut];

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

// Obtener detalles de una evaluación específica (estudiante_misiones)
const obtenerEvaluacionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const gmRut = req.usuario.rut;

    // Obtener datos de la misión del estudiante
    const [evaluaciones] = await db.query(
      `SELECT
        em.id,
        em.estado,
        em.puntuacion,
        em.progreso,
        em.fecha_inicio,
        em.fecha_completado,
        em.respuestas,
        u.rut as estudiante_rut,
        u.nombre as estudiante_nombre,
        u.email as estudiante_email,
        u.nivel as estudiante_nivel,
        u.experiencia as estudiante_experiencia,
        u.monedas as estudiante_monedas,
        m.id as mision_id,
        m.titulo as mision_titulo,
        m.descripcion as mision_descripcion,
        m.dificultad,
        m.categoria,
        m.puntos_experiencia as xp_recompensa,
        c.nombre as curso_nombre,
        c.id as curso_id
      FROM estudiante_misiones em
      INNER JOIN usuarios u ON em.estudiante_rut = u.rut
      INNER JOIN misiones m ON em.mision_id = m.id
      LEFT JOIN cursos c ON m.curso_id = c.id
      WHERE em.id = ? AND m.creador_rut = ?`,
      [id, gmRut]
    );

    if (evaluaciones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evaluación no encontrada'
      });
    }

    const evaluacion = evaluaciones[0];

    // Obtener actividades de la misión
    const [actividades] = await db.query(
      `SELECT
        a.id,
        a.tipo,
        a.pregunta,
        a.orden,
        a.puntos,
        a.imagen,
        a.explicacion
      FROM actividades a
      WHERE a.mision_id = ?
      ORDER BY a.orden`,
      [evaluacion.mision_id]
    );

    // Parsear respuestas del estudiante (están en JSON)
    let respuestasEstudiante = [];
    if (evaluacion.respuestas) {
      try {
        respuestasEstudiante = typeof evaluacion.respuestas === 'string'
          ? JSON.parse(evaluacion.respuestas)
          : evaluacion.respuestas;
      } catch (e) {
        console.error('Error al parsear respuestas:', e);
      }
    }

    res.json({
      success: true,
      evaluacion: {
        ...evaluacion,
        actividades,
        respuestas_estudiante: respuestasEstudiante
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
    const gmRut = req.usuario.rut;
    const { estado, retroalimentacion } = req.body;

    // Validaciones
    const estadosValidos = ['aprobada', 'rechazada', 'revisada'];
    if (!estado || !estadosValidos.includes(estado)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser: aprobada, rechazada o revisada'
      });
    }

    // Verificar que la evaluación existe y la misión pertenece al GM
    const [evaluaciones] = await connection.query(
      `SELECT em.id, em.estudiante_rut, em.mision_id, m.creador_rut, m.puntos_experiencia
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE em.id = ? AND m.creador_rut = ?`,
      [id, gmRut]
    );

    if (evaluaciones.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Evaluación no encontrada'
      });
    }

    const evaluacion = evaluaciones[0];

    // Actualizar estado de la misión del estudiante con retroalimentación
    // Si se rechaza, resetear el progreso para permitir reintentar
    if (estado === 'rechazada') {
      await connection.query(
        `UPDATE estudiante_misiones
        SET estado = ?, retroalimentacion = ?, progreso = 0, fecha_completado = NULL
        WHERE id = ?`,
        [estado, retroalimentacion || null, id]
      );
    } else {
      await connection.query(
        `UPDATE estudiante_misiones
        SET estado = ?, retroalimentacion = ?
        WHERE id = ?`,
        [estado, retroalimentacion || null, id]
      );
    }

    // Si se aprueba, asignar XP al estudiante
    if (estado === 'aprobada') {
      const xpGanado = evaluacion.puntos_experiencia || 0;

      // Actualizar experiencia del usuario
      await connection.query(
        'UPDATE usuarios SET experiencia = experiencia + ? WHERE rut = ?',
        [xpGanado, evaluacion.estudiante_rut]
      );

      // Calcular y actualizar el nivel
      const [usuarioActualizado] = await connection.query(
        'SELECT experiencia FROM usuarios WHERE rut = ?',
        [evaluacion.estudiante_rut]
      );

      const xpTotal = usuarioActualizado[0].experiencia;
      const nuevoNivel = Math.floor(xpTotal / 300) + 1;

      await connection.query(
        'UPDATE usuarios SET nivel = ? WHERE rut = ?',
        [nuevoNivel, evaluacion.estudiante_rut]
      );
    }

    // Crear o actualizar notificación para el estudiante
    const mensajeNotificacion = estado === 'aprobada'
      ? 'Tu misión ha sido aprobada por el Game Master'
      : estado === 'rechazada'
      ? 'Tu misión necesita revisión. Revisa la retroalimentación del Game Master'
      : 'Tu misión ha sido revisada por el Game Master';

    await connection.query(
      `INSERT INTO notificaciones (usuario_rut, tipo, titulo, mensaje, link)
      VALUES (?, 'evaluacion', ?, ?, ?)`,
      [
        evaluaciones[0].estudiante_rut,
        'Evaluación de misión',
        retroalimentacion || mensajeNotificacion,
        `/estudiante/misiones/${evaluaciones[0].mision_id}`
      ]
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

// Obtener cursos con evaluaciones del GM
const obtenerCursosConEvaluaciones = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    // Obtener cursos del GM con conteo de evaluaciones
    const [cursos] = await db.query(
      `SELECT
        c.id,
        c.nombre,
        c.codigo_acceso as codigo,
        'Secundaria' as categoria,
        COUNT(DISTINCT em.id) as totalEvaluaciones
      FROM cursos c
      LEFT JOIN misiones m ON c.id = m.curso_id AND m.creador_rut = ?
      LEFT JOIN estudiante_misiones em ON m.id = em.mision_id AND em.estado IN ('completada', 'revisando')
      WHERE c.gm_rut = ?
      GROUP BY c.id, c.nombre, c.codigo_acceso
      ORDER BY c.nombre`,
      [gmRut, gmRut]
    );

    res.json({
      success: true,
      cursos
    });
  } catch (error) {
    console.error('Error al obtener cursos con evaluaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cursos con evaluaciones',
      error: error.message
    });
  }
};

// Obtener evaluaciones de un curso específico
const obtenerEvaluacionesPorCurso = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;
    const { cursoId } = req.params;

    // Verificar que el curso pertenece al GM
    const [cursos] = await db.query(
      'SELECT id, nombre FROM cursos WHERE id = ? AND gm_rut = ?',
      [cursoId, gmRut]
    );

    if (cursos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    // Obtener evaluaciones del curso (misiones completadas por estudiantes)
    const [evaluaciones] = await db.query(
      `SELECT
        em.id,
        u.rut,
        u.nombre,
        c.nombre as curso,
        m.categoria,
        em.fecha_completado as fechaEntrega,
        CASE
          WHEN em.estado = 'completada' OR em.estado = 'revisando' THEN 'Pendiente'
          WHEN em.estado = 'aprobada' THEN 'Finalizado'
          ELSE 'Pendiente'
        END as estado,
        CASE
          WHEN em.fecha_completado >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN true
          ELSE false
        END as reciente,
        m.id as mision_id,
        m.titulo as mision_titulo,
        em.puntuacion,
        em.progreso
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      INNER JOIN usuarios u ON em.estudiante_rut = u.rut
      INNER JOIN cursos c ON m.curso_id = c.id
      WHERE c.id = ?
        AND c.gm_rut = ?
        AND em.estado IN ('completada', 'revisando', 'aprobada')
      ORDER BY em.fecha_completado DESC`,
      [cursoId, gmRut]
    );

    res.json({
      success: true,
      evaluaciones
    });
  } catch (error) {
    console.error('Error al obtener evaluaciones por curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener evaluaciones por curso',
      error: error.message
    });
  }
};

// Obtener estadísticas de evaluaciones del GM
const obtenerEstadisticas = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    const [estadisticas] = await db.query(
      `SELECT
        COUNT(*) as total_evaluaciones,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        COUNT(CASE WHEN estado = 'evaluada' THEN 1 END) as evaluadas,
        AVG(CASE WHEN estado = 'evaluada' THEN calificacion END) as promedio_calificaciones
      FROM evaluaciones
      WHERE gm_id = ?`,
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
  obtenerEvaluacionesPendientes,
  obtenerTodasEvaluaciones,
  obtenerEvaluacionPorId,
  evaluarMision,
  obtenerEstadisticas,
  obtenerCursosConEvaluaciones,
  obtenerEvaluacionesPorCurso
};
