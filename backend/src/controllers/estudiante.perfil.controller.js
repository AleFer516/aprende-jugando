const db = require('../db');
const bcrypt = require('bcryptjs');

// Obtener perfil del estudiante
const obtenerPerfil = async (req, res) => {
  try {
    const estudianteRut = req.usuario.rut;

    // Información del estudiante
    const [estudiantes] = await db.query(
      'SELECT rut, nombre, email, nivel, experiencia, avatar, notificaciones_sistema, created_at FROM usuarios WHERE rut = ?',
      [estudianteRut]
    );

    if (estudiantes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    const estudiante = estudiantes[0];

    // Estadísticas generales
    const [estadisticas] = await db.query(
      `SELECT
        COUNT(*) as total_misiones,
        COUNT(CASE WHEN em.estado = 'completada' THEN 1 END) as completadas,
        SUM(CASE WHEN em.estado = 'completada' THEN m.puntos_experiencia ELSE 0 END) as xp_ganado
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE em.estudiante_rut = ?`,
      [estudianteRut]
    );

    // Cursos inscritos
    const [cursos] = await db.query(
      `SELECT
        c.id,
        c.nombre,
        c.descripcion,
        ce.inscrito_at as fecha_inscripcion
      FROM curso_estudiantes ce
      INNER JOIN cursos c ON ce.curso_id = c.id
      WHERE ce.estudiante_rut = ?`,
      [estudianteRut]
    );

    // Logros desbloqueados
    const [logros] = await db.query(
      `SELECT
        l.id,
        l.nombre,
        l.descripcion,
        l.icono,
        el.obtenido_at as fecha_desbloqueo
      FROM estudiante_logros el
      INNER JOIN logros l ON el.logro_id = l.id
      WHERE el.estudiante_rut = ?
      ORDER BY el.obtenido_at DESC
      LIMIT 5`,
      [estudianteRut]
    );

    res.json({
      success: true,
      perfil: {
        ...estudiante,
        estadisticas: estadisticas[0],
        cursos,
        logros
      }
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

// Actualizar perfil del estudiante (solo avatar)
const actualizarPerfil = async (req, res) => {
  try {
    const estudianteRut = req.usuario.rut;
    const { avatar } = req.body;

    // Permitir null para eliminar el avatar
    // Actualizar solo el avatar
    await db.query(
      'UPDATE usuarios SET avatar = ? WHERE rut = ?',
      [avatar || null, estudianteRut]
    );

    res.json({
      success: true,
      message: avatar ? 'Avatar actualizado exitosamente' : 'Avatar eliminado exitosamente'
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

// Obtener configuración del estudiante
const obtenerConfiguracion = async (req, res) => {
  try {
    const estudianteRut = req.usuario.rut;

    // Obtener configuración del usuario
    const [usuarios] = await db.query(
      'SELECT notificaciones_sistema FROM usuarios WHERE rut = ?',
      [estudianteRut]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      configuracion: {
        notificaciones: usuarios[0].notificaciones_sistema
      }
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

// Actualizar configuración del estudiante
const actualizarConfiguracion = async (req, res) => {
  try {
    const estudianteRut = req.usuario.rut;
    const { notificaciones } = req.body;

    // Actualizar configuración de notificaciones
    await db.query(
      'UPDATE usuarios SET notificaciones_sistema = ? WHERE rut = ?',
      [notificaciones, estudianteRut]
    );

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente'
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

// Cambiar contraseña del estudiante
const cambiarContrasena = async (req, res) => {
  try {
    const estudianteRut = req.usuario.rut;
    const { contrasenaActual, contrasenaNueva } = req.body;

    if (!contrasenaActual || !contrasenaNueva) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual y nueva son requeridas'
      });
    }

    // Obtener contraseña actual
    const [usuarios] = await db.query(
      'SELECT password FROM usuarios WHERE rut = ?',
      [estudianteRut]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

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
      'UPDATE usuarios SET password = ? WHERE rut = ?',
      [passwordHash, estudianteRut]
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
  obtenerPerfil,
  actualizarPerfil,
  obtenerConfiguracion,
  actualizarConfiguracion,
  cambiarContrasena
};
