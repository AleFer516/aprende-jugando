const db = require('../db');
const bcrypt = require('bcryptjs');

// Obtener perfil del estudiante
const obtenerPerfil = async (req, res) => {
  try {
    const estudianteId = req.usuario.id;

    // Información del estudiante
    const [estudiantes] = await db.query(
      'SELECT id, nombre, email, nivel, experiencia, avatar, created_at FROM usuarios WHERE id = ?',
      [estudianteId]
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
        COUNT(CASE WHEN estado = 'Completada' THEN 1 END) as completadas,
        SUM(xp_ganado) as xp_ganado
      FROM estudiante_misiones
      WHERE estudiante_id = ?`,
      [estudianteId]
    );

    // Cursos inscritos
    const [cursos] = await db.query(
      `SELECT
        c.id,
        c.nombre,
        c.descripcion,
        ce.fecha_inscripcion
      FROM curso_estudiantes ce
      INNER JOIN cursos c ON ce.curso_id = c.id
      WHERE ce.estudiante_id = ?`,
      [estudianteId]
    );

    // Logros desbloqueados
    const [logros] = await db.query(
      `SELECT
        l.id,
        l.nombre,
        l.descripcion,
        l.icono,
        el.fecha_desbloqueo
      FROM estudiante_logros el
      INNER JOIN logros l ON el.logro_id = l.id
      WHERE el.estudiante_id = ?
      ORDER BY el.fecha_desbloqueo DESC
      LIMIT 5`,
      [estudianteId]
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

// Actualizar perfil del estudiante
const actualizarPerfil = async (req, res) => {
  try {
    const estudianteId = req.usuario.id;
    const { nombre, email, avatar } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y email son requeridos'
      });
    }

    // Verificar si el email ya existe
    const [usuariosExistentes] = await db.query(
      'SELECT id FROM usuarios WHERE email = ? AND id != ?',
      [email, estudianteId]
    );

    if (usuariosExistentes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está en uso'
      });
    }

    // Actualizar perfil
    await db.query(
      'UPDATE usuarios SET nombre = ?, email = ?, avatar = ? WHERE id = ?',
      [nombre, email, avatar || null, estudianteId]
    );

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente'
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
    const estudianteId = req.usuario.id;

    // Obtener configuración
    const [configuracion] = await db.query(
      'SELECT tema, idioma FROM estudiante_configuracion WHERE estudiante_id = ?',
      [estudianteId]
    );

    if (configuracion.length === 0) {
      // Crear configuración por defecto
      await db.query(
        'INSERT INTO estudiante_configuracion (estudiante_id) VALUES (?)',
        [estudianteId]
      );

      return res.json({
        success: true,
        configuracion: {
          tema: 'light',
          idioma: 'es',
          notificaciones: {
            emailNuevasMisiones: true,
            emailLogrosDesbloqueados: true
          }
        }
      });
    }

    res.json({
      success: true,
      configuracion: {
        tema: configuracion[0].tema,
        idioma: configuracion[0].idioma,
        notificaciones: {
          emailNuevasMisiones: true,
          emailLogrosDesbloqueados: true
        }
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
    const estudianteId = req.usuario.id;
    const { tema, idioma } = req.body;

    // Verificar si existe configuración
    const [configuracion] = await db.query(
      'SELECT id FROM estudiante_configuracion WHERE estudiante_id = ?',
      [estudianteId]
    );

    if (configuracion.length === 0) {
      // Crear configuración
      await db.query(
        'INSERT INTO estudiante_configuracion (estudiante_id, tema, idioma) VALUES (?, ?, ?)',
        [estudianteId, tema || 'light', idioma || 'es']
      );
    } else {
      // Actualizar configuración
      await db.query(
        'UPDATE estudiante_configuracion SET tema = ?, idioma = ? WHERE estudiante_id = ?',
        [tema, idioma, estudianteId]
      );
    }

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
    const estudianteId = req.usuario.id;
    const { contrasenaActual, contrasenaNueva } = req.body;

    if (!contrasenaActual || !contrasenaNueva) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual y nueva son requeridas'
      });
    }

    // Obtener contraseña actual
    const [usuarios] = await db.query(
      'SELECT password FROM usuarios WHERE id = ?',
      [estudianteId]
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
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [passwordHash, estudianteId]
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
