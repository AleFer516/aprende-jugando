const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getPerfil,
  actualizarPerfil,
  cambiarPassword,
  subirAvatar
} = require('../controllers/admin.perfil.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
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
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB máximo
  }
});

// Proteger todas las rutas con autenticación y verificar rol admin
router.use(verificarToken);
router.use(verificarRol(['admin']));

// Rutas de perfil
router.get('/', getPerfil);
router.put('/', actualizarPerfil);
router.put('/password', cambiarPassword);
router.post('/avatar', upload.single('avatar'), subirAvatar);

module.exports = router;
