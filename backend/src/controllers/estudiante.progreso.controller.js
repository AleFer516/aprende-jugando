const db = require('../db');

// Obtener progreso completo del estudiante
const obtenerProgreso = async (req, res) => {
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
    const xpSiguienteNivel = estudiante.nivel * 300;
    const tituloNivel = obtenerTituloNivel(estudiante.nivel);

    // Estado de misiones
    const [estadoMisiones] = await db.query(
      `SELECT
        COUNT(CASE WHEN estado = 'completada' THEN 1 END) as completadas,
        COUNT(CASE WHEN estado = 'en_progreso' THEN 1 END) as enProgreso,
        COUNT(CASE WHEN estado = 'no_iniciada' THEN 1 END) as pendientes,
        COUNT(*) as total
      FROM estudiante_misiones
      WHERE estudiante_rut = ?`,
      [estudianteRut]
    );

    // Métricas generales
    const [metricas] = await db.query(
      `SELECT
        SUM(CASE WHEN em.estado = 'completada' THEN m.puntos_experiencia ELSE 0 END) as xpGanado,
        COALESCE(SUM(CASE WHEN er.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN er.tiempo_respuesta ELSE 0 END) / 3600, 0) as horasSemanales
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      LEFT JOIN actividades a ON m.id = a.mision_id
      LEFT JOIN estudiante_respuestas er ON a.id = er.actividad_id AND er.estudiante_rut = em.estudiante_rut
      WHERE em.estudiante_rut = ?`,
      [estudianteRut]
    );

    // Estadísticas de aprendizaje por tema (basado en categorías)
    const [estadisticasAprendizaje] = await db.query(
      `SELECT
        m.categoria as tema,
        AVG(em.progreso) as progreso
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE em.estudiante_rut = ? AND m.categoria IS NOT NULL
      GROUP BY m.categoria
      ORDER BY progreso DESC
      LIMIT 5`,
      [estudianteRut]
    );

    // Colores para las estadísticas
    const colores = ['#00a7d5', '#0891b2', '#06b6d4', '#0e7490', '#155e75'];
    const estadisticasConColor = estadisticasAprendizaje.map((est, index) => ({
      ...est,
      progreso: Math.round(est.progreso),
      color: colores[index % colores.length]
    }));

    // Historial de progreso mensual (últimos 6 meses)
    const [historialProgreso] = await db.query(
      `SELECT
        DATE_FORMAT(em.fecha_completado, '%Y-%m') as mes,
        COUNT(*) as misiones_completadas,
        SUM(m.puntos_experiencia) as xp_ganado
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE em.estudiante_rut = ? AND em.estado = 'completada' AND em.fecha_completado >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(em.fecha_completado, '%Y-%m')
      ORDER BY mes`,
      [estudianteRut]
    );

    res.json({
      success: true,
      progreso: {
        estudiante: {
          ...estudiante,
          tituloNivel,
          xpActual: estudiante.experiencia || 0,
          xpSiguienteNivel,
          nivel: estudiante.nivel || 1
        },
        estadoMisiones: estadoMisiones[0],
        metricas: {
          totalMisiones: estadoMisiones[0].total || 0,
          misionesCompletadas: estadoMisiones[0].completadas || 0,
          tiempoEstudio: `${Number(metricas[0]?.horasSemanales || 0).toFixed(1)}h`,
          xpGanado: metricas[0]?.xpGanado || 0
        },
        estadisticasAprendizaje: estadisticasConColor,
        historialProgreso
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

// Obtener ranking del estudiante
const obtenerRanking = async (req, res) => {
  try {
    const estudianteRut = req.usuario.rut;

    // Obtener ranking general por experiencia
    const [ranking] = await db.query(
      `SELECT
        u.rut,
        u.nombre,
        u.nivel,
        u.experiencia,
        RANK() OVER (ORDER BY u.experiencia DESC) as posicion
      FROM usuarios u
      INNER JOIN curso_estudiantes ce ON u.rut = ce.estudiante_rut
      WHERE u.rol = 'estudiante'
        AND ce.curso_id IN (
          SELECT curso_id FROM curso_estudiantes WHERE estudiante_rut = ?
        )
      ORDER BY u.experiencia DESC
      LIMIT 10`,
      [estudianteRut]
    );

    // Encontrar la posición del estudiante actual
    const posicionEstudiante = ranking.findIndex(r => r.rut === estudianteRut);

    res.json({
      success: true,
      ranking: {
        topEstudiantes: ranking,
        miPosicion: posicionEstudiante >= 0 ? posicionEstudiante + 1 : null
      }
    });
  } catch (error) {
    console.error('Error al obtener ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ranking',
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
  obtenerProgreso,
  obtenerRanking
};
