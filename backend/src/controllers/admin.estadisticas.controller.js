const pool = require('../db');

// Obtener estadísticas globales completas
const getEstadisticasGlobales = async (req, res) => {
  try {
    // Total de usuarios
    const [totalUsuarios] = await pool.query(
      'SELECT COUNT(*) as total FROM usuarios'
    );

    // Total de estudiantes
    const [totalEstudiantes] = await pool.query(
      "SELECT COUNT(*) as total FROM usuarios WHERE rol = 'estudiante'"
    );

    // Total de GMs
    const [totalGMs] = await pool.query(
      "SELECT COUNT(*) as total FROM usuarios WHERE rol = 'gm'"
    );

    // Total de misiones
    const [totalMisiones] = await pool.query(
      'SELECT COUNT(*) as total FROM misiones'
    );

    // Instituciones registradas
    const [totalInstituciones] = await pool.query(
      'SELECT COUNT(DISTINCT institucion) as total FROM usuarios WHERE institucion IS NOT NULL'
    );

    // Distribución de roles
    const [distribucionRoles] = await pool.query(`
      SELECT
        rol,
        COUNT(*) as cantidad
      FROM usuarios
      GROUP BY rol
    `);

    // Misiones por categoría
    const [misionesPorCategoria] = await pool.query(`
      SELECT
        categoria,
        COUNT(*) as cantidad
      FROM misiones
      WHERE categoria IS NOT NULL
      GROUP BY categoria
    `);

    // Actividad semanal (últimos 7 días)
    const [actividadSemanal] = await pool.query(`
      SELECT
        DAYNAME(created_at) as dia_nombre,
        DATE_FORMAT(created_at, '%a') as dia_corto,
        COUNT(*) as total
      FROM usuarios
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at), DAYNAME(created_at), DATE_FORMAT(created_at, '%a')
      ORDER BY DATE(created_at) ASC
    `);

    // Actividad mensual (últimos 6 meses)
    const [actividadMensual] = await pool.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') as mes,
        DATE_FORMAT(created_at, '%b') as mes_corto,
        COUNT(*) as total
      FROM usuarios
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b')
      ORDER BY mes ASC
    `);

    // Progreso de estudiantes
    const [progresoEstudiantes] = await pool.query(`
      SELECT
        COUNT(DISTINCT em.estudiante_rut) as total_estudiantes,
        COUNT(CASE WHEN em.estado = 'completada' THEN 1 END) as misiones_completadas,
        COUNT(CASE WHEN em.estado = 'en_progreso' THEN 1 END) as misiones_en_progreso,
        COUNT(CASE WHEN em.estado = 'no_iniciada' THEN 1 END) as misiones_pendientes
      FROM estudiante_misiones em
    `);

    // Top 5 estudiantes por XP
    const [topEstudiantes] = await pool.query(`
      SELECT
        rut,
        nombre,
        experiencia,
        nivel
      FROM usuarios
      WHERE rol = 'estudiante'
      ORDER BY experiencia DESC
      LIMIT 5
    `);

    // Calcular distribución de roles con porcentajes
    const totalUsers = totalUsuarios[0].total || 0;
    const gmCount = distribucionRoles.find(r => r.rol === 'gm')?.cantidad || 0;
    const estudianteCount = distribucionRoles.find(r => r.rol === 'estudiante')?.cantidad || 0;

    res.json({
      success: true,
      data: {
        totalUsuarios: totalUsers,
        totalEstudiantes: totalEstudiantes[0].total || 0,
        totalGMs: totalGMs[0].total || 0,
        totalMisiones: totalMisiones[0].total || 0,
        totalInstituciones: totalInstituciones[0].total || 0,
        distribucionRoles: {
          gm: gmCount,
          estudiante: estudianteCount,
          porcentajeGM: totalUsers > 0 ? Math.round((gmCount / totalUsers) * 100) : 0,
          porcentajeEstudiante: totalUsers > 0 ? Math.round((estudianteCount / totalUsers) * 100) : 0
        },
        misionesPorCategoria: misionesPorCategoria.map(m => ({
          categoria: m.categoria,
          total: m.cantidad
        })),
        actividadSemanal: actividadSemanal.map(a => ({
          dia: a.dia_corto,
          total: a.total
        })),
        actividadMensual: actividadMensual.map(a => ({
          mes: a.mes_corto,
          total: a.total
        })),
        progresoEstudiantes: {
          totalEstudiantes: progresoEstudiantes[0]?.total_estudiantes || 0,
          completadas: progresoEstudiantes[0]?.misiones_completadas || 0,
          enProgreso: progresoEstudiantes[0]?.misiones_en_progreso || 0,
          pendientes: progresoEstudiantes[0]?.misiones_pendientes || 0
        },
        topEstudiantes: topEstudiantes
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas globales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas globales',
      error: error.message
    });
  }
};

module.exports = {
  getEstadisticasGlobales
};
