const jwt = require('jsonwebtoken');
const db = require('../db');

// Middleware para verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener información del usuario desde la base de datos
    const [usuarios] = await db.query(
      'SELECT id, nombre, email, rol, nivel, experiencia FROM usuarios WHERE id = ?',
      [decoded.id]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.usuario = usuarios[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(500).json({ message: 'Error al verificar token', error: error.message });
  }
};

// Middleware para verificar rol de usuario
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

module.exports = {
  verificarToken,
  verificarRol
};
