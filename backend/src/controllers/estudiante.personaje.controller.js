const db = require('../db');

// Obtener personalizaciones disponibles y activas del estudiante
const obtenerPersonalizaciones = async (req, res) => {
  try {
    const estudianteId = req.usuario.id;

    // Obtener información del estudiante
    const [estudiantes] = await db.query(
      'SELECT nivel FROM usuarios WHERE id = ?',
      [estudianteId]
    );

    if (estudiantes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    const nivel = estudiantes[0].nivel;

    // Obtener misiones completadas
    const [misionesCompletadas] = await db.query(
      'SELECT COUNT(*) as total FROM estudiante_misiones WHERE estudiante_id = ? AND estado = "Completada"',
      [estudianteId]
    );

    const misionesTotales = misionesCompletadas[0].total;

    // Obtener todas las personalizaciones con estado de desbloqueo
    const [personalizaciones] = await db.query(
      `SELECT
        p.id,
        p.tipo,
        p.nombre,
        p.imagen,
        p.requisito_nivel,
        p.requisito_misiones,
        CASE
          WHEN p.requisito_nivel <= ? AND p.requisito_misiones <= ? THEN 1
          ELSE 0
        END as desbloqueado,
        CASE
          WHEN p.requisito_nivel > ? THEN CONCAT('Desbloquea en el nivel ', p.requisito_nivel)
          WHEN p.requisito_misiones > ? THEN CONCAT('Desbloquea completando ', p.requisito_misiones, ' misiones')
          ELSE ''
        END as requisito
      FROM personalizaciones p
      ORDER BY p.tipo, p.id`,
      [nivel, misionesTotales, nivel, misionesTotales]
    );

    // Agrupar por tipo
    const apariencias = personalizaciones.filter(p => p.tipo === 'apariencia');
    const atuendos = personalizaciones.filter(p => p.tipo === 'atuendo');
    const accesorios = personalizaciones.filter(p => p.tipo === 'accesorio');
    const herramientas = personalizaciones.filter(p => p.tipo === 'herramienta');

    // Obtener configuración actual del estudiante
    const [configuracion] = await db.query(
      `SELECT
        apariencia_activa,
        atuendo_activo,
        accesorio_activo,
        herramienta_activa
      FROM estudiante_configuracion
      WHERE estudiante_id = ?`,
      [estudianteId]
    );

    // Si no existe configuración, crear una por defecto
    if (configuracion.length === 0) {
      await db.query(
        'INSERT INTO estudiante_configuracion (estudiante_id) VALUES (?)',
        [estudianteId]
      );

      res.json({
        success: true,
        personalizaciones: {
          apariencias,
          atuendos,
          accesorios,
          herramientas
        },
        activas: {
          apariencia: 1,
          atuendo: 1,
          accesorio: 1,
          herramienta: 1
        }
      });
    } else {
      res.json({
        success: true,
        personalizaciones: {
          apariencias,
          atuendos,
          accesorios,
          herramientas
        },
        activas: {
          apariencia: configuracion[0].apariencia_activa,
          atuendo: configuracion[0].atuendo_activo,
          accesorio: configuracion[0].accesorio_activo,
          herramienta: configuracion[0].herramienta_activa
        }
      });
    }
  } catch (error) {
    console.error('Error al obtener personalizaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener personalizaciones',
      error: error.message
    });
  }
};

// Guardar personalizaciones activas
const guardarPersonalizaciones = async (req, res) => {
  try {
    const estudianteId = req.usuario.id;
    const { apariencia, atuendo, accesorio, herramienta } = req.body;

    // Verificar si el estudiante tiene configuración
    const [configuracion] = await db.query(
      'SELECT id FROM estudiante_configuracion WHERE estudiante_id = ?',
      [estudianteId]
    );

    if (configuracion.length === 0) {
      // Crear configuración
      await db.query(
        `INSERT INTO estudiante_configuracion
          (estudiante_id, apariencia_activa, atuendo_activo, accesorio_activo, herramienta_activa)
        VALUES (?, ?, ?, ?, ?)`,
        [estudianteId, apariencia, atuendo, accesorio, herramienta]
      );
    } else {
      // Actualizar configuración
      await db.query(
        `UPDATE estudiante_configuracion
        SET
          apariencia_activa = ?,
          atuendo_activo = ?,
          accesorio_activo = ?,
          herramienta_activa = ?
        WHERE estudiante_id = ?`,
        [apariencia, atuendo, accesorio, herramienta, estudianteId]
      );
    }

    res.json({
      success: true,
      message: 'Personalizaciones guardadas exitosamente'
    });
  } catch (error) {
    console.error('Error al guardar personalizaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar personalizaciones',
      error: error.message
    });
  }
};

module.exports = {
  obtenerPersonalizaciones,
  guardarPersonalizaciones
};
