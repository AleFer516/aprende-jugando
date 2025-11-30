const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { registrarActividad } = require('../utils/actividadLogger');

const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Intento de login recibido');
    console.log('📧 Email:', req.body.email);
    console.log('🔑 Password length:', req.body.password?.length);

    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      console.log('❌ Validación fallida: campos vacíos');
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    // Buscar usuario en la base de datos
    console.log('🔍 Buscando usuario en la base de datos...');
    const [usuarios] = await db.query(
      'SELECT rut, nombre, email, password, rol, nivel, experiencia FROM usuarios WHERE email = ?',
      [email]
    );

    console.log('📊 Usuarios encontrados:', usuarios.length);

    if (usuarios.length === 0) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    const usuario = usuarios[0];
    console.log('✅ Usuario encontrado:', usuario.email, '| Rol:', usuario.rol);

    // Verificar contraseña
    console.log('🔐 Verificando contraseña...');
    const passwordValida = await bcrypt.compare(password, usuario.password);
    console.log('✅ Password válida:', passwordValida);

    if (!passwordValida) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // Generar token
    console.log('🎫 Generando token JWT...');
    const token = jwt.sign(
      { rut: usuario.rut, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Registrar actividad de login
    await registrarActividad(
      `Inicio de sesión exitoso`,
      usuario.nombre,
      'auditoria'
    );

    console.log('✅ Login exitoso para:', usuario.email);
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        rut: usuario.rut,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        nivel: usuario.nivel,
        experiencia: usuario.experiencia
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
});

// REGISTRO (opcional)
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validaciones
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    // Verificar si el email ya existe
    const [usuariosExistentes] = await db.query(
      'SELECT rut FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuariosExistentes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, passwordHash, rol || 'estudiante']
    );

    // Registrar actividad de registro
    await registrarActividad(
      `Nuevo usuario auto-registrado: ${nombre}`,
      'Sistema',
      'usuario'
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      usuarioId: result.insertId
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
});

module.exports = router;
