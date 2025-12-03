const db = require('../db');

// Obtener todos los logros (desbloqueados y bloqueados)
const obtenerLogros = async (req, res) => {
  try {
    const estudianteRut = req.usuario.rut;

    // Obtener todos los logros con estado de desbloqueo
    const [logros] = await db.query(
      `SELECT
        l.id,
        l.nombre,
        l.descripcion,
        l.icono,
        l.condicion as requisito_tipo,
        l.valor_requerido as requisito_valor,
        l.puntos_experiencia as xp_recompensa,
        el.obtenido_at as fecha_desbloqueo,
        CASE WHEN el.id IS NOT NULL THEN 1 ELSE 0 END as desbloqueado
      FROM logros l
      LEFT JOIN estudiante_logros el ON l.id = el.logro_id AND el.estudiante_rut = ?
      ORDER BY desbloqueado DESC, l.id`,
      [estudianteRut]
    );

    // Obtener estadísticas del estudiante para calcular progreso
    const [estadisticas] = await db.query(
      `SELECT
        u.nivel,
        u.experiencia,
        u.monedas,
        COUNT(CASE WHEN em.estado = 'completada' THEN 1 END) as misiones_completadas
      FROM usuarios u
      LEFT JOIN estudiante_misiones em ON u.rut = em.estudiante_rut
      WHERE u.rut = ?
      GROUP BY u.rut`,
      [estudianteRut]
    );

    const stats = estadisticas[0] || { nivel: 1, experiencia: 0, monedas: 0, misiones_completadas: 0 };

    // Calcular progreso de cada logro
    const logrosConProgreso = logros.map(logro => {
      let progreso = 0;
      let progresoActual = 0;
      let requisito = logro.requisito_valor;

      switch (logro.requisito_tipo) {
        case 'nivel':
          progresoActual = stats.nivel;
          progreso = Math.min(100, Math.round((stats.nivel / logro.requisito_valor) * 100));
          break;
        case 'misiones_completadas':
          progresoActual = stats.misiones_completadas;
          progreso = Math.min(100, Math.round((stats.misiones_completadas / logro.requisito_valor) * 100));
          break;
        case 'experiencia':
          progresoActual = stats.experiencia;
          progreso = Math.min(100, Math.round((stats.experiencia / logro.requisito_valor) * 100));
          break;
        case 'monedas':
          progresoActual = stats.monedas;
          progreso = Math.min(100, Math.round((stats.monedas / logro.requisito_valor) * 100));
          break;
        default:
          progreso = logro.desbloqueado ? 100 : 0;
      }

      return {
        id: logro.id,
        nombre: logro.nombre,
        descripcion: logro.descripcion,
        icono: logro.icono,
        requisito_tipo: logro.requisito_tipo,
        requisito_valor: logro.requisito_valor,
        xp_recompensa: logro.xp_recompensa,
        desbloqueado: Boolean(logro.desbloqueado),
        fecha_desbloqueo: logro.fecha_desbloqueo,
        progreso,
        progresoActual,
        requisito: formatearRequisito(logro.requisito_tipo, logro.requisito_valor)
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
        porcentaje: totalLogros > 0 ? Math.round((logrosDesbloqueados / totalLogros) * 100) : 0
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

// Función auxiliar para formatear requisitos
function formatearRequisito(tipo, valor) {
  switch (tipo) {
    case 'nivel':
      return `Alcanzar nivel ${valor}`;
    case 'misiones_completadas':
      return `Completar ${valor} misión${valor > 1 ? 'es' : ''}`;
    case 'experiencia':
      return `Ganar ${valor} XP`;
    case 'monedas':
      return `Obtener ${valor} moneda${valor > 1 ? 's' : ''}`;
    default:
      return `${tipo}: ${valor}`;
  }
}

// Verificar y desbloquear logros automáticamente
const verificarLogros = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const estudianteRut = req.usuario.rut;

    // Obtener estadísticas del estudiante
    const [estadisticas] = await connection.query(
      `SELECT
        u.nivel,
        u.experiencia,
        u.monedas,
        COUNT(CASE WHEN em.estado = 'completada' THEN 1 END) as misiones_completadas
      FROM usuarios u
      LEFT JOIN estudiante_misiones em ON u.rut = em.estudiante_rut
      WHERE u.rut = ?
      GROUP BY u.rut`,
      [estudianteRut]
    );

    const stats = estadisticas[0] || { nivel: 1, experiencia: 0, monedas: 0, misiones_completadas: 0 };

    // Obtener logros que aún no ha desbloqueado
    const [logrosPendientes] = await connection.query(
      `SELECT l.*
      FROM logros l
      LEFT JOIN estudiante_logros el ON l.id = el.logro_id AND el.estudiante_rut = ?
      WHERE el.id IS NULL`,
      [estudianteRut]
    );

    const logrosDesbloqueados = [];

    // Verificar cada logro pendiente
    for (const logro of logrosPendientes) {
      let cumple = false;

      switch (logro.condicion) {
        case 'nivel':
          cumple = stats.nivel >= logro.valor_requerido;
          break;
        case 'misiones_completadas':
          cumple = stats.misiones_completadas >= logro.valor_requerido;
          break;
        case 'experiencia':
          cumple = stats.experiencia >= logro.valor_requerido;
          break;
        case 'monedas':
          cumple = stats.monedas >= logro.valor_requerido;
          break;
      }

      if (cumple) {
        // Desbloquear logro
        await connection.query(
          'INSERT INTO estudiante_logros (estudiante_rut, logro_id) VALUES (?, ?)',
          [estudianteRut, logro.id]
        );

        // Otorgar XP de recompensa
        if (logro.puntos_experiencia > 0) {
          await connection.query(
            'UPDATE usuarios SET experiencia = experiencia + ? WHERE rut = ?',
            [logro.puntos_experiencia, estudianteRut]
          );
        }

        // Otorgar monedas de recompensa
        if (logro.monedas_recompensa > 0) {
          await connection.query(
            'UPDATE usuarios SET monedas = monedas + ? WHERE rut = ?',
            [logro.monedas_recompensa, estudianteRut]
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
