const db = require('../db');

// Obtener todos los logros (desbloqueados y bloqueados)
const obtenerLogros = async (req, res) => {
  try {
    const estudianteId = req.usuario.id;

    // Obtener todos los logros con estado de desbloqueo
    const [logros] = await db.query(
      `SELECT
        l.id,
        l.nombre,
        l.descripcion,
        l.icono,
        l.requisito_tipo,
        l.requisito_valor,
        l.xp_recompensa,
        el.fecha_desbloqueo,
        CASE WHEN el.id IS NOT NULL THEN 1 ELSE 0 END as desbloqueado
      FROM logros l
      LEFT JOIN estudiante_logros el ON l.id = el.logro_id AND el.estudiante_id = ?
      ORDER BY desbloqueado DESC, l.id`,
      [estudianteId]
    );

    // Obtener estadísticas del estudiante para calcular progreso
    const [estadisticas] = await db.query(
      `SELECT
        u.nivel,
        u.experiencia,
        COUNT(CASE WHEN em.estado = 'Completada' THEN 1 END) as misiones_completadas
      FROM usuarios u
      LEFT JOIN estudiante_misiones em ON u.id = em.estudiante_id
      WHERE u.id = ?
      GROUP BY u.id`,
      [estudianteId]
    );

    const stats = estadisticas[0];

    // Calcular progreso de cada logro
    const logrosConProgreso = logros.map(logro => {
      let progreso = 0;
      let requisito = logro.requisito_valor;

      switch (logro.requisito_tipo) {
        case 'nivel':
          progreso = Math.min(100, Math.round((stats.nivel / logro.requisito_valor) * 100));
          break;
        case 'misiones':
          progreso = Math.min(100, Math.round((stats.misiones_completadas / logro.requisito_valor) * 100));
          break;
        case 'xp':
          progreso = Math.min(100, Math.round((stats.experiencia / logro.requisito_valor) * 100));
          break;
        default:
          progreso = logro.desbloqueado ? 100 : 0;
      }

      return {
        ...logro,
        progreso,
        requisito: `${logro.requisito_tipo}: ${logro.requisito_valor}`
      };
    });

    // Contar logros desbloqueados
    const totalLogros = logros.length;
    const logrosDesbloqueados = logros.filter(l => l.desbloqueado).length;

    res.json({
      success: true,
      logros: logrosConProgreso,
      estadisticas: {
        total: totalLogros,
        desbloqueados: logrosDesbloqueados,
        porcentaje: Math.round((logrosDesbloqueados / totalLogros) * 100)
      }
    });
  } catch (error) {
    console.error('Error al obtener logros:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener logros',
      error: error.message
    });
  }
};

// Verificar y desbloquear logros automáticamente
const verificarLogros = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const estudianteId = req.usuario.id;

    // Obtener estadísticas del estudiante
    const [estadisticas] = await connection.query(
      `SELECT
        u.nivel,
        u.experiencia,
        COUNT(CASE WHEN em.estado = 'Completada' THEN 1 END) as misiones_completadas
      FROM usuarios u
      LEFT JOIN estudiante_misiones em ON u.id = em.estudiante_id
      WHERE u.id = ?
      GROUP BY u.id`,
      [estudianteId]
    );

    const stats = estadisticas[0];

    // Obtener logros que aún no ha desbloqueado
    const [logrosPendientes] = await connection.query(
      `SELECT l.*
      FROM logros l
      LEFT JOIN estudiante_logros el ON l.id = el.logro_id AND el.estudiante_id = ?
      WHERE el.id IS NULL`,
      [estudianteId]
    );

    const logrosDesbloqueados = [];

    // Verificar cada logro pendiente
    for (const logro of logrosPendientes) {
      let cumple = false;

      switch (logro.requisito_tipo) {
        case 'nivel':
          cumple = stats.nivel >= logro.requisito_valor;
          break;
        case 'misiones':
          cumple = stats.misiones_completadas >= logro.requisito_valor;
          break;
        case 'xp':
          cumple = stats.experiencia >= logro.requisito_valor;
          break;
      }

      if (cumple) {
        // Desbloquear logro
        await connection.query(
          'INSERT INTO estudiante_logros (estudiante_id, logro_id) VALUES (?, ?)',
          [estudianteId, logro.id]
        );

        // Otorgar XP de recompensa
        if (logro.xp_recompensa > 0) {
          await connection.query(
            'UPDATE usuarios SET experiencia = experiencia + ? WHERE id = ?',
            [logro.xp_recompensa, estudianteId]
          );
        }

        logrosDesbloqueados.push(logro);
      }
    }

    await connection.commit();

    res.json({
      success: true,
      logrosDesbloqueados,
      mensaje: logrosDesbloqueados.length > 0
        ? `¡Felicitaciones! Has desbloqueado ${logrosDesbloqueados.length} logro(s)`
        : 'No hay nuevos logros desbloqueados'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al verificar logros:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar logros',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  obtenerLogros,
  verificarLogros
};
