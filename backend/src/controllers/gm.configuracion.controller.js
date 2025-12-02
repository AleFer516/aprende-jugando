const db = require('../db');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs').promises;

// Obtener información personal del GM
const obtenerInformacionPersonal = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    const [usuarios] = await db.query(
      'SELECT nombre, email, avatar FROM usuarios WHERE rut = ?',
      [gmRut]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        nombre: usuarios[0].nombre,
        email: usuarios[0].email,
        avatar: usuarios[0].avatar
      }
    });
  } catch (error) {
    console.error('Error al obtener información personal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información personal',
      error: error.message
    });
  }
};

// Actualizar información personal del GM
const actualizarInformacionPersonal = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;
    const { nombre, email } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es obligatorio'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El email es obligatorio'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del email no es válido'
      });
    }

    // Verificar si el email ya está en uso por otro usuario
    const [emailExistente] = await db.query(
      'SELECT rut FROM usuarios WHERE email = ? AND rut != ?',
      [email, gmRut]
    );

    if (emailExistente.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está en uso por otro usuario'
      });
    }

    // Actualizar información
    await db.query(
      'UPDATE usuarios SET nombre = ?, email = ? WHERE rut = ?',
      [nombre.trim(), email.trim(), gmRut]
    );

    res.json({
      success: true,
      message: 'Información personal actualizada exitosamente',
      data: {
        nombre: nombre.trim(),
        email: email.trim()
      }
    });
  } catch (error) {
    console.error('Error al actualizar información personal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar información personal',
      error: error.message
    });
  }
};

// Obtener configuración del GM
const obtenerConfiguracion = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    // Obtener configuración del GM
    let [usuarios] = await db.query(
      'SELECT notificaciones_email, notificaciones_sistema FROM usuarios WHERE rut = ?',
      [gmRut]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const config = {
      notificaciones: {
        email: usuarios[0].notificaciones_email || false,
        sistema: usuarios[0].notificaciones_sistema || false
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
    const gmRut = req.usuario.rut;
    const { notificaciones } = req.body;

    if (!notificaciones) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el objeto notificaciones'
      });
    }

    // Actualizar preferencias de notificaciones
    await db.query(
      'UPDATE usuarios SET notificaciones_email = ?, notificaciones_sistema = ? WHERE rut = ?',
      [
        notificaciones.email !== undefined ? notificaciones.email : true,
        notificaciones.sistema !== undefined ? notificaciones.sistema : true,
        gmRut
      ]
    );

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      configuracion: {
        notificaciones: {
          email: notificaciones.email !== undefined ? notificaciones.email : true,
          sistema: notificaciones.sistema !== undefined ? notificaciones.sistema : true
        }
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
    const gmRut = req.usuario.rut;
    const { passwordActual, passwordNueva, passwordConfirmar } = req.body;

    // Validaciones
    if (!passwordActual || !passwordNueva || !passwordConfirmar) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Validar que las contraseñas nuevas coincidan
    if (passwordNueva !== passwordConfirmar) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas nuevas no coinciden'
      });
    }

    // Validar requisitos de la contraseña
    if (passwordNueva.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    if (!/[A-Z]/.test(passwordNueva)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe contener al menos una letra mayúscula'
      });
    }

    if (!/[0-9]/.test(passwordNueva)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe contener al menos un número'
      });
    }

    // eslint-disable-next-line no-useless-escape
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordNueva)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe contener al menos un símbolo especial'
      });
    }

    // Obtener contraseña actual del usuario
    const [usuarios] = await db.query(
      'SELECT password FROM usuarios WHERE rut = ?',
      [gmRut]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(passwordActual, usuarios[0].password);

    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Encriptar nueva contraseña
    const passwordHash = await bcrypt.hash(passwordNueva, 10);

    // Actualizar contraseña
    await db.query(
      'UPDATE usuarios SET password = ? WHERE rut = ?',
      [passwordHash, gmRut]
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

// Subir avatar del GM
const subirAvatar = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    // Construir la URL del avatar
    const avatarUrl = `/uploads/avatares/${req.file.filename}`;

    // Obtener avatar anterior para eliminarlo si existe
    const [usuarios] = await db.query(
      'SELECT avatar FROM usuarios WHERE rut = ?',
      [gmRut]
    );

    // Actualizar en la base de datos
    await db.query(
      'UPDATE usuarios SET avatar = ? WHERE rut = ?',
      [avatarUrl, gmRut]
    );

    // Eliminar avatar anterior si existe
    if (usuarios.length > 0 && usuarios[0].avatar) {
      const avatarAnterior = path.join(__dirname, '../../', usuarios[0].avatar);
      try {
        await fs.unlink(avatarAnterior);
      } catch (err) {
        // No hacer nada si el archivo no existe
        console.log('Avatar anterior no encontrado o ya eliminado');
      }
    }

    res.json({
      success: true,
      message: 'Avatar actualizado exitosamente',
      avatarUrl: avatarUrl
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

// Eliminar avatar del GM
const eliminarAvatar = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    // Obtener avatar actual para eliminarlo
    const [usuarios] = await db.query(
      'SELECT avatar FROM usuarios WHERE rut = ?',
      [gmRut]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Si no hay avatar, no hacer nada
    if (!usuarios[0].avatar) {
      return res.status(400).json({
        success: false,
        message: 'No hay avatar para eliminar'
      });
    }

    // Eliminar archivo físico
    const avatarPath = path.join(__dirname, '../../', usuarios[0].avatar);
    try {
      await fs.unlink(avatarPath);
    } catch (err) {
      console.log('Avatar no encontrado en el sistema de archivos:', err.message);
    }

    // Actualizar base de datos (establecer avatar a NULL)
    await db.query(
      'UPDATE usuarios SET avatar = NULL WHERE rut = ?',
      [gmRut]
    );

    res.json({
      success: true,
      message: 'Avatar eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar avatar',
      error: error.message
    });
  }
};

module.exports = {
  obtenerInformacionPersonal,
  actualizarInformacionPersonal,
  obtenerConfiguracion,
  actualizarConfiguracion,
  cambiarContrasena,
  subirAvatar,
  eliminarAvatar
};
