const db = require('../db');

// Obtener perfil del GM
const obtenerPerfil = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    // Obtener información básica del GM
    const [usuarios] = await db.query(
      'SELECT rut, nombre, email, avatar, telefono, created_at, ultimo_acceso FROM usuarios WHERE rut = ?',
      [gmRut]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const gm = usuarios[0];

    // Obtener estadísticas del GM
    const [estadisticas] = await db.query(
      `SELECT
        COUNT(DISTINCT c.id) as total_cursos,
        COUNT(DISTINCT m.id) as total_misiones,
        COUNT(DISTINCT ce.estudiante_rut) as total_estudiantes,
        COUNT(DISTINCT CASE WHEN ev.estado = 'evaluada' THEN ev.id END) as total_evaluaciones
      FROM usuarios u
      LEFT JOIN cursos c ON u.rut = c.gm_rut
      LEFT JOIN misiones m ON u.rut = m.creador_rut
      LEFT JOIN curso_estudiantes ce ON c.id = ce.curso_id
      LEFT JOIN evaluaciones ev ON u.rut = ev.gm_rut
      WHERE u.rut = ?`,
      [gmRut]
    );

    // Obtener cursos del GM
    const [cursos] = await db.query(
      `SELECT
        c.id,
        c.nombre,
        COUNT(DISTINCT ce.estudiante_rut) as estudiantes,
        COUNT(DISTINCT m.id) as misiones
      FROM cursos c
      LEFT JOIN curso_estudiantes ce ON c.id = ce.curso_id
      LEFT JOIN misiones m ON c.id = m.curso_id
      WHERE c.gm_rut = ?
      GROUP BY c.id, c.nombre
      ORDER BY c.created_at DESC`,
      [gmRut]
    );

    // Obtener actividad reciente
    const [actividadReciente] = await db.query(
      `(SELECT
        'mision' as tipo,
        m.titulo as descripcion,
        m.created_at as fecha
      FROM misiones m
      WHERE m.creador_rut = ?
      ORDER BY m.created_at DESC
      LIMIT 5)
      UNION ALL
      (SELECT
        'evaluacion' as tipo,
        CONCAT('Evaluó a ', u.nombre, ' en ', m.titulo) as descripcion,
        ev.updated_at as fecha
      FROM evaluaciones ev
      INNER JOIN usuarios u ON ev.estudiante_rut = u.rut
      INNER JOIN misiones m ON ev.mision_id = m.id
      WHERE ev.gm_rut = ? AND ev.estado = 'evaluada'
      ORDER BY ev.updated_at DESC
      LIMIT 5)
      ORDER BY fecha DESC
      LIMIT 10`,
      [gmRut, gmRut]
    );

    res.json({
      success: true,
      perfil: {
        ...gm,
        estadisticas: estadisticas[0],
        cursos,
        actividadReciente
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

// Actualizar perfil del GM
const actualizarPerfil = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;
    const { nombre, email, avatar } = req.body;

    // Validaciones
    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y email son requeridos'
      });
    }

    // Verificar si el email ya existe (excepto el del usuario actual)
    const [usuariosExistentes] = await db.query(
      'SELECT rut FROM usuarios WHERE email = ? AND rut != ?',
      [email, gmRut]
    );

    if (usuariosExistentes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está en uso'
      });
    }

    // Actualizar perfil
    await db.query(
      'UPDATE usuarios SET nombre = ?, email = ?, avatar = ? WHERE rut = ?',
      [nombre, email, avatar || null, gmRut]
    );

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
};

// Obtener estadísticas detalladas del GM
const obtenerEstadisticasDetalladas = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    // Estadísticas por curso
    const [estadisticasCursos] = await db.query(
      `SELECT
        c.id,
        c.nombre as curso,
        COUNT(DISTINCT ce.estudiante_rut) as estudiantes,
        COUNT(DISTINCT m.id) as misiones,
        COUNT(DISTINCT CASE WHEN em.estado = 'Completada' THEN em.id END) as misiones_completadas,
        COALESCE(AVG(CASE WHEN ev.estado = 'evaluada' THEN ev.calificacion END), 0) as promedio_calificaciones
      FROM cursos c
      LEFT JOIN curso_estudiantes ce ON c.id = ce.curso_id
      LEFT JOIN misiones m ON c.id = m.curso_id
      LEFT JOIN estudiante_misiones em ON m.id = em.mision_id
      LEFT JOIN evaluaciones ev ON m.id = ev.mision_id AND ev.gm_rut = ?
      WHERE c.gm_rut = ?
      GROUP BY c.id, c.nombre`,
      [gmRut, gmRut]
    );

    // Distribución de misiones por dificultad
    const [distribucionDificultad] = await db.query(
      `SELECT
        dificultad,
        COUNT(*) as cantidad
      FROM misiones
      WHERE creador_rut = ?
      GROUP BY dificultad`,
      [gmRut]
    );

    // Actividad mensual (últimos 6 meses)
    const [actividadMensual] = await db.query(
      `SELECT
        DATE_FORMAT(created_at, '%Y-%m') as mes,
        COUNT(*) as misiones_creadas
      FROM misiones
      WHERE creador_rut = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY mes`,
      [gmRut]
    );

    // Tasa de completitud
    const [tasaCompletitud] = await db.query(
      `SELECT
        COUNT(*) as total_asignadas,
        COUNT(CASE WHEN estado = 'Completada' THEN 1 END) as completadas,
        (COUNT(CASE WHEN estado = 'Completada' THEN 1 END) / COUNT(*) * 100) as tasa_completitud
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE m.creador_rut = ?`,
      [gmRut]
    );

    res.json({
      success: true,
      estadisticas: {
        cursos: estadisticasCursos,
        distribucionDificultad,
        actividadMensual,
        tasaCompletitud: tasaCompletitud[0]
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas detalladas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas detalladas',
      error: error.message
    });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  obtenerEstadisticasDetalladas
};
