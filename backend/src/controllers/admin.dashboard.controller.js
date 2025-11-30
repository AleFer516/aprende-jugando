const pool = require('../db');

// Obtener estadísticas del dashboard de admin
const getEstadisticasDashboard = async (req, res) => {
  try {
    // Contar total de usuarios
    const [usuariosCount] = await pool.query(
      'SELECT COUNT(*) as total FROM usuarios'
    );

    // Contar instituciones únicas
    const [institucionesCount] = await pool.query(
      'SELECT COUNT(DISTINCT institucion) as total FROM usuarios WHERE institucion IS NOT NULL'
    );

    // Contar misiones totales
    const [misionesCount] = await pool.query(
      'SELECT COUNT(*) as total FROM misiones'
    );

    // Obtener porcentaje de misiones completadas
    const [misionesCompletadas] = await pool.query(`
      SELECT
        ROUND((COUNT(CASE WHEN estado = 'Completada' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 0) as porcentaje
      FROM estudiante_misiones
    `);

    // Contar estudiantes activos (que han ingresado en los últimos 30 días)
    const [estudiantesActivos] = await pool.query(`
      SELECT COUNT(*) as total
      FROM usuarios
      WHERE rol = 'estudiante'
      AND ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    res.json({
      success: true,
      data: {
        usuarios: usuariosCount[0].total || 0,
        instituciones: institucionesCount[0].total || 0,
        misionesTotales: misionesCount[0].total || 0,
        misionesCompletadas: misionesCompletadas[0].porcentaje || 0,
        estudiantesActivos: estudiantesActivos[0].total || 0
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del dashboard',
      error: error.message
    });
  }
};

// Obtener registro de actividad
const getRegistroActividad = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [actividades] = await pool.query(`
      SELECT
        id,
        fecha,
        titulo,
        usuario,
        hora,
        tipo
      FROM actividad_admin
      ORDER BY fecha DESC, hora DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({
      success: true,
      data: actividades
    });
  } catch (error) {
    console.error('Error al obtener registro de actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener registro de actividad',
      error: error.message
    });
  }
};

// Obtener estado del sistema
const getEstadoSistema = async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    const [dbStatus] = await pool.query('SELECT 1 as status');
    const dbOperativa = dbStatus[0].status === 1;

    // Obtener último respaldo (simulado - esto debería venir de tu sistema de respaldos)
    const ultimoRespaldo = "Hace 2 días";

    res.json({
      success: true,
      data: {
        baseDatos: dbOperativa ? 'Operativa' : 'Inactiva',
        respaldos: ultimoRespaldo
      }
    });
  } catch (error) {
    console.error('Error al obtener estado del sistema:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado del sistema',
      error: error.message
    });
  }
};

module.exports = {
  getEstadisticasDashboard,
  getRegistroActividad,
  getEstadoSistema
};
