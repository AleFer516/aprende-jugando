const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const { registrarActividad } = require('../utils/actividadLogger');
const { enviarEmailRecuperacion } = require('../config/email');

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

// REGISTRO DE ESTUDIANTES
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Solicitud de registro recibida');
    const { nombre, email, password, rut, institucion, fechaNacimiento } = req.body;

    // Validaciones
    if (!nombre || !email || !password || !rut) {
      console.log('❌ Faltan campos obligatorios');
      return res.status(400).json({
        success: false,
        message: 'Nombre, email, contraseña y RUT son obligatorios'
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

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|cl)$/i;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El correo debe terminar en .com o .cl'
      });
    }

    // Verificar si el RUT ya existe
    const [rutExistente] = await db.query(
      'SELECT rut FROM usuarios WHERE rut = ?',
      [rut]
    );

    if (rutExistente.length > 0) {
      console.log('❌ RUT ya registrado');
      return res.status(400).json({
        success: false,
        message: 'El RUT ya está registrado'
      });
    }

    // Verificar si el email ya existe
    const [emailExistente] = await db.query(
      'SELECT rut FROM usuarios WHERE email = ?',
      [email]
    );

    if (emailExistente.length > 0) {
      console.log('❌ Email ya registrado');
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Validar seguridad de contraseña
    const passwordSeguraRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}\[\]:;"'<>,.?/~`|\\]).{8,}$/;
    if (!passwordSeguraRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo'
      });
    }

    // Encriptar contraseña
    console.log('🔐 Encriptando contraseña...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario estudiante
    console.log('📥 Creando usuario estudiante...');
    await db.query(
      `INSERT INTO usuarios (rut, nombre, email, password, rol, estado, institucion, fecha_nacimiento)
       VALUES (?, ?, ?, ?, 'estudiante', 'activo', ?, ?)`,
      [rut, nombre, email, passwordHash, institucion || null, fechaNacimiento || null]
    );

    // Registrar actividad de registro
    await registrarActividad(
      `Nuevo estudiante auto-registrado: ${nombre} (${rut})`,
      'Sistema',
      'usuario'
    );

    // Notificar a los admins
    const { notificarAdmins } = require('../controllers/admin.notificaciones.controller');
    await notificarAdmins(
      'usuario',
      'Nuevo estudiante registrado',
      `${nombre} se ha registrado en el sistema`,
      '/admin/usuarios'
    );

    console.log('✅ Estudiante registrado exitosamente');
    res.status(201).json({
      success: true,
      message: 'Estudiante registrado exitosamente. Ya puedes iniciar sesión.'
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar estudiante',
      error: error.message
    });
  }
});

// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
router.post('/forgot-password', async (req, res) => {
  try {
    console.log('🔐 Solicitud de recuperación de contraseña recibida');
    const { email } = req.body;

    // Validación
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es obligatorio'
      });
    }

    // Buscar usuario por email
    const [usuarios] = await db.query(
      'SELECT rut, nombre, email FROM usuarios WHERE email = ?',
      [email]
    );

    // Por seguridad, siempre devolvemos el mismo mensaje
    // aunque el usuario no exista (evitar enumeración de usuarios)
    if (usuarios.length === 0) {
      console.log('⚠️ Email no encontrado, pero devolvemos mensaje genérico');
      return res.json({
        success: true,
        message: 'Si el email existe, recibirás un correo con instrucciones para restablecer tu contraseña'
      });
    }

    const usuario = usuarios[0];
    console.log('✅ Usuario encontrado:', usuario.email);

    // Generar token único y seguro
    const token = crypto.randomBytes(32).toString('hex');
    console.log('🎫 Token generado');

    // Calcular fecha de expiración (1 hora desde ahora)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token en la base de datos
    await db.query(
      `INSERT INTO password_reset_tokens (usuario_rut, token, expires_at, used)
       VALUES (?, ?, ?, 0)`,
      [usuario.rut, token, expiresAt]
    );
    console.log('💾 Token guardado en la base de datos');

    // Enviar email con el token
    try {
      await enviarEmailRecuperacion(usuario.email, usuario.nombre, token);
      console.log('📧 Email de recuperación enviado');

      // Registrar actividad
      await registrarActividad(
        `Solicitud de recuperación de contraseña para: ${usuario.email}`,
        usuario.nombre,
        'auditoria'
      );

      res.json({
        success: true,
        message: 'Si el email existe, recibirás un correo con instrucciones para restablecer tu contraseña'
      });
    } catch (emailError) {
      console.error('❌ Error al enviar email:', emailError);

      // Eliminar el token si no se pudo enviar el email
      await db.query(
        'DELETE FROM password_reset_tokens WHERE token = ?',
        [token]
      );

      return res.status(500).json({
        success: false,
        message: 'Error al enviar el correo de recuperación. Verifica la configuración de email.',
        error: emailError.message
      });
    }
  } catch (error) {
    console.error('❌ Error en forgot-password:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
});

// RESTABLECER CONTRASEÑA CON TOKEN
router.post('/reset-password', async (req, res) => {
  try {
    console.log('🔐 Solicitud de restablecimiento de contraseña recibida');
    const { token, newPassword } = req.body;

    // Validaciones
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son obligatorios'
      });
    }

    // Validar seguridad de la nueva contraseña
    const passwordSeguraRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}\[\]:;"'<>,.?/~`|\\]).{8,}$/;
    if (!passwordSeguraRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo'
      });
    }

    // Buscar el token en la base de datos
    const [tokens] = await db.query(
      `SELECT t.id, t.usuario_rut, t.expires_at, t.used, u.nombre, u.email
       FROM password_reset_tokens t
       INNER JOIN usuarios u ON t.usuario_rut = u.rut
       WHERE t.token = ?`,
      [token]
    );

    if (tokens.length === 0) {
      console.log('❌ Token no encontrado');
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    const tokenData = tokens[0];

    // Verificar si el token ya fue usado
    if (tokenData.used === 1) {
      console.log('❌ Token ya fue usado');
      return res.status(400).json({
        success: false,
        message: 'Este token ya ha sido utilizado'
      });
    }

    // Verificar si el token expiró
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    if (now > expiresAt) {
      console.log('❌ Token expirado');
      return res.status(400).json({
        success: false,
        message: 'El token ha expirado. Solicita uno nuevo.'
      });
    }

    console.log('✅ Token válido');

    // Encriptar la nueva contraseña
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña del usuario
    await db.query(
      'UPDATE usuarios SET password = ? WHERE rut = ?',
      [passwordHash, tokenData.usuario_rut]
    );
    console.log('🔐 Contraseña actualizada');

    // Marcar el token como usado
    await db.query(
      'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
      [tokenData.id]
    );
    console.log('✅ Token marcado como usado');

    // Registrar actividad
    await registrarActividad(
      `Contraseña restablecida exitosamente para: ${tokenData.email}`,
      tokenData.nombre,
      'auditoria'
    );

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
    });
  } catch (error) {
    console.error('❌ Error en reset-password:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restablecer la contraseña',
      error: error.message
    });
  }
});

module.exports = router;
