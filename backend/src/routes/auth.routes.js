const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// LOGIN (simulado por ahora, sin BD real)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validaciones básicas
  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Todos los campos son obligatorios' 
    });
  }

  // Usuario de prueba (por ahora sin base de datos)
  const usuarioSimulado = {
    id: 1,
    nombre: 'Alejandra',
    email: 'test@test.com',
    password: '123456'
  };

  // Validar credenciales
  if (
    email !== usuarioSimulado.email || 
    password !== usuarioSimulado.password
  ) {
    return res.status(401).json({ 
      message: 'Credenciales incorrectas' 
    });
  }

  // Generar token
  const token = jwt.sign(
    { id: usuarioSimulado.id },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.json({
    message: 'Inicio de sesión exitoso ✅',
    token,
    usuario: {
      id: usuarioSimulado.id,
      nombre: usuarioSimulado.nombre,
      email: usuarioSimulado.email
    }
  });
});

module.exports = router;
