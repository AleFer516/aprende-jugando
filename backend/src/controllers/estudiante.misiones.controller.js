const db = require('../db');

// Obtener todas las misiones del estudiante
const obtenerMisiones = async (req, res) => {
  try {
    const estudianteId = req.usuario.id;
    const { curso, busqueda } = req.query;

    let query = `
      SELECT
        m.id,
        m.nombre,
        m.dificultad,
        m.xp_recompensa as xp,
        em.estado,
        em.progreso,
        c.nombre as curso
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      INNER JOIN cursos c ON m.curso_id = c.id
      WHERE em.estudiante_id = ?`;

    const params = [estudianteId];

    if (curso) {
      query += ' AND c.nombre = ?';
      params.push(curso);
    }

    if (busqueda) {
      query += ' AND m.nombre LIKE ?';
      params.push(`%${busqueda}%`);
    }

    query += ' ORDER BY em.created_at DESC';

    const [misiones] = await db.query(query, params);

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

// Obtener detalles de una misión específica
const obtenerMisionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const estudianteId = req.usuario.id;

    // Obtener datos de la misión
    const [misiones] = await db.query(
      `SELECT
        m.*,
        em.estado,
        em.progreso,
        em.xp_ganado,
        em.fecha_inicio,
        em.fecha_completado
      FROM misiones m
      INNER JOIN estudiante_misiones em ON m.id = em.mision_id
      WHERE m.id = ? AND em.estudiante_id = ?`,
      [id, estudianteId]
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

    res.json({
      success: true,
      mision: {
        ...mision,
        competencias: competencias.map(c => c.descripcion),
        pistas: pistas.map(p => p.descripcion)
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

// Obtener actividades de una misión
const obtenerActividades = async (req, res) => {
  try {
    const { id } = req.params;
    const estudianteId = req.usuario.id;

    // Verificar que el estudiante tiene acceso a esta misión
    const [acceso] = await db.query(
      'SELECT id FROM estudiante_misiones WHERE estudiante_id = ? AND mision_id = ?',
      [estudianteId, id]
    );

    if (acceso.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta misión'
      });
    }

    // Obtener actividades
    const [actividades] = await db.query(
      `SELECT
        a.id,
        a.titulo,
        a.enunciado,
        a.pregunta,
        a.tipo_pregunta,
        a.consejo,
        a.orden
      FROM actividades a
      WHERE a.mision_id = ?
      ORDER BY a.orden`,
      [id]
    );

    // Para cada actividad, obtener sus opciones
    for (let actividad of actividades) {
      const [opciones] = await db.query(
        'SELECT id, valor, orden FROM actividad_opciones WHERE actividad_id = ? ORDER BY orden',
        [actividad.id]
      );
      actividad.opciones = opciones;
    }

    res.json({
      success: true,
      actividades
    });
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividades',
      error: error.message
    });
  }
};

// Responder una actividad
const responderActividad = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { actividadId } = req.params;
    const estudianteId = req.usuario.id;
    const { respuesta, tiempoRespuesta } = req.body;

    // Obtener datos de la actividad
    const [actividades] = await connection.query(
      `SELECT
        a.*,
        m.id as mision_id,
        m.xp_recompensa
      FROM actividades a
      INNER JOIN misiones m ON a.mision_id = m.id
      WHERE a.id = ?`,
      [actividadId]
    );

    if (actividades.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    const actividad = actividades[0];

    // Verificar si la respuesta es correcta
    const esCorrecta = respuesta.toString() === actividad.respuesta_correcta.toString();

    // Verificar si ya respondió esta actividad antes
    const [respuestasAnteriores] = await connection.query(
      'SELECT COUNT(*) as intentos FROM estudiante_respuestas WHERE estudiante_id = ? AND actividad_id = ?',
      [estudianteId, actividadId]
    );

    const intentos = respuestasAnteriores[0].intentos + 1;

    // Guardar respuesta
    await connection.query(
      `INSERT INTO estudiante_respuestas
        (estudiante_id, actividad_id, respuesta, es_correcta, intentos, tiempo_respuesta)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [estudianteId, actividadId, respuesta, esCorrecta, intentos, tiempoRespuesta || 0]
    );

    // Si es correcta, actualizar progreso de la misión
    if (esCorrecta) {
      // Obtener total de actividades de la misión
      const [totalActividades] = await connection.query(
        'SELECT COUNT(*) as total FROM actividades WHERE mision_id = ?',
        [actividad.mision_id]
      );

      // Obtener respuestas correctas del estudiante en esta misión
      const [respuestasCorrectas] = await connection.query(
        `SELECT COUNT(DISTINCT er.actividad_id) as correctas
        FROM estudiante_respuestas er
        INNER JOIN actividades a ON er.actividad_id = a.id
        WHERE er.estudiante_id = ? AND a.mision_id = ? AND er.es_correcta = 1`,
        [estudianteId, actividad.mision_id]
      );

      const progreso = Math.round((respuestasCorrectas[0].correctas / totalActividades[0].total) * 100);

      // Actualizar progreso
      await connection.query(
        `UPDATE estudiante_misiones
        SET
          progreso = ?,
          estado = CASE
            WHEN ? = 100 THEN 'Completada'
            WHEN progreso > 0 THEN 'En progreso'
            ELSE 'Pendiente'
          END,
          fecha_completado = CASE WHEN ? = 100 THEN NOW() ELSE fecha_completado END
        WHERE estudiante_id = ? AND mision_id = ?`,
        [progreso, progreso, progreso, estudianteId, actividad.mision_id]
      );

      // Si completó la misión, otorgar XP
      if (progreso === 100) {
        await connection.query(
          'UPDATE usuarios SET experiencia = experiencia + ? WHERE id = ?',
          [actividad.xp_recompensa, estudianteId]
        );

        await connection.query(
          'UPDATE estudiante_misiones SET xp_ganado = ? WHERE estudiante_id = ? AND mision_id = ?',
          [actividad.xp_recompensa, estudianteId, actividad.mision_id]
        );

        // Crear evaluación pendiente para el GM
        const [gmId] = await connection.query(
          'SELECT gm_id FROM misiones WHERE id = ?',
          [actividad.mision_id]
        );

        if (gmId.length > 0) {
          await connection.query(
            'INSERT INTO evaluaciones (gm_id, estudiante_id, mision_id, estado) VALUES (?, ?, ?, ?)',
            [gmId[0].gm_id, estudianteId, actividad.mision_id, 'pendiente']
          );
        }
      }
    }

    await connection.commit();

    res.json({
      success: true,
      esCorrecta,
      intentos,
      message: esCorrecta ? '¡Respuesta correcta!' : 'Respuesta incorrecta, intenta de nuevo'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al responder actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al responder actividad',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Iniciar una misión
const iniciarMision = async (req, res) => {
  try {
    const { id } = req.params;
    const estudianteId = req.usuario.id;

    await db.query(
      `UPDATE estudiante_misiones
      SET estado = 'En progreso', fecha_inicio = NOW()
      WHERE estudiante_id = ? AND mision_id = ? AND estado = 'Pendiente'`,
      [estudianteId, id]
    );

    res.json({
      success: true,
      message: 'Misión iniciada exitosamente'
    });
  } catch (error) {
    console.error('Error al iniciar misión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar misión',
      error: error.message
    });
  }
};

module.exports = {
  obtenerMisiones,
  obtenerMisionPorId,
  obtenerActividades,
  responderActividad,
  iniciarMision
};
