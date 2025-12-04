const db = require('../db');

// Obtener todos los estudiantes de los cursos del GM
const obtenerEstudiantes = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    const [estudiantes] = await db.query(
      `SELECT DISTINCT
        u.rut,
        u.nombre,
        u.email,
        u.nivel,
        u.experiencia,
        u.avatar,
        u.estado,
        u.created_at,
        GROUP_CONCAT(DISTINCT c.nombre SEPARATOR ', ') as cursos,
        COUNT(DISTINCT em.mision_id) as total_misiones,
        COUNT(DISTINCT CASE WHEN em.estado = 'Completada' THEN em.mision_id END) as misiones_completadas,
        COUNT(DISTINCT CASE WHEN em.estado = 'En progreso' THEN em.mision_id END) as misiones_en_progreso,
        AVG(CASE WHEN em.estado = 'Completada' THEN em.progreso END) as promedio_progreso
      FROM usuarios u
      INNER JOIN curso_estudiantes ce ON u.rut = ce.estudiante_rut
      INNER JOIN cursos c ON ce.curso_id = c.id
      LEFT JOIN estudiante_misiones em ON u.rut = em.estudiante_rut
      WHERE c.gm_rut = ? AND u.rol = 'estudiante'
      GROUP BY u.rut, u.nombre, u.email, u.nivel, u.experiencia, u.avatar, u.estado, u.created_at
      ORDER BY u.nombre`,
      [gmRut]
    );

    res.json({
      success: true,
      estudiantes
    });
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estudiantes',
      error: error.message
    });
  }
};

// Obtener detalles de un estudiante específico
const obtenerEstudiantePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const gmRut = req.usuario.rut;

    // Verificar que el estudiante pertenece a un curso del GM
    const [estudiantes] = await db.query(
      `SELECT DISTINCT
        u.rut,
        u.nombre,
        u.email,
        u.nivel,
        u.experiencia,
        u.avatar,
        u.created_at
      FROM usuarios u
      INNER JOIN curso_estudiantes ce ON u.rut = ce.estudiante_rut
      INNER JOIN cursos c ON ce.curso_id = c.id
      WHERE u.rut = ? AND c.gm_rut = ? AND u.rol = 'estudiante'`,
      [id, gmRut]
    );

    if (estudiantes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    const estudiante = estudiantes[0];

    // Obtener cursos del estudiante
    const [cursos] = await db.query(
      `SELECT
        c.id,
        c.nombre,
        c.descripcion
      FROM cursos c
      INNER JOIN curso_estudiantes ce ON c.id = ce.curso_id
      WHERE ce.estudiante_rut = ? AND c.gm_rut = ?`,
      [id, gmRut]
    );

    // Obtener progreso en misiones
    const [misiones] = await db.query(
      `SELECT
        m.id,
        m.titulo,
        m.dificultad,
        m.puntos_experiencia,
        em.estado,
        em.progreso,
        em.puntuacion,
        em.fecha_inicio,
        em.fecha_completado
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE em.estudiante_rut = ?
      ORDER BY em.created_at DESC`,
      [id]
    );

    // Obtener logros del estudiante
    const [logros] = await db.query(
      `SELECT
        l.id,
        l.nombre,
        l.descripcion,
        l.icono,
        el.fecha_desbloqueo
      FROM estudiante_logros el
      INNER JOIN logros l ON el.logro_id = l.id
      WHERE el.estudiante_rut = ?
      ORDER BY el.fecha_desbloqueo DESC`,
      [id]
    );

    // Obtener estadísticas generales
    const [estadisticas] = await db.query(
      `SELECT
        COUNT(*) as total_misiones,
        COUNT(CASE WHEN estado = 'completada' THEN 1 END) as completadas,
        COUNT(CASE WHEN estado = 'en_progreso' THEN 1 END) as en_progreso,
        COUNT(CASE WHEN estado = 'no_iniciada' THEN 1 END) as pendientes,
        AVG(em.puntuacion) as promedio_puntuacion,
        AVG(CASE WHEN estado = 'completada' THEN progreso END) as promedio_progreso
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      WHERE em.estudiante_rut = ?`,
      [id]
    );

    res.json({
      success: true,
      estudiante: {
        ...estudiante,
        cursos,
        misiones,
        logros,
        estadisticas: estadisticas[0]
      }
    });
  } catch (error) {
    console.error('Error al obtener estudiante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estudiante',
      error: error.message
    });
  }
};

// Obtener progreso de un estudiante en una misión específica
const obtenerProgresoMision = async (req, res) => {
  try {
    const { estudianteId, misionId } = req.params;
    const gmRut = req.usuario.rut;

    // Verificar que la misión pertenece al GM
    const [misiones] = await db.query(
      'SELECT id FROM misiones WHERE id = ? AND creador_rut = ?',
      [misionId, gmRut]
    );

    if (misiones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Misión no encontrada'
      });
    }

    // Obtener progreso del estudiante
    const [progreso] = await db.query(
      `SELECT
        em.*,
        m.titulo as mision_nombre,
        m.dificultad,
        m.puntos_experiencia,
        u.nombre as estudiante_nombre
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      INNER JOIN usuarios u ON em.estudiante_rut = u.rut
      WHERE em.estudiante_rut = ? AND em.mision_id = ?`,
      [estudianteId, misionId]
    );

    if (progreso.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Progreso no encontrado'
      });
    }

    // Obtener actividades de la misión con el progreso del estudiante
    const [actividades] = await db.query(
      `SELECT
        a.id,
        a.tipo,
        a.pregunta,
        a.orden,
        a.puntos,
        (SELECT COUNT(*) FROM estudiante_respuestas er
         WHERE er.actividad_id = a.id
         AND er.estudiante_rut = ?
         AND er.es_correcta = 1) as completada,
        (SELECT MAX(created_at) FROM estudiante_respuestas er
         WHERE er.actividad_id = a.id
         AND er.estudiante_rut = ?) as fecha_respuesta
      FROM actividades a
      WHERE a.mision_id = ?
      ORDER BY a.orden`,
      [estudianteId, estudianteId, misionId]
    );

    // Obtener respuestas incorrectas del estudiante
    const [respuestas] = await db.query(
      `SELECT
        er.actividad_id,
        er.respuesta,
        er.es_correcta,
        er.intentos,
        er.created_at,
        a.pregunta
      FROM estudiante_respuestas er
      INNER JOIN actividades a ON er.actividad_id = a.id
      WHERE er.estudiante_rut = ? AND a.mision_id = ?
      ORDER BY a.orden, er.created_at`,
      [estudianteId, misionId]
    );

    res.json({
      success: true,
      progreso: {
        ...progreso[0],
        actividades,
        respuestas
      }
    });
  } catch (error) {
    console.error('Error al obtener progreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener progreso',
      error: error.message
    });
  }
};

// Obtener estadísticas generales de todos los estudiantes
const obtenerEstadisticasGenerales = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    const [estadisticas] = await db.query(
      `SELECT
        COUNT(DISTINCT u.rut) as total_estudiantes,
        COUNT(DISTINCT em.mision_id) as total_misiones_asignadas,
        COUNT(DISTINCT CASE WHEN em.estado = 'Completada' THEN em.id END) as total_completadas,
        AVG(u.nivel) as promedio_nivel,
        AVG(u.experiencia) as promedio_experiencia
      FROM usuarios u
      INNER JOIN curso_estudiantes ce ON u.rut = ce.estudiante_rut
      INNER JOIN cursos c ON ce.curso_id = c.id
      LEFT JOIN estudiante_misiones em ON u.rut = em.estudiante_rut
      WHERE c.gm_rut = ? AND u.rol = 'estudiante'`,
      [gmRut]
    );

    res.json({
      success: true,
      estadisticas: estadisticas[0]
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// Crear nuevo estudiante
const crearEstudiante = async (req, res) => {
  try {
    const { rut, nombre, email, cursoId } = req.body;
    const gmRut = req.usuario.rut;

    // Validaciones
    if (!rut || !nombre || !email) {
      return res.status(400).json({
        success: false,
        message: 'RUT, nombre y email son obligatorios'
      });
    }

    // Verificar que el curso pertenece al GM
    if (cursoId) {
      const [cursos] = await db.query(
        'SELECT id FROM cursos WHERE id = ? AND gm_rut = ?',
        [cursoId, gmRut]
      );

      if (cursos.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para asignar estudiantes a este curso'
        });
      }
    }

    // Verificar si el RUT ya existe
    const [usuarioExistente] = await db.query(
      'SELECT rut FROM usuarios WHERE rut = ?',
      [rut]
    );

    if (usuarioExistente.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este RUT'
      });
    }

    // Verificar si el email ya existe
    const [emailExistente] = await db.query(
      'SELECT email FROM usuarios WHERE email = ?',
      [email]
    );

    if (emailExistente.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email'
      });
    }

    // Generar contraseña automática (8 caracteres: letras, números y símbolos)
    const crypto = require('crypto');
    const generarPassword = () => {
      const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const minusculas = 'abcdefghijklmnopqrstuvwxyz';
      const numeros = '0123456789';
      const simbolos = '!@#$%^&*';

      // Asegurar al menos uno de cada tipo
      let password = '';
      password += mayusculas[Math.floor(Math.random() * mayusculas.length)];
      password += minusculas[Math.floor(Math.random() * minusculas.length)];
      password += numeros[Math.floor(Math.random() * numeros.length)];
      password += simbolos[Math.floor(Math.random() * simbolos.length)];

      // Completar con caracteres aleatorios
      const todosCaracteres = mayusculas + minusculas + numeros + simbolos;
      for (let i = password.length; i < 10; i++) {
        password += todosCaracteres[Math.floor(Math.random() * todosCaracteres.length)];
      }

      // Mezclar la contraseña
      return password.split('').sort(() => Math.random() - 0.5).join('');
    };

    const passwordTemporal = generarPassword();

    // Hashear la contraseña
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(passwordTemporal, 10);

    // Crear el usuario (nivel 1, experiencia 0)
    await db.query(
      `INSERT INTO usuarios (rut, nombre, email, password, rol, nivel, experiencia, estado)
       VALUES (?, ?, ?, ?, 'estudiante', 1, 0, 'activo')`,
      [rut, nombre, email, passwordHash]
    );

    // Asignar al curso si se proporcionó
    if (cursoId) {
      await db.query(
        'INSERT INTO curso_estudiantes (curso_id, estudiante_rut) VALUES (?, ?)',
        [cursoId, rut]
      );
    }

    // Registrar actividad
    await db.query(
      `INSERT INTO actividad_admin (fecha, hora, titulo, usuario, tipo)
       VALUES (CURDATE(), CURTIME(), ?, ?, 'usuario')`,
      [`Nuevo estudiante registrado: ${nombre}`, gmRut]
    );

    // Enviar email con la contraseña temporal
    try {
      const { enviarEmailBienvenida } = require('../config/email');
      await enviarEmailBienvenida(email, nombre, passwordTemporal);
      console.log(`📧 Email de bienvenida enviado a ${email}`);
    } catch (emailError) {
      console.error('⚠️ Error al enviar email de bienvenida:', emailError);
      // No fallar la creación si el email falla
    }

    res.status(201).json({
      success: true,
      message: 'Estudiante creado exitosamente. Se ha enviado un email con la contraseña temporal.',
      estudiante: {
        rut,
        nombre,
        email
      }
    });
  } catch (error) {
    console.error('Error al crear estudiante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear estudiante',
      error: error.message
    });
  }
};

module.exports = {
  obtenerEstudiantes,
  obtenerEstudiantePorId,
  obtenerProgresoMision,
  obtenerEstadisticasGenerales,
  crearEstudiante
};
