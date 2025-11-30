const db = require('../db');
const { registrarActividad } = require('../utils/actividadLogger');

// Obtener todas las misiones del GM
const obtenerMisiones = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    const [misiones] = await db.query(
      `SELECT
        m.id,
        m.nombre,
        m.descripcion,
        m.dificultad,
        m.categoria,
        m.xp_recompensa,
        m.estado,
        m.fecha_inicio,
        m.fecha_fin,
        c.nombre as curso_nombre,
        COUNT(DISTINCT em.estudiante_rut) as total_estudiantes,
        COUNT(DISTINCT CASE WHEN em.estado = 'Completada' THEN em.estudiante_rut END) as estudiantes_completados
      FROM misiones m
      LEFT JOIN cursos c ON m.curso_id = c.id
      LEFT JOIN estudiante_misiones em ON m.id = em.mision_id
      WHERE m.gm_rut = ?
      GROUP BY m.id
      ORDER BY m.created_at DESC`,
      [gmRut]
    );

    res.json({
      success: true,
      misiones
    });
  } catch (error) {
    console.error('Error al obtener misiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener misiones',
      error: error.message
    });
  }
};

// Obtener una misión específica con todos sus detalles
const obtenerMisionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const gmRut = req.usuario.rut;

    // Obtener datos de la misión
    const [misiones] = await db.query(
      `SELECT
        m.*,
        c.nombre as curso_nombre
      FROM misiones m
      LEFT JOIN cursos c ON m.curso_id = c.id
      WHERE m.id = ? AND m.gm_rut = ?`,
      [id, gmRut]
    );

    if (misiones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Misión no encontrada'
      });
    }

    const mision = misiones[0];

    // Obtener competencias
    const [competencias] = await db.query(
      'SELECT descripcion FROM mision_competencias WHERE mision_id = ? ORDER BY orden',
      [id]
    );

    // Obtener pistas
    const [pistas] = await db.query(
      'SELECT descripcion FROM mision_pistas WHERE mision_id = ? ORDER BY orden',
      [id]
    );

    // Obtener actividades
    const [actividades] = await db.query(
      `SELECT
        a.*
      FROM actividades a
      WHERE a.mision_id = ?
      ORDER BY a.orden`,
      [id]
    );

    // Para cada actividad, obtener sus opciones
    for (let actividad of actividades) {
      const [opciones] = await db.query(
        'SELECT id, valor, es_correcta, orden FROM actividad_opciones WHERE actividad_id = ? ORDER BY orden',
        [actividad.id]
      );
      actividad.opciones = opciones;
    }

    // Obtener estadísticas de estudiantes
    const [estadisticas] = await db.query(
      `SELECT
        COUNT(DISTINCT em.estudiante_rut) as total_estudiantes,
        COUNT(DISTINCT em.estudiante_rut) as total_estudiantes,
        COUNT(DISTINCT CASE WHEN em.estado = 'Completada' THEN em.estudiante_rut END) as completados,
        COUNT(DISTINCT CASE WHEN em.estado = 'En progreso' THEN em.estudiante_rut END) as en_progreso,
        COUNT(DISTINCT CASE WHEN em.estado = 'Pendiente' THEN em.estudiante_rut END) as pendientes,
        AVG(CASE WHEN em.estado = 'Completada' THEN em.progreso END) as promedio_progreso
      FROM estudiante_misiones em
      WHERE em.mision_id = ?`,
      [id]
    );

    res.json({
      success: true,
      mision: {
        ...mision,
        competencias: competencias.map(c => c.descripcion),
        pistas: pistas.map(p => p.descripcion),
        actividades,
        estadisticas: estadisticas[0]
      }
    });
  } catch (error) {
    console.error('Error al obtener misión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener misión',
      error: error.message
    });
  }
};

// Crear una nueva misión
const crearMision = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const gmRut = req.usuario.rut;
    const {
      nombre,
      descripcion,
      objetivo,
      dificultad,
      categoria,
      xp_recompensa,
      curso_id,
      fecha_inicio,
      fecha_fin,
      competencias,
      pistas,
      actividades
    } = req.body;

    // Validaciones
    if (!nombre || !curso_id) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Nombre y curso son requeridos'
      });
    }

    // Insertar misión
    const [result] = await connection.query(
      `INSERT INTO misiones
        (nombre, descripcion, objetivo, dificultad, categoria, xp_recompensa, curso_id, gm_rut, fecha_inicio, fecha_fin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, objetivo, dificultad || 'Media', categoria, xp_recompensa || 100, curso_id, gmRut, fecha_inicio, fecha_fin]
    );

    const misionId = result.insertId;

    // Insertar competencias si existen
    if (competencias && Array.isArray(competencias)) {
      for (let i = 0; i < competencias.length; i++) {
        await connection.query(
          'INSERT INTO mision_competencias (mision_id, descripcion, orden) VALUES (?, ?, ?)',
          [misionId, competencias[i], i + 1]
        );
      }
    }

    // Insertar pistas si existen
    if (pistas && Array.isArray(pistas)) {
      for (let i = 0; i < pistas.length; i++) {
        await connection.query(
          'INSERT INTO mision_pistas (mision_id, descripcion, orden) VALUES (?, ?, ?)',
          [misionId, pistas[i], i + 1]
        );
      }
    }

    // Insertar actividades si existen
    if (actividades && Array.isArray(actividades)) {
      for (let i = 0; i < actividades.length; i++) {
        const actividad = actividades[i];
        const [actResult] = await connection.query(
          `INSERT INTO actividades
            (mision_id, titulo, enunciado, pregunta, tipo_pregunta, respuesta_correcta, consejo, orden)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            misionId,
            actividad.titulo,
            actividad.enunciado,
            actividad.pregunta,
            actividad.tipo_pregunta || 'opcion_multiple',
            actividad.respuesta_correcta,
            actividad.consejo,
            i + 1
          ]
        );

        const actividadId = actResult.insertId;

        // Insertar opciones si existen
        if (actividad.opciones && Array.isArray(actividad.opciones)) {
          for (let j = 0; j < actividad.opciones.length; j++) {
            const opcion = actividad.opciones[j];
            await connection.query(
              'INSERT INTO actividad_opciones (actividad_id, valor, es_correcta, orden) VALUES (?, ?, ?, ?)',
              [actividadId, opcion.valor, opcion.es_correcta || false, j + 1]
            );
          }
        }
      }
    }

    // Asignar misión a todos los estudiantes del curso
    await connection.query(
      `INSERT INTO estudiante_misiones (estudiante_rut, mision_id, estado)
      SELECT ce.estudiante_rut, ?, 'Pendiente'
      FROM curso_estudiantes ce
      WHERE ce.curso_id = ?`,
      [misionId, curso_id]
    );

    await connection.commit();

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Game Master';
    await registrarActividad(
      `Nueva misión creada: ${nombre}`,
      usuario,
      'sistema'
    );

    res.status(201).json({
      success: true,
      message: 'Misión creada exitosamente',
      misionId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear misión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear misión',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Actualizar una misión existente
const actualizarMision = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const gmRut = req.usuario.rut;
    const {
      nombre,
      descripcion,
      objetivo,
      dificultad,
      categoria,
      xp_recompensa,
      estado,
      fecha_inicio,
      fecha_fin
    } = req.body;

    // Verificar que la misión pertenece al GM
    const [misiones] = await connection.query(
      'SELECT id FROM misiones WHERE id = ? AND gm_rut = ?',
      [id, gmRut]
    );

    if (misiones.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Misión no encontrada'
      });
    }

    // Actualizar misión
    await connection.query(
      `UPDATE misiones
      SET nombre = ?, descripcion = ?, objetivo = ?, dificultad = ?, categoria = ?,
          xp_recompensa = ?, estado = ?, fecha_inicio = ?, fecha_fin = ?
      WHERE id = ? AND gm_rut = ?`,
      [nombre, descripcion, objetivo, dificultad, categoria, xp_recompensa, estado, fecha_inicio, fecha_fin, id, gmRut]
    );

    await connection.commit();

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Game Master';
    await registrarActividad(
      `Misión actualizada: ${nombre}`,
      usuario,
      'sistema'
    );

    res.json({
      success: true,
      message: 'Misión actualizada exitosamente'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar misión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar misión',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Eliminar una misión
const eliminarMision = async (req, res) => {
  try {
    const { id } = req.params;
    const gmRut = req.usuario.rut;

    // Verificar que la misión pertenece al GM
    const [misiones] = await db.query(
      'SELECT nombre FROM misiones WHERE id = ? AND gm_rut = ?',
      [id, gmRut]
    );

    if (misiones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Misión no encontrada'
      });
    }

    const nombreMision = misiones[0].nombre;

    // Eliminar misión (las tablas relacionadas se eliminan por CASCADE)
    await db.query('DELETE FROM misiones WHERE id = ? AND gm_rut = ?', [id, gmRut]);

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Game Master';
    await registrarActividad(
      `Misión eliminada: ${nombreMision}`,
      usuario,
      'sistema'
    );

    res.json({
      success: true,
      message: 'Misión eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar misión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar misión',
      error: error.message
    });
  }
};

module.exports = {
  obtenerMisiones,
  obtenerMisionPorId,
  crearMision,
  actualizarMision,
  eliminarMision
};
