const db = require('../db');

// Obtener dashboard completo del estudiante
const obtenerDashboard = async (req, res) => {
  try {
    const estudianteId = req.usuario.id;

    // Información del estudiante
    const [estudiantes] = await db.query(
      'SELECT id, nombre, nivel, experiencia FROM usuarios WHERE id = ?',
      [estudianteId]
    );

    if (estudiantes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    const estudiante = estudiantes[0];

    // Calcular XP para siguiente nivel (fórmula: nivel * 300)
    const xpSiguienteNivel = estudiante.nivel * 300;
    const tituloNivel = obtenerTituloNivel(estudiante.nivel);

    // Contar misiones para desbloquear siguiente nivel
    const [misionesParaDesbloquear] = await db.query(
      `SELECT
        (? - COUNT(CASE WHEN estado = 'Completada' THEN 1 END)) as faltan
      FROM estudiante_misiones
      WHERE estudiante_id = ?`,
      [estudiante.nivel * 2, estudianteId]
    );

    // Obtener logros recientes (últimos 3)
    const [logrosRecientes] = await db.query(
      `SELECT
        l.id,
        l.nombre as titulo,
        l.descripcion,
        el.fecha_desbloqueo as fecha
      FROM estudiante_logros el
      INNER JOIN logros l ON el.logro_id = l.id
      WHERE el.estudiante_id = ?
      ORDER BY el.fecha_desbloqueo DESC
      LIMIT 3`,
      [estudianteId]
    );

    // Obtener misiones del estudiante
    const [tusMisiones] = await db.query(
      `SELECT
        m.id,
        m.nombre,
        m.dificultad,
        m.xp_recompensa as xp,
        em.estado,
        em.progreso
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE em.estudiante_id = ?
      ORDER BY
        CASE em.estado
          WHEN 'En progreso' THEN 1
          WHEN 'Pendiente' THEN 2
          WHEN 'Completada' THEN 3
        END,
        em.updated_at DESC
      LIMIT 6`,
      [estudianteId]
    );

    // Obtener actividad reciente
    const [actividadReciente] = await db.query(
      `(SELECT
        'mision' as tipo,
        CONCAT('Completaste la misión') as titulo,
        m.nombre as descripcion,
        em.fecha_completado as fecha
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE em.estudiante_id = ? AND em.estado = 'Completada'
      ORDER BY em.fecha_completado DESC
      LIMIT 3)
      UNION ALL
      (SELECT
        'asignacion' as tipo,
        m.nombre as titulo,
        'El Game Master te asignó una nueva misión' as descripcion,
        em.created_at as fecha
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE em.estudiante_id = ? AND em.estado = 'Pendiente'
      ORDER BY em.created_at DESC
      LIMIT 2)
      ORDER BY fecha DESC
      LIMIT 5`,
      [estudianteId, estudianteId]
    );

    res.json({
      success: true,
      dashboard: {
        estudiante: {
          ...estudiante,
          tituloNivel,
          xpActual: estudiante.experiencia,
          xpSiguienteNivel,
          misionesParaDesbloquear: Math.max(0, misionesParaDesbloquear[0].faltan)
        },
        logrosRecientes,
        tusMisiones,
        actividadReciente
      }
    });
  } catch (error) {
    console.error('Error al obtener dashboard del estudiante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener dashboard',
      error: error.message
    });
  }
};

// Función auxiliar para obtener título según el nivel
function obtenerTituloNivel(nivel) {
  if (nivel >= 20) return 'Maestro del conocimiento';
  if (nivel >= 15) return 'Sabio erudito';
  if (nivel >= 10) return 'Investigador avanzado';
  if (nivel >= 5) return 'Explorador del saber';
  if (nivel >= 3) return 'Aprendiz curioso';
  return 'Novato';
}

module.exports = {
  obtenerDashboard
};
