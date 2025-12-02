const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  obtenerInformacionPersonal,
  actualizarInformacionPersonal,
  obtenerConfiguracion,
  actualizarConfiguracion,
  cambiarContrasena,
  subirAvatar,
  eliminarAvatar
} = require('../controllers/gm.configuracion.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Configuración de multer para subir avatares
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatares/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Aceptar solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: fileFilter
});

// Todas las rutas requieren autenticación y rol GM
router.use(verificarToken);
router.use(verificarRol(['gm', 'admin']));

// Información personal
router.get('/informacion-personal', obtenerInformacionPersonal);
router.put('/informacion-personal', actualizarInformacionPersonal);

// Avatar
router.post('/avatar', upload.single('avatar'), subirAvatar);
router.delete('/avatar', eliminarAvatar);

// Obtener configuración
router.get('/', obtenerConfiguracion);

// Actualizar configuración
router.put('/', actualizarConfiguracion);

// Cambiar contraseña
router.put('/cambiar-contrasena', cambiarContrasena);

module.exports = router;
