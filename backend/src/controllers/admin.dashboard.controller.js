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

    // Obtener información real de respaldos desde configuracion_sistema
    const [configData] = await pool.query(`
      SELECT
        ultimo_respaldo,
        respaldo_automatico,
        frecuencia_respaldo,
        tamano_backup
      FROM configuracion_sistema
      WHERE id = 1
    `);

    const config = configData[0];
    let textoRespaldo = 'Nunca';

    if (config && config.ultimo_respaldo) {
      const ahora = new Date();
      const fechaRespaldo = new Date(config.ultimo_respaldo);
      const diffMs = ahora - fechaRespaldo;
      const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDias = Math.floor(diffHoras / 24);

      if (diffHoras < 1) {
        textoRespaldo = 'Hace menos de 1 hora';
      } else if (diffHoras < 24) {
        textoRespaldo = `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
      } else if (diffDias === 1) {
        textoRespaldo = 'Hace 1 día';
      } else {
        textoRespaldo = `Hace ${diffDias} días`;
      }
    }

    // Obtener tamaño de la base de datos
    const [dbSize] = await pool.query(`
      SELECT
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as tamano_mb
      FROM information_schema.TABLES
      WHERE table_schema = ?
    `, [process.env.DB_NAME || 'aprende_jugando']);

    // Contar usuarios activos en los últimos 7 días
    const [usuariosActivos] = await pool.query(`
      SELECT COUNT(*) as total
      FROM usuarios
      WHERE ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Obtener total de usuarios
    const [totalUsuarios] = await pool.query('SELECT COUNT(*) as total FROM usuarios');

    // Detectar alertas del sistema
    const alertas = [];

    // Alerta 1: Respaldo desactualizado (más de 7 días sin respaldo)
    if (config && config.ultimo_respaldo) {
      const fechaRespaldo = new Date(config.ultimo_respaldo);
      const diffDias = Math.floor((new Date() - fechaRespaldo) / (1000 * 60 * 60 * 24));

      if (diffDias > 7) {
        alertas.push({
          tipo: 'warning',
          mensaje: `El último respaldo fue hace ${diffDias} días`,
          icono: 'backup'
        });
      }
    } else if (!config || !config.ultimo_respaldo) {
      alertas.push({
        tipo: 'error',
        mensaje: 'No se ha generado ningún respaldo',
        icono: 'backup'
      });
    }

    // Alerta 2: Respaldo automático desactivado
    if (config && !config.respaldo_automatico) {
      alertas.push({
        tipo: 'info',
        mensaje: 'El respaldo automático está desactivado',
        icono: 'info'
      });
    }

    // Alerta 3: Base de datos grande (más de 500 MB)
    if (dbSize[0].tamano_mb > 500) {
      alertas.push({
        tipo: 'warning',
        mensaje: `Base de datos grande: ${dbSize[0].tamano_mb} MB`,
        icono: 'database'
      });
    }

    // Alerta 4: Baja actividad de usuarios (menos del 10% activos en los últimos 7 días)
    const porcentajeActivos = (usuariosActivos[0].total / totalUsuarios[0].total) * 100;
    if (totalUsuarios[0].total > 10 && porcentajeActivos < 10) {
      alertas.push({
        tipo: 'info',
        mensaje: `Solo ${usuariosActivos[0].total} de ${totalUsuarios[0].total} usuarios activos en 7 días`,
        icono: 'users'
      });
    }

    res.json({
      success: true,
      data: {
        baseDatos: dbOperativa ? 'Operativa' : 'Inactiva',
        respaldos: textoRespaldo,
        respaldoAutomatico: config ? config.respaldo_automatico : false,
        frecuenciaRespaldo: config ? config.frecuencia_respaldo : null,
        tamanoBackup: config ? config.tamano_backup : '0 MB',
        tamanoBaseDatos: `${dbSize[0].tamano_mb} MB`,
        usuariosActivos7Dias: usuariosActivos[0].total,
        totalUsuarios: totalUsuarios[0].total,
        alertas: alertas
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
