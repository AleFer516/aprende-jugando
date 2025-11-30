const pool = require('../db');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs').promises;

// Obtener perfil del admin
const getPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const [usuario] = await pool.query(`
      SELECT
        id,
        nombre,
        email as correo,
        rol,
        telefono,
        biografia,
        avatar_url,
        created_at as fechaRegistro,
        ultimo_acceso as ultimoAcceso
      FROM usuarios
      WHERE id = ?
    `, [usuarioId]);

    if (usuario.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario[0]
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

// Actualizar perfil del admin
const actualizarPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { nombre, correo, telefono, biografia } = req.body;

    // Validar campos requeridos
    if (!nombre || !correo) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y correo son obligatorios'
      });
    }

    // Verificar si el correo ya está en uso por otro usuario
    const [emailExists] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ? AND id != ?',
      [correo, usuarioId]
    );

    if (emailExists.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está en uso'
      });
    }

    // Actualizar perfil
    await pool.query(`
      UPDATE usuarios
      SET nombre = ?, email = ?, telefono = ?, biografia = ?
      WHERE id = ?
    `, [nombre, correo, telefono || null, biografia || null, usuarioId]);

    // Obtener perfil actualizado
    const [perfilActualizado] = await pool.query(`
      SELECT
        id,
        nombre,
        email as correo,
        rol,
        telefono,
        biografia,
        avatar_url,
        created_at as fechaRegistro,
        ultimo_acceso as ultimoAcceso
      FROM usuarios
      WHERE id = ?
    `, [usuarioId]);

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: perfilActualizado[0]
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
};

// Cambiar contraseña
const cambiarPassword = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { passwordActual, passwordNuevo } = req.body;

    // Validar campos requeridos
    if (!passwordActual || !passwordNuevo) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva son obligatorias'
      });
    }

    // Obtener contraseña actual del usuario
    const [usuario] = await pool.query(
      'SELECT password FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (usuario.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(passwordActual, usuario[0].password);

    if (!passwordValida) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Obtener políticas de contraseña
    const [config] = await pool.query(`
      SELECT politicas_password
      FROM configuracion_sistema
      WHERE id = 1
    `);

    const politicas = config.length > 0 && config[0].politicas_password
      ? JSON.parse(config[0].politicas_password)
      : { minChars: true, mayusculas: true, numeros: true, simbolos: true };

    // Validar nueva contraseña según políticas
    if (politicas.minChars && passwordNuevo.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    if (politicas.mayusculas && !/[A-Z]/.test(passwordNuevo)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe contener al menos una letra mayúscula'
      });
    }

    if (politicas.numeros && !/[0-9]/.test(passwordNuevo)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe contener al menos un número'
      });
    }

    if (politicas.simbolos && !/[!@#$%^&*(),.?":{}|<>]/.test(passwordNuevo)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe contener al menos un símbolo'
      });
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(passwordNuevo, 10);

    // Actualizar contraseña
    await pool.query(
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [hashedPassword, usuarioId]
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

// Subir avatar
const subirAvatar = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha enviado ningún archivo'
      });
    }

    // Obtener avatar anterior para eliminarlo
    const [usuario] = await pool.query(
      'SELECT avatar_url FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    // Eliminar avatar anterior si existe
    if (usuario[0].avatar_url) {
      const oldAvatarPath = path.join(__dirname, '../../uploads', path.basename(usuario[0].avatar_url));
      try {
        await fs.unlink(oldAvatarPath);
      } catch (err) {
        console.error('Error al eliminar avatar anterior:', err);
      }
    }

    // Guardar nueva URL del avatar
    const avatarUrl = `/uploads/${req.file.filename}`;
    await pool.query(
      'UPDATE usuarios SET avatar_url = ? WHERE id = ?',
      [avatarUrl, usuarioId]
    );

    res.json({
      success: true,
      message: 'Avatar actualizado exitosamente',
      data: {
        avatarUrl
      }
    });
  } catch (error) {
    console.error('Error al subir avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir avatar',
      error: error.message
    });
  }
};

module.exports = {
  getPerfil,
  actualizarPerfil,
  cambiarPassword,
  subirAvatar
};
