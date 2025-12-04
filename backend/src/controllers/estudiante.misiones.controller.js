const db = require('../db');

// Función auxiliar para verificar y desbloquear logros automáticamente
async function verificarYDesbloquearLogros(connection, estudianteRut) {
  try {
    console.log('🏆 Verificando logros para estudiante:', estudianteRut);

    // Obtener estadísticas del estudiante
    const [estadisticas] = await connection.query(
      `SELECT
        u.nivel,
        u.experiencia,
        u.monedas,
        COUNT(CASE WHEN em.estado = 'completada' THEN 1 END) as misiones_completadas
      FROM usuarios u
      LEFT JOIN estudiante_misiones em ON u.rut = em.estudiante_rut
      WHERE u.rut = ?
      GROUP BY u.rut`,
      [estudianteRut]
    );

    const stats = estadisticas[0] || { nivel: 1, experiencia: 0, monedas: 0, misiones_completadas: 0 };
    console.log('📊 Estadísticas del estudiante:', stats);

    // Obtener logros que aún no ha desbloqueado el estudiante
    const [logrosPendientes] = await connection.query(
      `SELECT l.*
      FROM logros l
      LEFT JOIN estudiante_logros el ON l.id = el.logro_id AND el.estudiante_rut = ?
      WHERE el.id IS NULL`,
      [estudianteRut]
    );

    console.log('📋 Logros pendientes encontrados:', logrosPendientes.length);

    // Verificar cada logro pendiente
    for (const logro of logrosPendientes) {
      let cumple = false;

      console.log(`🔍 Verificando logro: ${logro.titulo} (${logro.condicion}: ${logro.valor_requerido})`);

      switch (logro.condicion) {
        case 'nivel':
          cumple = stats.nivel >= logro.valor_requerido;
          break;
        case 'misiones_completadas':
          cumple = stats.misiones_completadas >= logro.valor_requerido;
          break;
        case 'experiencia':
          cumple = stats.experiencia >= logro.valor_requerido;
          break;
        case 'monedas':
          cumple = stats.monedas >= logro.valor_requerido;
          break;
      }

      console.log(`   ${cumple ? '✅' : '❌'} Cumple condición:`, cumple);

      if (cumple) {
        console.log(`   🎉 ¡Desbloqueando logro: ${logro.titulo}!`);

        // Desbloquear el logro
        await connection.query(
          'INSERT INTO estudiante_logros (estudiante_rut, logro_id) VALUES (?, ?)',
          [estudianteRut, logro.id]
        );

        // Otorgar recompensa de XP si la tiene
        if (logro.puntos_experiencia > 0) {
          await connection.query(
            'UPDATE usuarios SET experiencia = experiencia + ? WHERE rut = ?',
            [logro.puntos_experiencia, estudianteRut]
          );
          console.log(`   💫 XP otorgado: +${logro.puntos_experiencia}`);
        }

        // Otorgar recompensa de monedas si la tiene
        if (logro.monedas_recompensa > 0) {
          await connection.query(
            'UPDATE usuarios SET monedas = monedas + ? WHERE rut = ?',
            [logro.monedas_recompensa, estudianteRut]
          );
          console.log(`   💰 Monedas otorgadas: +${logro.monedas_recompensa}`);
        }
      }
    }
  } catch (error) {
    console.error('Error al verificar logros:', error);
    // No lanzamos el error para no interrumpir el flujo principal
  }
}

// Obtener todas las misiones del estudiante
const obtenerMisiones = async (req, res) => {
  try {
    const estudianteRut = req.usuario.rut;
    const { curso, busqueda } = req.query;

    let query = `
      SELECT
        m.id,
        m.titulo as nombre,
        m.dificultad,
        m.puntos_experiencia as xp,
        em.estado,
        em.progreso,
        em.puntuacion,
        em.retroalimentacion,
        c.nombre as curso,
        c.id as curso_id
      FROM estudiante_misiones em
      INNER JOIN misiones m ON em.mision_id = m.id
      INNER JOIN cursos c ON m.curso_id = c.id
      WHERE em.estudiante_rut = ?`;

    const params = [estudianteRut];

    if (curso) {
      query += ' AND c.id = ?';
      params.push(curso);
    }

    if (busqueda) {
      query += ' AND m.titulo LIKE ?';
      params.push(`%${busqueda}%`);
    }

    query += ' ORDER BY em.created_at DESC';

    const [misiones] = await db.query(query, params);

    // Obtener lista de cursos del estudiante
    const [cursos] = await db.query(
      `SELECT DISTINCT c.id, c.nombre
       FROM cursos c
       INNER JOIN curso_estudiantes ce ON c.id = ce.curso_id
       WHERE ce.estudiante_rut = ?
       ORDER BY c.nombre`,
      [estudianteRut]
    );

    res.json({
      success: true,
      misiones,
      cursos
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
    const estudianteRut = req.usuario.rut;

    // Obtener datos de la misión
    const [misiones] = await db.query(
      `SELECT
        m.*,
        em.estado,
        em.progreso,
        em.puntuacion,
        em.retroalimentacion,
        em.fecha_inicio,
        em.fecha_completado
      FROM misiones m
      INNER JOIN estudiante_misiones em ON m.id = em.mision_id
      WHERE m.id = ? AND em.estudiante_rut = ?`,
      [id, estudianteRut]
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
      `SELECT c.nombre, c.descripcion
       FROM mision_competencias mc
       INNER JOIN competencias c ON mc.competencia_id = c.id
       WHERE mc.mision_id = ?
       ORDER BY c.nombre`,
      [id]
    );

    // Obtener pistas
    const [pistas] = await db.query(
      'SELECT texto FROM mision_pistas WHERE mision_id = ? ORDER BY orden',
      [id]
    );

    res.json({
      success: true,
      mision: {
        ...mision,
        competencias: competencias.map(c => c.descripcion || c.nombre),
        pistas: pistas.map(p => p.texto)
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
    const estudianteRut = req.usuario.rut;

    // Verificar que el estudiante tiene acceso a esta misión
    const [acceso] = await db.query(
      'SELECT id FROM estudiante_misiones WHERE estudiante_rut = ? AND mision_id = ?',
      [estudianteRut, id]
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
        a.tipo,
        a.pregunta,
        a.orden,
        a.puntos,
        a.imagen,
        a.explicacion
      FROM actividades a
      WHERE a.mision_id = ?
      ORDER BY a.orden`,
      [id]
    );

    // Para cada actividad, obtener sus opciones y respuestas del estudiante
    for (let actividad of actividades) {
      const [opciones] = await db.query(
        'SELECT id, texto, es_correcta, orden FROM actividad_opciones WHERE actividad_id = ? ORDER BY orden',
        [actividad.id]
      );
      actividad.opciones = opciones;

      // Obtener si el estudiante ya respondió esta actividad correctamente
      const [respuestas] = await db.query(
        `SELECT es_correcta, respuesta, intentos
         FROM estudiante_respuestas
         WHERE estudiante_rut = ? AND actividad_id = ? AND es_correcta = 1
         ORDER BY created_at DESC
         LIMIT 1`,
        [estudianteRut, actividad.id]
      );

      actividad.respondida = respuestas.length > 0;
      actividad.respuesta_correcta = respuestas.length > 0 ? respuestas[0].respuesta : null;
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
    const estudianteRut = req.usuario.rut;
    const { respuesta, tiempoRespuesta } = req.body;

    // Obtener datos de la actividad
    const [actividades] = await connection.query(
      `SELECT
        a.*,
        m.id as mision_id,
        m.puntos_experiencia as xp_recompensa
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

    // Verificar si la respuesta es correcta consultando las opciones
    const [opcionSeleccionada] = await connection.query(
      'SELECT es_correcta FROM actividad_opciones WHERE id = ?',
      [respuesta]
    );

    if (opcionSeleccionada.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Opción de respuesta no válida'
      });
    }

    const esCorrecta = opcionSeleccionada[0].es_correcta === 1;

    // Verificar si ya respondió esta actividad antes
    const [respuestasAnteriores] = await connection.query(
      'SELECT COUNT(*) as intentos FROM estudiante_respuestas WHERE estudiante_rut = ? AND actividad_id = ?',
      [estudianteRut, actividadId]
    );

    const intentos = respuestasAnteriores[0].intentos + 1;

    // Guardar respuesta
    await connection.query(
      `INSERT INTO estudiante_respuestas
        (estudiante_rut, actividad_id, respuesta, es_correcta, intentos, tiempo_respuesta)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [estudianteRut, actividadId, respuesta, esCorrecta, intentos, tiempoRespuesta || 0]
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
        WHERE er.estudiante_rut = ? AND a.mision_id = ? AND er.es_correcta = 1`,
        [estudianteRut, actividad.mision_id]
      );

      const progreso = Math.round((respuestasCorrectas[0].correctas / totalActividades[0].total) * 100);

      // Actualizar progreso
      await connection.query(
        `UPDATE estudiante_misiones
        SET
          progreso = ?,
          estado = CASE
            WHEN ? = 100 THEN 'completada'
            WHEN progreso > 0 THEN 'en_progreso'
            ELSE 'no_iniciada'
          END,
          fecha_completado = CASE WHEN ? = 100 THEN NOW() ELSE fecha_completado END
        WHERE estudiante_rut = ? AND mision_id = ?`,
        [progreso, progreso, progreso, estudianteRut, actividad.mision_id]
      );

      // Si completó la misión, otorgar XP y verificar logros
      if (progreso === 100) {
        console.log('🎯 Misión completada al 100%');

        // Obtener los puntos de experiencia y monedas de la misión completa
        const [misionData] = await connection.query(
          'SELECT puntos_experiencia, monedas_recompensa FROM misiones WHERE id = ?',
          [actividad.mision_id]
        );

        const xpMision = misionData[0]?.puntos_experiencia || 0;
        const monedasMision = misionData[0]?.monedas_recompensa || 0;

        console.log(`💫 Otorgando XP de misión: ${xpMision}`);
        console.log(`💰 Otorgando monedas de misión: ${monedasMision}`);

        // Otorgar XP de la misión
        await connection.query(
          'UPDATE usuarios SET experiencia = experiencia + ? WHERE rut = ?',
          [xpMision, estudianteRut]
        );

        // Otorgar monedas de la misión
        if (monedasMision > 0) {
          await connection.query(
            'UPDATE usuarios SET monedas = monedas + ? WHERE rut = ?',
            [monedasMision, estudianteRut]
          );
        }

        await connection.query(
          'UPDATE estudiante_misiones SET puntuacion = ? WHERE estudiante_rut = ? AND mision_id = ?',
          [100, estudianteRut, actividad.mision_id]
        );

        // Verificar y desbloquear logros automáticamente
        await verificarYDesbloquearLogros(connection, estudianteRut);

        // Crear evaluación pendiente para el GM
        const [gmId] = await connection.query(
          'SELECT creador_rut FROM misiones WHERE id = ?',
          [actividad.mision_id]
        );

        if (gmId.length > 0) {
          await connection.query(
            'INSERT INTO evaluaciones (gm_rut, estudiante_rut, mision_id, estado) VALUES (?, ?, ?, ?)',
            [gmId[0].creador_rut, estudianteRut, actividad.mision_id, 'pendiente']
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
    const estudianteRut = req.usuario.rut;

    await db.query(
      `UPDATE estudiante_misiones
      SET estado = 'en_progreso', fecha_inicio = NOW()
      WHERE estudiante_rut = ? AND mision_id = ? AND estado = 'no_iniciada'`,
      [estudianteRut, id]
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
