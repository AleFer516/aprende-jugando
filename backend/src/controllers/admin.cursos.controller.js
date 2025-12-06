const pool = require('../db');
const { registrarActividad } = require('../utils/actividadLogger');
const { notificarAdmins } = require('./admin.notificaciones.controller');

// Obtener todos los cursos con filtros
const getCursos = async (req, res) => {
  try {
    const { estado, busqueda } = req.query;

    let query = `
      SELECT
        c.id,
        c.nombre,
        c.descripcion,
        c.codigo_acceso,
        c.gm_rut,
        c.activo,
        c.created_at,
        c.updated_at,
        u.nombre as gm_nombre,
        COUNT(DISTINCT ce.estudiante_rut) as total_estudiantes,
        COUNT(DISTINCT m.id) as total_misiones
      FROM cursos c
      LEFT JOIN usuarios u ON c.gm_rut = u.rut
      LEFT JOIN curso_estudiantes ce ON c.id = ce.curso_id
      LEFT JOIN misiones m ON c.id = m.curso_id
      WHERE 1=1
    `;

    const params = [];

    // Filtrar por estado
    if (estado && estado !== 'Todos') {
      if (estado === 'Activo') {
        query += ' AND c.activo = 1';
      } else if (estado === 'Inactivo') {
        query += ' AND c.activo = 0';
      }
    }

    // Búsqueda por nombre o código
    if (busqueda) {
      query += ' AND (c.nombre LIKE ? OR c.codigo_acceso LIKE ? OR u.nombre LIKE ?)';
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' GROUP BY c.id ORDER BY c.created_at DESC';

    const [cursos] = await pool.query(query, params);

    res.json({
      success: true,
      data: cursos
    });
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cursos',
      error: error.message
    });
  }
};

// Obtener todos los GMs disponibles
const getGMs = async (req, res) => {
  try {
    const [gms] = await pool.query(
      `SELECT rut, nombre, email, institucion
       FROM usuarios
       WHERE rol = 'gm' AND estado = 'activo'
       ORDER BY nombre ASC`
    );

    res.json({
      success: true,
      data: gms
    });
  } catch (error) {
    console.error('Error al obtener GMs:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener GMs',
      error: error.message
    });
  }
};

// Crear nuevo curso
const crearCurso = async (req, res) => {
  try {
    console.log('🔵 === CREAR CURSO ===');
    console.log('📥 req.body:', req.body);

    const {
      nombre,
      descripcion,
      gm_rut,
      codigo_acceso,
      activo
    } = req.body;

    console.log('📋 Datos extraídos:', { nombre, descripcion, gm_rut, codigo_acceso, activo });

    // Validar campos requeridos
    if (!nombre || !gm_rut) {
      console.log('❌ Faltan campos requeridos');
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos (nombre, GM)'
      });
    }

    // Verificar que el GM existe y tiene el rol correcto
    const [gmExists] = await pool.query(
      'SELECT rut, nombre FROM usuarios WHERE rut = ? AND rol = ?',
      [gm_rut, 'gm']
    );

    if (gmExists.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El GM seleccionado no existe o no tiene el rol correcto'
      });
    }

    // Verificar si el código de acceso ya existe (si se proporcionó)
    if (codigo_acceso) {
      const [codigoExists] = await pool.query(
        'SELECT id FROM cursos WHERE codigo_acceso = ?',
        [codigo_acceso]
      );

      if (codigoExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El código de acceso ya está en uso por otro curso'
        });
      }
    }

    // Insertar curso
    const activoValue = activo !== undefined ? activo : true;
    console.log('📊 Datos a insertar:', {
      nombre,
      descripcion: descripcion || null,
      codigo_acceso: codigo_acceso || null,
      gm_rut,
      activo: activoValue
    });

    const [result] = await pool.query(
      `INSERT INTO cursos (nombre, descripcion, codigo_acceso, gm_rut, activo)
       VALUES (?, ?, ?, ?, ?)`,
      [
        nombre,
        descripcion || null,
        codigo_acceso || null,
        gm_rut,
        activoValue
      ]
    );

    console.log('✅ Curso insertado en la base de datos');

    // Obtener el curso creado
    const [nuevoCurso] = await pool.query(
      `SELECT
        c.id,
        c.nombre,
        c.descripcion,
        c.codigo_acceso,
        c.gm_rut,
        c.activo,
        c.created_at,
        u.nombre as gm_nombre
      FROM cursos c
      LEFT JOIN usuarios u ON c.gm_rut = u.rut
      WHERE c.id = ?`,
      [result.insertId]
    );

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Admin';
    await registrarActividad(
      `Nuevo curso creado: ${nombre} (asignado a ${gmExists[0].nombre})`,
      usuario,
      'curso'
    );

    // Notificar a admins
    await notificarAdmins(
      'curso',
      'Nuevo curso creado',
      `Se ha creado un nuevo curso: ${nombre} (asignado a ${gmExists[0].nombre})`,
      `/admin/cursos`
    );

    res.status(201).json({
      success: true,
      message: 'Curso creado exitosamente',
      data: nuevoCurso[0]
    });
  } catch (error) {
    console.error('Error al crear curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear curso',
      error: error.message
    });
  }
};

// Actualizar curso
const actualizarCurso = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, gm_rut, codigo_acceso, activo } = req.body;

    // Validar campos requeridos
    if (!nombre || !gm_rut) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    // Verificar si el curso existe
    const [cursoExists] = await pool.query(
      'SELECT id, nombre FROM cursos WHERE id = ?',
      [id]
    );

    if (cursoExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    // Verificar que el GM existe y tiene el rol correcto
    const [gmExists] = await pool.query(
      'SELECT rut, nombre FROM usuarios WHERE rut = ? AND rol = ?',
      [gm_rut, 'gm']
    );

    if (gmExists.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El GM seleccionado no existe o no tiene el rol correcto'
      });
    }

    // Verificar si el código de acceso ya está en uso por otro curso
    if (codigo_acceso) {
      const [codigoExists] = await pool.query(
        'SELECT id FROM cursos WHERE codigo_acceso = ? AND id != ?',
        [codigo_acceso, id]
      );

      if (codigoExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El código de acceso ya está en uso por otro curso'
        });
      }
    }

    // Actualizar curso
    const activoValue = activo !== undefined ? activo : true;
    await pool.query(
      `UPDATE cursos
       SET nombre = ?, descripcion = ?, gm_rut = ?, codigo_acceso = ?, activo = ?
       WHERE id = ?`,
      [nombre, descripcion || null, gm_rut, codigo_acceso || null, activoValue, id]
    );

    // Obtener curso actualizado
    const [cursoActualizado] = await pool.query(
      `SELECT
        c.id,
        c.nombre,
        c.descripcion,
        c.codigo_acceso,
        c.gm_rut,
        c.activo,
        c.created_at,
        c.updated_at,
        u.nombre as gm_nombre
      FROM cursos c
      LEFT JOIN usuarios u ON c.gm_rut = u.rut
      WHERE c.id = ?`,
      [id]
    );

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Admin';
    await registrarActividad(
      `Curso actualizado: ${nombre} (ID: ${id})`,
      usuario,
      'curso'
    );

    res.json({
      success: true,
      message: 'Curso actualizado exitosamente',
      data: cursoActualizado[0]
    });
  } catch (error) {
    console.error('Error al actualizar curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar curso',
      error: error.message
    });
  }
};

// Eliminar curso
const eliminarCurso = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el curso existe
    const [cursoExists] = await pool.query(
      'SELECT id, nombre FROM cursos WHERE id = ?',
      [id]
    );

    if (cursoExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    const nombreCurso = cursoExists[0].nombre;

    // Verificar si hay estudiantes que han iniciado misiones del curso
    const [estudiantesConProgreso] = await pool.query(
      `SELECT COUNT(DISTINCT em.estudiante_rut) as total
       FROM estudiante_misiones em
       INNER JOIN misiones m ON em.mision_id = m.id
       WHERE m.curso_id = ? AND (em.estado != 'no_iniciada' OR em.progreso > 0)`,
      [id]
    );

    if (estudiantesConProgreso[0].total > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el curso porque ${estudiantesConProgreso[0].total} estudiante(s) ya ha(n) comenzado misiones de este curso.`
      });
    }

    // Eliminar curso
    await pool.query('DELETE FROM cursos WHERE id = ?', [id]);

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Admin';
    await registrarActividad(
      `Curso eliminado: ${nombreCurso} (ID: ${id})`,
      usuario,
      'curso'
    );

    res.json({
      success: true,
      message: 'Curso eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar curso',
      error: error.message
    });
  }
};

module.exports = {
  getCursos,
  getGMs,
  crearCurso,
  actualizarCurso,
  eliminarCurso
};
