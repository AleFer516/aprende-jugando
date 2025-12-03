const db = require('../db');

// Obtener notificaciones del usuario
const obtenerNotificaciones = async (req, res) => {
  try {
    const usuarioRut = req.usuario.rut;
    const { limit = 10, offset = 0, soloNoLeidas = false } = req.query;

    let query = `
      SELECT
        id,
        tipo,
        titulo,
        mensaje,
        leida,
        link,
        created_at
      FROM notificaciones
      WHERE usuario_rut = ?
    `;

    const params = [usuarioRut];

    if (soloNoLeidas === 'true') {
      query += ' AND leida = false';
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [notificaciones] = await db.query(query, params);

    // Contar total de notificaciones no leídas
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM notificaciones WHERE usuario_rut = ? AND leida = false',
      [usuarioRut]
    );

    res.json({
      success: true,
      notificaciones,
      totalNoLeidas: countResult[0].total
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: error.message
    });
  }
};

// Marcar notificación como leída
const marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioRut = req.usuario.rut;

    // Verificar que la notificación pertenece al usuario
    const [notificaciones] = await db.query(
      'SELECT id FROM notificaciones WHERE id = ? AND usuario_rut = ?',
      [id, usuarioRut]
    );

    if (notificaciones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    await db.query(
      'UPDATE notificaciones SET leida = true WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificación como leída',
      error: error.message
    });
  }
};

// Marcar todas las notificaciones como leídas
const marcarTodasComoLeidas = async (req, res) => {
  try {
    const usuarioRut = req.usuario.rut;

    await db.query(
      'UPDATE notificaciones SET leida = true WHERE usuario_rut = ? AND leida = false',
      [usuarioRut]
    );

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar todas las notificaciones como leídas',
      error: error.message
    });
  }
};

// Eliminar notificación
const eliminarNotificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioRut = req.usuario.rut;

    // Verificar que la notificación pertenece al usuario
    const [notificaciones] = await db.query(
      'SELECT id FROM notificaciones WHERE id = ? AND usuario_rut = ?',
      [id, usuarioRut]
    );

    if (notificaciones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    await db.query('DELETE FROM notificaciones WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Notificación eliminada'
    });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar notificación',
      error: error.message
    });
  }
};

// Crear notificación (función helper para usar internamente)
const crearNotificacion = async (usuarioRut, tipo, titulo, mensaje, link = null) => {
  try {
    await db.query(
      'INSERT INTO notificaciones (usuario_rut, tipo, titulo, mensaje, link) VALUES (?, ?, ?, ?, ?)',
      [usuarioRut, tipo, titulo, mensaje, link]
    );
    return { success: true };
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  obtenerNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  crearNotificacion
};
