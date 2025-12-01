const pool = require('../db');

// Obtener notificaciones del usuario admin
const getNotificaciones = async (req, res) => {
  try {
    const { rut } = req.usuario; // RUT del usuario logueado
    const { limit = 10, solo_no_leidas = false } = req.query;

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

    const params = [rut];

    // Filtrar solo no leídas si se solicita
    if (solo_no_leidas === 'true') {
      query += ' AND leida = FALSE';
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [notificaciones] = await pool.query(query, params);

    // Obtener cantidad de no leídas
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM notificaciones WHERE usuario_rut = ? AND leida = FALSE',
      [rut]
    );

    res.json({
      success: true,
      data: {
        notificaciones,
        noLeidas: countResult[0].total
      }
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
    const { rut } = req.usuario;

    await pool.query(
      'UPDATE notificaciones SET leida = TRUE WHERE id = ? AND usuario_rut = ?',
      [id, rut]
    );

    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificación',
      error: error.message
    });
  }
};

// Marcar todas como leídas
const marcarTodasLeidas = async (req, res) => {
  try {
    const { rut } = req.usuario;

    await pool.query(
      'UPDATE notificaciones SET leida = TRUE WHERE usuario_rut = ? AND leida = FALSE',
      [rut]
    );

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    });
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar todas como leídas',
      error: error.message
    });
  }
};

// Eliminar notificación
const eliminarNotificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { rut } = req.usuario;

    await pool.query(
      'DELETE FROM notificaciones WHERE id = ? AND usuario_rut = ?',
      [id, rut]
    );

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

// Función auxiliar para crear notificaciones (usada internamente)
const crearNotificacion = async (usuario_rut, tipo, titulo, mensaje, link = null) => {
  try {
    await pool.query(
      'INSERT INTO notificaciones (usuario_rut, tipo, titulo, mensaje, link) VALUES (?, ?, ?, ?, ?)',
      [usuario_rut, tipo, titulo, mensaje, link]
    );
    return true;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return false;
  }
};

// Función para crear notificación para todos los admins
const notificarAdmins = async (tipo, titulo, mensaje, link = null) => {
  try {
    // Obtener todos los admins
    const [admins] = await pool.query(
      "SELECT rut FROM usuarios WHERE rol = 'admin'"
    );

    // Crear notificación para cada admin
    for (const admin of admins) {
      await crearNotificacion(admin.rut, tipo, titulo, mensaje, link);
    }

    return true;
  } catch (error) {
    console.error('Error al notificar admins:', error);
    return false;
  }
};

module.exports = {
  getNotificaciones,
  marcarComoLeida,
  marcarTodasLeidas,
  eliminarNotificacion,
  crearNotificacion,
  notificarAdmins
};
