const db = require('../db');
const { registrarActividad } = require('../utils/actividadLogger');

// Obtener todas las misiones del GM
const obtenerMisiones = async (req, res) => {
  try {
    const gmRut = req.usuario.rut;

    const [misiones] = await db.query(
      `SELECT
        m.id,
        m.titulo,
        m.descripcion,
        m.dificultad,
        m.categoria,
        m.puntos_experiencia as xp_recompensa,
        m.estado,
        m.fecha_inicio,
        m.fecha_limite as fecha_fin,
        c.nombre as curso_nombre,
        COUNT(DISTINCT em.estudiante_rut) as total_estudiantes,
        COUNT(DISTINCT CASE WHEN em.estado = 'completada' THEN em.estudiante_rut END) as estudiantes_completados
      FROM misiones m
      LEFT JOIN cursos c ON m.curso_id = c.id
      LEFT JOIN estudiante_misiones em ON m.id = em.mision_id
      WHERE m.creador_rut = ?
      GROUP BY m.id, m.titulo, m.descripcion, m.dificultad, m.categoria, m.puntos_experiencia, m.estado, m.fecha_inicio, m.fecha_limite, c.nombre
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
      WHERE m.id = ? AND m.creador_rut = ?`,
      [id, gmRut]
    );

    if (misiones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Misión no encontrada'
      });
    }

    const mision = misiones[0];

    // Parsear competencias desde JSON
    let competencias = [];
    if (mision.competencias_json) {
      try {
        competencias = JSON.parse(mision.competencias_json);
      } catch (e) {
        console.error('Error al parsear competencias:', e);
        competencias = [];
      }
    }

    // Obtener pistas
    const [pistas] = await db.query(
      'SELECT texto FROM mision_pistas WHERE mision_id = ? ORDER BY orden',
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
        COUNT(DISTINCT CASE WHEN em.estado = 'completada' THEN em.estudiante_rut END) as completados,
        COUNT(DISTINCT CASE WHEN em.estado = 'en_progreso' THEN em.estudiante_rut END) as en_progreso,
        COUNT(DISTINCT CASE WHEN em.estado = 'no_iniciada' THEN em.estudiante_rut END) as pendientes,
        AVG(CASE WHEN em.estado = 'completada' THEN em.progreso END) as promedio_progreso
      FROM estudiante_misiones em
      WHERE em.mision_id = ?`,
      [id]
    );

    res.json({
      success: true,
      mision: {
        ...mision,
        competencias: competencias, // Array vacío por ahora
        pistas: pistas.map(p => p.texto),
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
      titulo,
      descripcion,
      dificultad,
      categoria,
      xp_recompensa,
      curso_id,
      fecha_inicio,
      fecha_fin,
      pistas,
      actividades
    } = req.body;

    // Validaciones
    if (!titulo) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'El título es requerido'
      });
    }

    // Preparar competencias en formato JSON
    const competenciasJson = req.body.competencias && Array.isArray(req.body.competencias)
      ? JSON.stringify(req.body.competencias.filter(c => c && c.trim().length > 0))
      : null;

    // Insertar misión
    const [result] = await connection.query(
      `INSERT INTO misiones
        (titulo, descripcion, dificultad, categoria, tipo, puntos_experiencia, monedas_recompensa, curso_id, creador_rut, fecha_inicio, fecha_limite, estado, competencias_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        descripcion,
        dificultad || 'medio',
        categoria || 'otros',
        'ejercicio',
        xp_recompensa || 100,
        xp_recompensa ? Math.floor(xp_recompensa / 10) : 10,
        curso_id || null,
        gmRut,
        fecha_inicio || null,
        fecha_fin || null,
        'activa',
        competenciasJson
      ]
    );

    const misionId = result.insertId;

    // Insertar pistas si existen (filtrar vacías)
    if (pistas && Array.isArray(pistas)) {
      const pistasValidas = pistas.filter(p => p && p.trim().length > 0);
      for (let i = 0; i < pistasValidas.length; i++) {
        await connection.query(
          'INSERT INTO mision_pistas (mision_id, texto, orden) VALUES (?, ?, ?)',
          [misionId, pistasValidas[i], i + 1]
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

    // Asignar misión a todos los estudiantes del curso (si se especificó un curso)
    if (curso_id) {
      await connection.query(
        `INSERT INTO estudiante_misiones (estudiante_rut, mision_id, estado, progreso)
        SELECT ce.estudiante_rut, ?, 'no_iniciada', 0
        FROM curso_estudiantes ce
        WHERE ce.curso_id = ?`,
        [misionId, curso_id]
      );
    }

    await connection.commit();

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Game Master';
    await registrarActividad(
      `Nueva misión creada: ${titulo}`,
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
      titulo,
      descripcion,
      dificultad,
      categoria,
      xp_recompensa,
      estado,
      fecha_inicio,
      fecha_fin,
      competencias,
      pistas
    } = req.body;

    // Verificar que la misión pertenece al GM
    const [misiones] = await connection.query(
      'SELECT id FROM misiones WHERE id = ? AND creador_rut = ?',
      [id, gmRut]
    );

    if (misiones.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Misión no encontrada'
      });
    }

    // Preparar competencias en formato JSON
    const competenciasJson = competencias && Array.isArray(competencias)
      ? JSON.stringify(competencias.filter(c => c && c.trim().length > 0))
      : null;

    // Actualizar misión
    await connection.query(
      `UPDATE misiones
      SET titulo = ?, descripcion = ?, dificultad = ?, categoria = ?,
          puntos_experiencia = ?, estado = ?, fecha_inicio = ?, fecha_limite = ?,
          competencias_json = ?
      WHERE id = ? AND creador_rut = ?`,
      [titulo, descripcion, dificultad, categoria, xp_recompensa, estado, fecha_inicio, fecha_fin, competenciasJson, id, gmRut]
    );

    // Actualizar pistas (eliminar las anteriores y crear las nuevas)
    if (pistas && Array.isArray(pistas)) {
      // Eliminar pistas anteriores
      await connection.query(
        'DELETE FROM mision_pistas WHERE mision_id = ?',
        [id]
      );

      // Insertar nuevas pistas
      const pistasValidas = pistas.filter(p => p && p.trim().length > 0);
      for (let i = 0; i < pistasValidas.length; i++) {
        await connection.query(
          'INSERT INTO mision_pistas (mision_id, texto, orden) VALUES (?, ?, ?)',
          [id, pistasValidas[i], i + 1]
        );
      }
    }

    await connection.commit();

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Game Master';
    await registrarActividad(
      `Misión actualizada: ${titulo}`,
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
      'SELECT titulo FROM misiones WHERE id = ? AND creador_rut = ?',
      [id, gmRut]
    );

    if (misiones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Misión no encontrada'
      });
    }

    const nombreMision = misiones[0].titulo;

    // Eliminar misión (las tablas relacionadas se eliminan por CASCADE)
    await db.query('DELETE FROM misiones WHERE id = ? AND creador_rut = ?', [id, gmRut]);

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
