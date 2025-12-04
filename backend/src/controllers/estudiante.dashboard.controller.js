const db = require('../db');

// Obtener dashboard completo del estudiante
const obtenerDashboard = async (req, res) => {
  try {
    const estudianteRut = req.usuario.rut;

    // Información del estudiante
    const [estudiantes] = await db.query(
      'SELECT rut, nombre, nivel, experiencia FROM usuarios WHERE rut = ?',
      [estudianteRut]
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
        (? - COUNT(CASE WHEN estado = 'completada' THEN 1 END)) as faltan
      FROM estudiante_misiones
      WHERE estudiante_rut = ?`,
      [estudiante.nivel * 2, estudianteRut]
    );

    // Obtener logros recientes (últimos 2)
    const [logrosRecientes] = await db.query(
      `SELECT
        l.id,
        l.nombre as titulo,
        l.descripcion,
        el.obtenido_at as fecha
      FROM estudiante_logros el
      INNER JOIN logros l ON el.logro_id = l.id
      WHERE el.estudiante_rut = ?
      ORDER BY el.obtenido_at DESC
      LIMIT 2`,
      [estudianteRut]
    );

    // Obtener misiones del estudiante (máximo 3)
    const [tusMisiones] = await db.query(
      `SELECT
        m.id,
        m.titulo as nombre,
        m.dificultad,
        m.puntos_experiencia as xp,
        em.estado,
        em.progreso
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE em.estudiante_rut = ?
      ORDER BY
        CASE em.estado
          WHEN 'en_progreso' THEN 1
          WHEN 'no_iniciada' THEN 2
          WHEN 'completada' THEN 3
        END,
        em.updated_at DESC
      LIMIT 3`,
      [estudianteRut]
    );

    // Obtener actividad reciente
    const [actividadReciente] = await db.query(
      `(SELECT
        'mision' as tipo,
        CONCAT('Completaste la misión') as titulo,
        m.titulo as descripcion,
        em.fecha_completado as fecha
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE em.estudiante_rut = ? AND em.estado = 'completada'
      ORDER BY em.fecha_completado DESC
      LIMIT 3)
      UNION ALL
      (SELECT
        'asignacion' as tipo,
        m.titulo as titulo,
        'El Game Master te asignó una nueva misión' as descripcion,
        em.created_at as fecha
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE em.estudiante_rut = ? AND em.estado = 'no_iniciada'
      ORDER BY em.created_at DESC
      LIMIT 2)
      ORDER BY fecha DESC
      LIMIT 5`,
      [estudianteRut, estudianteRut]
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
