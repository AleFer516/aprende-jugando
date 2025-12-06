const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getConfiguracion,
  actualizarConfiguracion,
  actualizarPoliticasPassword,
  actualizarAutenticacion,
  generarRespaldo,
  actualizarRespaldoAutomatico,
  ejecutarDiagnostico,
  subirLogo,
  getRoles,
  crearRol,
  toggleRol,
  eliminarRol
} = require('../controllers/admin.configuracion.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Configuración de multer para subir logos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/logos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, svg)'));
    }
  }
});

// Proteger todas las rutas con autenticación y verificar rol admin
router.use(verificarToken);
router.use(verificarRol(['admin']));

// Rutas de configuración
router.get('/', getConfiguracion);
router.put('/general', actualizarConfiguracion);
router.put('/politicas-password', actualizarPoliticasPassword);
router.put('/autenticacion', actualizarAutenticacion);
router.post('/respaldo', generarRespaldo);
router.put('/respaldo-automatico', actualizarRespaldoAutomatico);
router.post('/diagnostico', ejecutarDiagnostico);
router.post('/logo', upload.single('logo'), subirLogo);

// Rutas de roles
router.get('/roles', getRoles);
router.post('/roles', crearRol);
router.put('/roles/:nombre/toggle', toggleRol);
router.delete('/roles/:id', eliminarRol);

module.exports = router;
