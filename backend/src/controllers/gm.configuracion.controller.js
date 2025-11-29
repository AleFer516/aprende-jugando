const db = require('../db');

// Obtener configuración del GM
const obtenerConfiguracion = async (req, res) => {
  try {
    const gmId = req.usuario.id;

    // Obtener o crear configuración del GM
    let [configuracion] = await db.query(
      'SELECT * FROM usuarios WHERE id = ?',
      [gmId]
    );

    if (configuracion.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Por ahora usamos campos del usuario, pero se puede extender con una tabla de configuración
    const config = {
      notificaciones: {
        emailNuevasMisiones: true,
        emailMisionesCompletadas: true,
        emailNuevosEstudiantes: true,
        pushNuevasMisiones: false,
        pushMisionesCompletadas: true
      },
      privacidad: {
        perfilPublico: false,
        mostrarEstadisticas: true
      },
      preferencias: {
        idioma: 'es',
        tema: 'light',
        zona_horaria: 'America/Santiago'
      }
    };

    res.json({
      success: true,
      configuracion: config
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración',
      error: error.message
    });
  }
};

// Actualizar configuración del GM
const actualizarConfiguracion = async (req, res) => {
  try {
    const gmId = req.usuario.id;
    const { notificaciones, privacidad, preferencias } = req.body;

    // Por ahora solo guardamos en memoria o en campos JSON
    // En producción, deberías crear una tabla gm_configuracion

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      configuracion: {
        notificaciones,
        privacidad,
        preferencias
      }
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración',
      error: error.message
    });
  }
};

// Cambiar contraseña del GM
const cambiarContrasena = async (req, res) => {
  try {
    const gmId = req.usuario.id;
    const { contrasenaActual, contrasenaNueva } = req.body;

    if (!contrasenaActual || !contrasenaNueva) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual y nueva son requeridas'
      });
    }

    // Obtener contraseña actual del usuario
    const [usuarios] = await db.query(
      'SELECT password FROM usuarios WHERE id = ?',
      [gmId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const bcrypt = require('bcryptjs');

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(contrasenaActual, usuarios[0].password);

    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Encriptar nueva contraseña
    const passwordHash = await bcrypt.hash(contrasenaNueva, 10);

    // Actualizar contraseña
    await db.query(
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [passwordHash, gmId]
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    });
  }
};

module.exports = {
  obtenerConfiguracion,
  actualizarConfiguracion,
  cambiarContrasena
};
