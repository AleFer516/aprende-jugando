const pool = require('../db');
const bcrypt = require('bcryptjs');
const { registrarActividad } = require('../utils/actividadLogger');
const { notificarAdmins } = require('./admin.notificaciones.controller');

// Obtener todos los usuarios con filtros
const getUsuarios = async (req, res) => {
  try {
    const { rol, estado, busqueda } = req.query;

    let query = `
      SELECT
        rut,
        nombre,
        email as correo,
        rol,
        estado,
        institucion,
        telefono,
        nivel,
        experiencia,
        avatar_url,
        created_at,
        ultimo_acceso
      FROM usuarios
      WHERE 1=1
    `;

    const params = [];

    // Filtrar por rol
    if (rol && rol !== 'Todos') {
      query += ' AND rol = ?';
      params.push(rol.toLowerCase());
    }

    // Filtrar por estado
    if (estado && estado !== 'Todos') {
      query += ' AND estado = ?';
      params.push(estado.toLowerCase());
    }

    // Búsqueda por nombre, rut o correo
    if (busqueda) {
      query += ' AND (nombre LIKE ? OR rut LIKE ? OR email LIKE ?)';
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const [usuarios] = await pool.query(query, params);

    res.json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// Crear nuevo usuario
const crearUsuario = async (req, res) => {
  try {
    console.log('🔵 === CREAR USUARIO ===');
    console.log('📥 req.body:', req.body);

    const {
      rut,
      nombre,
      correo,
      rol,
      estado,
      institucion,
      telefono,
      password
    } = req.body;

    console.log('📋 Datos extraídos:', { rut, nombre, correo, rol, estado, institucion, telefono, password: '***' });

    // Validar campos requeridos
    if (!rut || !nombre || !correo || !rol || !password) {
      console.log('❌ Faltan campos requeridos');
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos (RUT, nombre, correo, rol, contraseña)'
      });
    }

    // Validar formato de RUT (básico)
    const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
    if (!rutRegex.test(rut)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de RUT inválido. Debe ser: XX.XXX.XXX-X'
      });
    }

    // Verificar si el RUT ya existe
    const [existingRut] = await pool.query(
      'SELECT rut FROM usuarios WHERE rut = ?',
      [rut]
    );

    if (existingRut.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El RUT ya está registrado'
      });
    }

    // Verificar si el correo ya existe
    const [existingEmail] = await pool.query(
      'SELECT rut FROM usuarios WHERE email = ?',
      [correo]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }

    // Encriptar contraseña
    console.log('🔐 Encriptando contraseña...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Contraseña encriptada');

    // Insertar usuario
    const estadoValue = estado || 'activo';
    console.log('📊 Datos a insertar:', {
      rut,
      nombre,
      correo,
      rol: rol.toLowerCase(),
      estado: estadoValue.toLowerCase(),
      institucion: institucion || null,
      telefono: telefono || null
    });

    await pool.query(
      `INSERT INTO usuarios (rut, nombre, email, password, rol, estado, institucion, telefono)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [rut, nombre, correo, hashedPassword, rol.toLowerCase(), estadoValue.toLowerCase(), institucion || null, telefono || null]
    );

    console.log('✅ Usuario insertado en la base de datos');

    // Obtener el usuario creado
    const [nuevoUsuario] = await pool.query(
      `SELECT
        rut,
        nombre,
        email as correo,
        rol,
        estado,
        institucion,
        telefono,
        nivel,
        experiencia
      FROM usuarios
      WHERE rut = ?`,
      [rut]
    );

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Admin';
    await registrarActividad(
      `Nuevo usuario registrado: ${nombre} (${rut})`,
      usuario,
      'usuario'
    );

    // Crear notificación para todos los admins
    await notificarAdmins(
      'usuario',
      'Nuevo usuario registrado',
      `Se ha registrado un nuevo usuario: ${nombre} (${rol})`,
      `/admin/usuarios`
    );

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: nuevoUsuario[0]
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
};

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
  try {
    const { rut } = req.params;
    const { nombre, correo, rol, estado, institucion, telefono } = req.body;

    // Validar campos requeridos
    if (!nombre || !correo || !rol) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    // Verificar si el usuario existe
    const [userExists] = await pool.query(
      'SELECT rut FROM usuarios WHERE rut = ?',
      [rut]
    );

    if (userExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si el correo ya está en uso por otro usuario
    const [emailExists] = await pool.query(
      'SELECT rut FROM usuarios WHERE email = ? AND rut != ?',
      [correo, rut]
    );

    if (emailExists.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está en uso por otro usuario'
      });
    }

    // Actualizar usuario
    const estadoValue = estado || 'activo';
    await pool.query(
      `UPDATE usuarios
       SET nombre = ?, email = ?, rol = ?, estado = ?, institucion = ?, telefono = ?
       WHERE rut = ?`,
      [nombre, correo, rol.toLowerCase(), estadoValue.toLowerCase(), institucion || null, telefono || null, rut]
    );

    // Obtener usuario actualizado
    const [usuarioActualizado] = await pool.query(
      `SELECT
        rut,
        nombre,
        email as correo,
        rol,
        estado,
        institucion,
        telefono,
        nivel,
        experiencia
      FROM usuarios
      WHERE rut = ?`,
      [rut]
    );

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Admin';
    await registrarActividad(
      `Usuario actualizado: ${nombre} (${rut})`,
      usuario,
      'usuario'
    );

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuarioActualizado[0]
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

// Eliminar usuario
const eliminarUsuario = async (req, res) => {
  try {
    const { rut } = req.params;

    // Verificar si el usuario existe
    const [userExists] = await pool.query(
      'SELECT nombre FROM usuarios WHERE rut = ?',
      [rut]
    );

    if (userExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const nombreUsuario = userExists[0].nombre;

    // Eliminar usuario
    await pool.query('DELETE FROM usuarios WHERE rut = ?', [rut]);

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Admin';
    await registrarActividad(
      `Usuario eliminado: ${nombreUsuario} (${rut})`,
      usuario,
      'usuario'
    );

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

module.exports = {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
};
