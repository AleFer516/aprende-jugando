const db = require('../db');

// Obtener estadísticas generales del dashboard
const obtenerEstadisticasDashboard = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    // Obtener estadísticas principales
    const [estadisticasPrincipales] = await db.query(
      `SELECT
        COUNT(DISTINCT ce.estudiante_rut) as estudiantesActivos,
        COUNT(DISTINCT m.id) as misionesAsignadas,
        COUNT(DISTINCT CASE WHEN ev.estado = 'pendiente' THEN ev.id END) as misionesPorRevisar
      FROM cursos c
      LEFT JOIN curso_estudiantes ce ON c.id = ce.curso_id
      LEFT JOIN misiones m ON c.id = m.curso_id
      LEFT JOIN evaluaciones ev ON m.id = ev.mision_id AND ev.gm_rut = ?
      WHERE c.gm_rut = ?`,
      [gmRut, gmRut]
    );

    // Calcular horas acumuladas (basado en tiempo de respuesta de estudiantes)
    const [horasAcumuladas] = await db.query(
      `SELECT
        COALESCE(SUM(er.tiempo_respuesta), 0) / 3600 as horas_totales
      FROM estudiante_respuestas er
      INNER JOIN actividades a ON er.actividad_id = a.id
      INNER JOIN misiones m ON a.mision_id = m.id
      WHERE m.gm_rut = ?`,
      [gmRut]
    );

    const estadisticas = {
      ...estadisticasPrincipales[0],
      horasAcumuladas: `${horasAcumuladas[0].horas_totales.toFixed(1)} h`
    };

    res.json({
      success: true,
      estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// Obtener misiones por revisar
const obtenerMisionesPorRevisar = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    const [misiones] = await db.query(
      `SELECT
        ev.id,
        ev.mision_id,
        u.nombre as estudiante,
        m.nombre as mision,
        em.fecha_completado as fechaEntrega
      FROM evaluaciones ev
      INNER JOIN usuarios u ON ev.estudiante_rut = u.rut
      INNER JOIN misiones m ON ev.mision_id = m.id
      LEFT JOIN estudiante_misiones em ON ev.estudiante_rut = em.estudiante_rut AND ev.mision_id = em.mision_id
      WHERE ev.gm_rut = ? AND ev.estado = 'pendiente'
      ORDER BY em.fecha_completado DESC
      LIMIT 10`,
      [gmRut]
    );

    res.json({
      success: true,
      misiones
    });
  } catch (error) {
    console.error('Error al obtener misiones por revisar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener misiones por revisar',
      error: error.message
    });
  }
};

// Obtener estado de avance por curso
const obtenerAvanceCursos = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    const [cursos] = await db.query(
      `SELECT
        c.id,
        c.nombre,
        COALESCE(AVG(CASE WHEN em.estado = 'Completada' THEN 100 ELSE em.progreso END), 0) as progreso
      FROM cursos c
      LEFT JOIN misiones m ON c.id = m.curso_id
      LEFT JOIN estudiante_misiones em ON m.id = em.mision_id
      WHERE c.gm_rut = ?
      GROUP BY c.id, c.nombre
      ORDER BY c.nombre`,
      [gmRut]
    );

    res.json({
      success: true,
      cursos
    });
  } catch (error) {
    console.error('Error al obtener avance de cursos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener avance de cursos',
      error: error.message
    });
  }
};

// Obtener misiones recientes
const obtenerMisionesRecientes = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    const [misiones] = await db.query(
      `SELECT
        m.id,
        m.nombre,
        m.created_at,
        CASE
          WHEN DATE(m.created_at) = CURDATE() THEN 'Hoy'
          WHEN DATE(m.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 'Ayer'
          WHEN m.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 'Esta semana'
          ELSE 'Hace más de una semana'
        END as fecha
      FROM misiones m
      WHERE m.gm_rut = ?
      ORDER BY m.created_at DESC
      LIMIT 5`,
      [gmRut]
    );

    res.json({
      success: true,
      misiones
    });
  } catch (error) {
    console.error('Error al obtener misiones recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener misiones recientes',
      error: error.message
    });
  }
};

// Obtener indicadores avanzados
const obtenerIndicadoresAvanzados = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    // Progreso promedio por misión
    const [progresoPromedio] = await db.query(
      `SELECT
        COALESCE(AVG(em.progreso), 0) as promedio
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE m.gm_rut = ?`,
      [gmRut]
    );

    // Horas semanales estudiadas (últimos 7 días)
    const [horasSemanales] = await db.query(
      `SELECT
        COALESCE(SUM(er.tiempo_respuesta), 0) / 3600 as horas
      FROM estudiante_respuestas er
      INNER JOIN actividades a ON er.actividad_id = a.id
      INNER JOIN misiones m ON a.mision_id = m.id
      WHERE m.gm_rut = ? AND er.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [gmRut]
    );

    // Categoría con mayor tasa de error
    const [categoriaErrores] = await db.query(
      `SELECT
        m.categoria,
        COUNT(CASE WHEN er.es_correcta = 0 THEN 1 END) as errores,
        COUNT(*) as total,
        (COUNT(CASE WHEN er.es_correcta = 0 THEN 1 END) / COUNT(*) * 100) as tasa_error
      FROM estudiante_respuestas er
      INNER JOIN actividades a ON er.actividad_id = a.id
      INNER JOIN misiones m ON a.mision_id = m.id
      WHERE m.gm_rut = ? AND m.categoria IS NOT NULL
      GROUP BY m.categoria
      ORDER BY tasa_error DESC
      LIMIT 1`,
      [gmRut]
    );

    // Calcular competitividad (basado en la dispersión de calificaciones)
    const [competitividad] = await db.query(
      `SELECT
        STDDEV(em.progreso) as desviacion
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE m.gm_rut = ? AND em.estado = 'Completada'`,
      [gmRut]
    );

    const desviacion = competitividad[0].desviacion || 0;
    let nivelCompetitividad = 'Baja';
    if (desviacion > 20) nivelCompetitividad = 'Alta';
    else if (desviacion > 10) nivelCompetitividad = 'Media';

    const indicadores = [
      {
        id: 1,
        nombre: "Progreso promedio por misión",
        descripcion: "Visualiza el avance promedio de todas las misiones asignadas",
        valor: `${Math.round(progresoPromedio[0].promedio)}%`
      },
      {
        id: 2,
        nombre: "Competitividad por categoría",
        descripcion: "Analiza el nivel de competencia entre estudiantes por cada categoría",
        valor: nivelCompetitividad
      },
      {
        id: 3,
        nombre: "Horas semanales estudiadas",
        descripcion: "Promedio de horas dedicadas al estudio por semana",
        valor: `${(horasSemanales[0].horas || 0).toFixed(1)} hrs`
      },
      {
        id: 4,
        nombre: "Dificultades con mayor tasa de error",
        descripcion: "Identifica los temas donde los estudiantes cometen más errores",
        valor: categoriaErrores.length > 0 ? categoriaErrores[0].categoria : 'N/A'
      }
    ];

    res.json({
      success: true,
      indicadores
    });
  } catch (error) {
    console.error('Error al obtener indicadores avanzados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener indicadores avanzados',
      error: error.message
    });
  }
};

// Obtener resumen completo del dashboard
const obtenerResumenDashboard = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    // Ejecutar todas las consultas en paralelo
    const [
      estadisticasResult,
      misionesRevisarResult,
      cursosResult,
      misionesRecientesResult,
      indicadoresResult
    ] = await Promise.all([
      // Estadísticas principales
      db.query(
        `SELECT
          COUNT(DISTINCT ce.estudiante_rut) as estudiantesActivos,
          COUNT(DISTINCT m.id) as misionesAsignadas,
          COUNT(DISTINCT CASE WHEN ev.estado = 'pendiente' THEN ev.id END) as misionesPorRevisar
        FROM cursos c
        LEFT JOIN curso_estudiantes ce ON c.id = ce.curso_id
        LEFT JOIN misiones m ON c.id = m.curso_id
        LEFT JOIN evaluaciones ev ON m.id = ev.mision_id AND ev.gm_rut = ?
        WHERE c.gm_rut = ?`,
        [gmRut, gmRut]
      ),
      // Misiones por revisar
      db.query(
        `SELECT
          ev.id,
          ev.mision_id,
          u.nombre as estudiante,
          m.nombre as mision,
          em.fecha_completado as fechaEntrega
        FROM evaluaciones ev
        INNER JOIN usuarios u ON ev.estudiante_rut = u.rut
        INNER JOIN misiones m ON ev.mision_id = m.id
        LEFT JOIN estudiante_misiones em ON ev.estudiante_rut = em.estudiante_rut AND ev.mision_id = em.mision_id
        WHERE ev.gm_rut = ? AND ev.estado = 'pendiente'
        ORDER BY em.fecha_completado DESC
        LIMIT 10`,
        [gmRut]
      ),
      // Avance de cursos
      db.query(
        `SELECT
          c.id,
          c.nombre,
          COALESCE(AVG(CASE WHEN em.estado = 'Completada' THEN 100 ELSE em.progreso END), 0) as progreso
        FROM cursos c
        LEFT JOIN misiones m ON c.id = m.curso_id
        LEFT JOIN estudiante_misiones em ON m.id = em.mision_id
        WHERE c.gm_rut = ?
        GROUP BY c.id, c.nombre
        ORDER BY c.nombre`,
        [gmRut]
      ),
      // Misiones recientes
      db.query(
        `SELECT
          m.id,
          m.nombre,
          CASE
            WHEN DATE(m.created_at) = CURDATE() THEN 'Hoy'
            WHEN DATE(m.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 'Ayer'
            WHEN m.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 'Esta semana'
            ELSE 'Hace más de una semana'
          END as fecha
        FROM misiones m
        WHERE m.gm_rut = ?
        ORDER BY m.created_at DESC
        LIMIT 5`,
        [gmRut]
      ),
      // Indicadores (solo progreso promedio y horas semanales)
      db.query(
        `SELECT
          COALESCE(AVG(em.progreso), 0) as progresoPromedio,
          COALESCE(SUM(CASE WHEN er.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN er.tiempo_respuesta ELSE 0 END), 0) / 3600 as horasSemanales
        FROM estudiante_misiones em
        INNER JOIN misiones m ON em.mision_id = m.id
        LEFT JOIN actividades a ON m.id = a.mision_id
        LEFT JOIN estudiante_respuestas er ON a.id = er.actividad_id
        WHERE m.gm_rut = ?`,
        [gmRut]
      )
    ]);

    const [[estadisticas]] = estadisticasResult;
    const [misionesPorRevisar] = misionesRevisarResult;
    const [estadoAvanceCursos] = cursosResult;
    const [misionesRecientes] = misionesRecientesResult;
    const [[indicadoresData]] = indicadoresResult;

    res.json({
      success: true,
      dashboard: {
        estadisticas: {
          ...estadisticas,
          horasAcumuladas: `${(indicadoresData.horasSemanales || 0).toFixed(1)} h`
        },
        misionesPorRevisar,
        estadoAvanceCursos,
        misionesRecientes,
        indicadoresAvanzados: [
          {
            id: 1,
            nombre: "Progreso promedio por misión",
            descripcion: "Visualiza el avance promedio de todas las misiones asignadas",
            valor: `${Math.round(indicadoresData.progresoPromedio)}%`
          },
          {
            id: 2,
            nombre: "Horas semanales estudiadas",
            descripcion: "Promedio de horas dedicadas al estudio por semana",
            valor: `${(indicadoresData.horasSemanales || 0).toFixed(1)} hrs`
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error al obtener resumen del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen del dashboard',
      error: error.message
    });
  }
};

module.exports = {
  obtenerEstadisticasDashboard,
  obtenerMisionesPorRevisar,
  obtenerAvanceCursos,
  obtenerMisionesRecientes,
  obtenerIndicadoresAvanzados,
  obtenerResumenDashboard
};
