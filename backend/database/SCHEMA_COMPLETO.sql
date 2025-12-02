-- ==========================================
-- SCHEMA COMPLETO - APRENDE JUGANDO
-- ==========================================
-- Base de datos gamificada de aprendizaje
-- Incluye tablas para Admin, GM y Estudiantes
-- ==========================================
--
-- NOTAS IMPORTANTES SOBRE VALORES ENUM:
-- ==========================================
-- 1. Estado de misiones (tabla: estudiante_misiones):
--    Valores válidos: 'no_iniciada', 'en_progreso', 'completada',
--                     'revisando', 'aprobada', 'rechazada', 'abandonada'
--    NO usar: 'Pendiente', 'En progreso', 'Completada' (mayúsculas)
--
-- 2. Columnas de texto en tabla mision_pistas:
--    Usar columna 'texto', NO 'descripcion'
--
-- 3. Columnas de texto en tabla misiones:
--    Usar columna 'titulo', NO 'nombre'
--    Usar columna 'creador_rut', NO 'gm_rut'
-- ==========================================

-- Eliminar y crear base de datos desde cero
DROP DATABASE IF EXISTS aprende_jugando;
CREATE DATABASE aprende_jugando;
USE aprende_jugando;

-- ==========================================
-- TABLA PRINCIPAL: USUARIOS
-- ==========================================
-- Almacena todos los usuarios del sistema (admin, gm, estudiante)
-- RUT es la PRIMARY KEY (formato: 12.345.678-9)
CREATE TABLE usuarios (
  rut VARCHAR(12) PRIMARY KEY COMMENT 'RUT chileno formato XX.XXX.XXX-X',
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt con 10 rounds',
  rol ENUM('admin', 'gm', 'estudiante') NOT NULL DEFAULT 'estudiante',
  nivel INT DEFAULT 1,
  experiencia INT DEFAULT 0,
  monedas INT DEFAULT 0,
  estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
  institucion VARCHAR(200),
  fecha_nacimiento DATE NULL COMMENT 'Fecha de nacimiento del usuario',
  telefono VARCHAR(20) COMMENT 'Número de teléfono de contacto',
  avatar VARCHAR(500) COMMENT 'Ruta del archivo de avatar del usuario',
  notificaciones_email BOOLEAN DEFAULT TRUE COMMENT 'Activar notificaciones por email',
  notificaciones_sistema BOOLEAN DEFAULT TRUE COMMENT 'Activar notificaciones en el sistema',
  ultimo_acceso TIMESTAMP NULL COMMENT 'Última vez que el usuario inició sesión',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rol (rol),
  INDEX idx_email (email),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla principal de usuarios del sistema';

-- ==========================================
-- TABLAS DE CONFIGURACIÓN DEL SISTEMA (ADMIN)
-- ==========================================

-- Configuraciones generales del sistema
CREATE TABLE configuracion_sistema (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_sistema VARCHAR(255) DEFAULT 'Aprende Jugando',
  tema VARCHAR(50) DEFAULT 'claro',
  tiempo_inactividad INT DEFAULT 15,
  zona_horaria VARCHAR(100) DEFAULT 'GMT-3 Santiago',
  logo_url VARCHAR(500),
  politicas_password JSON,
  autenticacion JSON,
  respaldo_automatico BOOLEAN DEFAULT TRUE,
  ultimo_respaldo DATETIME,
  tamano_backup VARCHAR(50) DEFAULT '0 MB',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logs de auditoría del sistema
CREATE TABLE logs_auditoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_rut VARCHAR(12),
  accion VARCHAR(100) NOT NULL,
  tabla_afectada VARCHAR(100),
  registro_id VARCHAR(50),
  datos_anteriores JSON,
  datos_nuevos JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_rut) REFERENCES usuarios(rut) ON DELETE SET NULL,
  INDEX idx_usuario (usuario_rut),
  INDEX idx_accion (accion),
  INDEX idx_tabla (tabla_afectada),
  INDEX idx_fecha (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Actividad del sistema (para dashboard admin)
CREATE TABLE actividad_admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  usuario VARCHAR(100),
  tipo ENUM('usuario', 'sistema', 'configuracion', 'auditoria') DEFAULT 'sistema',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fecha (fecha),
  INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles del sistema
CREATE TABLE roles_sistema (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  tipo ENUM('Sistema', 'Personalizado', 'Lectura', 'Gestor') DEFAULT 'Personalizado',
  activo BOOLEAN DEFAULT TRUE,
  permisos JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tipo (tipo),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLAS DE GAMIFICACIÓN
-- ==========================================

-- Logros del sistema
CREATE TABLE logros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(255),
  condicion VARCHAR(100) NOT NULL,
  valor_requerido INT,
  puntos_experiencia INT DEFAULT 0,
  monedas_recompensa INT DEFAULT 0,
  rareza ENUM('comun', 'raro', 'epico', 'legendario') DEFAULT 'comun',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_condicion (condicion),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logros obtenidos por estudiantes
CREATE TABLE estudiante_logros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_rut VARCHAR(12) NOT NULL,
  logro_id INT NOT NULL,
  obtenido_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
  FOREIGN KEY (logro_id) REFERENCES logros(id) ON DELETE CASCADE,
  UNIQUE KEY unique_estudiante_logro (estudiante_rut, logro_id),
  INDEX idx_estudiante (estudiante_rut),
  INDEX idx_logro (logro_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLAS DE CURSOS Y CONTENIDO (GM)
-- ==========================================

-- Cursos creados por Game Masters
CREATE TABLE cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  codigo_acceso VARCHAR(20) UNIQUE,
  gm_rut VARCHAR(12) NOT NULL,
  imagen VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (gm_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
  INDEX idx_gm (gm_rut),
  INDEX idx_codigo (codigo_acceso),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Estudiantes inscritos en cursos
CREATE TABLE curso_estudiantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  estudiante_rut VARCHAR(12) NOT NULL,
  progreso DECIMAL(5,2) DEFAULT 0.00,
  inscrito_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
  UNIQUE KEY unique_curso_estudiante (curso_id, estudiante_rut),
  INDEX idx_curso (curso_id),
  INDEX idx_estudiante (estudiante_rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Misiones/actividades del curso
CREATE TABLE misiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT,
  tipo ENUM('lectura', 'ejercicio', 'examen', 'proyecto', 'desafio') NOT NULL,
  dificultad ENUM('facil', 'medio', 'dificil') DEFAULT 'medio',
  puntos_experiencia INT DEFAULT 0,
  monedas_recompensa INT DEFAULT 0,
  orden INT DEFAULT 0,
  fecha_inicio DATETIME,
  fecha_limite DATETIME,
  activo BOOLEAN DEFAULT true,
  creador_rut VARCHAR(12),
  categoria ENUM('matematicas', 'ciencias', 'lenguaje', 'historia', 'arte', 'deportes', 'tecnologia', 'otros') DEFAULT 'otros',
  tiempo_estimado INT,
  contenido JSON,
  competencias_json JSON COMMENT 'Competencias de la misión en formato JSON',
  estado ENUM('activa', 'inactiva', 'borrador') DEFAULT 'activa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (creador_rut) REFERENCES usuarios(rut) ON DELETE SET NULL,
  INDEX idx_curso (curso_id),
  INDEX idx_tipo (tipo),
  INDEX idx_dificultad (dificultad),
  INDEX idx_estado (estado),
  INDEX idx_creador (creador_rut),
  INDEX idx_activo (activo),
  INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Progreso de estudiantes en misiones
CREATE TABLE estudiante_misiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mision_id INT NOT NULL,
  estudiante_rut VARCHAR(12) NOT NULL,
  estado ENUM('no_iniciada', 'en_progreso', 'completada', 'revisando', 'aprobada', 'rechazada', 'abandonada') DEFAULT 'no_iniciada',
  puntuacion DECIMAL(5,2),
  intentos INT DEFAULT 0,
  progreso INT DEFAULT 0,
  fecha_inicio TIMESTAMP NULL,
  fecha_completado TIMESTAMP NULL,
  tiempo_total INT,
  respuestas JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mision_id) REFERENCES misiones(id) ON DELETE CASCADE,
  FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
  UNIQUE KEY unique_mision_estudiante (mision_id, estudiante_rut),
  INDEX idx_mision (mision_id),
  INDEX idx_estudiante (estudiante_rut),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Actividades dentro de las misiones
CREATE TABLE actividades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mision_id INT NOT NULL,
  tipo ENUM('opcion_multiple', 'verdadero_falso', 'completar', 'ordenar', 'relacionar', 'abierta') NOT NULL,
  pregunta TEXT NOT NULL,
  orden INT DEFAULT 0,
  puntos INT DEFAULT 1,
  imagen VARCHAR(255),
  explicacion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mision_id) REFERENCES misiones(id) ON DELETE CASCADE,
  INDEX idx_mision (mision_id),
  INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Opciones de respuesta para actividades
CREATE TABLE actividad_opciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actividad_id INT NOT NULL,
  texto TEXT NOT NULL,
  es_correcta BOOLEAN DEFAULT false,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE,
  INDEX idx_actividad (actividad_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Respuestas de estudiantes a actividades
CREATE TABLE estudiante_respuestas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actividad_id INT NOT NULL,
  estudiante_rut VARCHAR(12) NOT NULL,
  respuesta TEXT,
  opcion_id INT,
  es_correcta BOOLEAN,
  puntos_obtenidos INT DEFAULT 0,
  retroalimentacion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE,
  FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
  FOREIGN KEY (opcion_id) REFERENCES actividad_opciones(id) ON DELETE SET NULL,
  INDEX idx_actividad (actividad_id),
  INDEX idx_estudiante (estudiante_rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLAS DE EVALUACIÓN (GM)
-- ==========================================

-- Evaluaciones/calificaciones de misiones
CREATE TABLE evaluaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mision_id INT NOT NULL,
  estudiante_rut VARCHAR(12) NOT NULL,
  gm_rut VARCHAR(12) NOT NULL,
  calificacion DECIMAL(5,2),
  comentarios TEXT,
  estado ENUM('pendiente', 'revisada', 'aprobada', 'rechazada') DEFAULT 'pendiente',
  fecha_entrega TIMESTAMP NULL,
  fecha_revision TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mision_id) REFERENCES misiones(id) ON DELETE CASCADE,
  FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
  FOREIGN KEY (gm_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
  INDEX idx_mision (mision_id),
  INDEX idx_estudiante (estudiante_rut),
  INDEX idx_gm (gm_rut),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLAS AUXILIARES
-- ==========================================

-- Instituciones educativas
CREATE TABLE instituciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL UNIQUE,
  tipo ENUM('escuela', 'colegio', 'universidad', 'instituto') DEFAULT 'colegio',
  direccion VARCHAR(300),
  ciudad VARCHAR(100),
  region VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Competencias/habilidades del sistema
CREATE TABLE competencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(50),
  icono VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Competencias asociadas a misiones
CREATE TABLE mision_competencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mision_id INT NOT NULL,
  competencia_id INT NOT NULL,
  nivel_requerido INT DEFAULT 1,
  FOREIGN KEY (mision_id) REFERENCES misiones(id) ON DELETE CASCADE,
  FOREIGN KEY (competencia_id) REFERENCES competencias(id) ON DELETE CASCADE,
  UNIQUE KEY unique_mision_competencia (mision_id, competencia_id),
  INDEX idx_mision (mision_id),
  INDEX idx_competencia (competencia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pistas/ayudas para misiones
CREATE TABLE mision_pistas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mision_id INT NOT NULL,
  texto TEXT NOT NULL,
  costo_monedas INT DEFAULT 0,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mision_id) REFERENCES misiones(id) ON DELETE CASCADE,
  INDEX idx_mision (mision_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notificaciones del sistema
CREATE TABLE notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_rut VARCHAR(12) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  mensaje TEXT,
  leida BOOLEAN DEFAULT false,
  link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
  INDEX idx_usuario (usuario_rut),
  INDEX idx_leida (leida),
  INDEX idx_fecha (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tokens de recuperación de contraseña
CREATE TABLE password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_rut VARCHAR(12) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0 COMMENT '0 = no usado, 1 = usado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (usuario_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,

  INDEX idx_token (token),
  INDEX idx_usuario_rut (usuario_rut),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tokens de recuperación de contraseña con expiración de 1 hora';

-- ==========================================
-- DATOS INICIALES - USUARIOS
-- ==========================================
-- Contraseña para TODOS los usuarios: password123
-- Hashes bcrypt (10 rounds) verificados y funcionales
-- ==========================================

INSERT INTO usuarios (rut, nombre, email, password, rol, nivel, experiencia, monedas, estado, institucion) VALUES
(
  '12.345.678-9',
  'Admin Test',
  'admin@test.com',
  '$2b$10$Z0SzqC4oC.yVV3a33Mua/.58KNiH3pBElJQT6UT9SWYvfTo6YrOSq',
  'admin',
  10,
  5000,
  1000,
  'activo',
  'Instituto Nacional'
),
(
  '98.765.432-1',
  'Profesor Garcia',
  'gm@test.com',
  '$2b$10$yDSeEhy/h5yf6Ywj0b1SiOFTomtkevNP5EkXYjAvTFakPk8my/9Ei',
  'gm',
  8,
  3500,
  500,
  'activo',
  'Universidad de Chile'
),
(
  '11.222.333-4',
  'Estudiante Test',
  'estudiante@test.com',
  '$2b$10$yKyWzl4SZSGCKJqUtDH54.EaPpGaVCAyPC5SycIuFVKXIvNYduc/S',
  'estudiante',
  5,
  1200,
  200,
  'activo',
  'Colegio San Ignacio'
),
(
  '11.222.333-5',
  'María González',
  'estudiante1@test.com',
  '$2b$10$yKyWzl4SZSGCKJqUtDH54.EaPpGaVCAyPC5SycIuFVKXIvNYduc/S',
  'estudiante',
  3,
  750,
  150,
  'activo',
  'Liceo Carmela Carvajal'
),
(
  '22.333.444-5',
  'Juan Pérez',
  'estudiante2@test.com',
  '$2b$10$yKyWzl4SZSGCKJqUtDH54.EaPpGaVCAyPC5SycIuFVKXIvNYduc/S',
  'estudiante',
  7,
  2100,
  350,
  'activo',
  'Instituto Nacional'
);

-- ==========================================
-- DATOS INICIALES - CONFIGURACIÓN
-- ==========================================

INSERT INTO configuracion_sistema
  (id, nombre_sistema, tema, tiempo_inactividad, zona_horaria, politicas_password, autenticacion, respaldo_automatico)
VALUES
(
  1,
  'Aprende Jugando',
  'claro',
  15,
  'GMT-3 Santiago',
  JSON_OBJECT(
    'minChars', true,
    'mayusculas', true,
    'numeros', true,
    'simbolos', true,
    'expiracion', '90'
  ),
  JSON_OBJECT(
    'twoFactor', true,
    'maxIntentos', '5'
  ),
  true
);

-- ==========================================
-- DATOS INICIALES - ROLES
-- ==========================================

INSERT INTO roles_sistema (nombre, descripcion, tipo, activo, permisos) VALUES
(
  'estudiante',
  'Acceso a misiones y progreso personal.',
  'Sistema',
  true,
  JSON_OBJECT(
    'gestionarUsuarios', false,
    'gestionarMisiones', false,
    'verReportes', false
  )
),
(
  'gm',
  'Gestiona misiones y grupos de estudiantes.',
  'Sistema',
  true,
  JSON_OBJECT(
    'gestionarUsuarios', false,
    'gestionarMisiones', true,
    'verReportes', true
  )
),
(
  'admin',
  'Control total del sistema y seguridad.',
  'Sistema',
  true,
  JSON_OBJECT(
    'gestionarUsuarios', true,
    'gestionarMisiones', true,
    'verReportes', true
  )
);

-- ==========================================
-- DATOS INICIALES - INSTITUCIONES
-- ==========================================

INSERT INTO instituciones (nombre, tipo, ciudad, region) VALUES
('Instituto Nacional', 'colegio', 'Santiago', 'Metropolitana'),
('Universidad de Chile', 'universidad', 'Santiago', 'Metropolitana'),
('Colegio San Ignacio', 'colegio', 'Santiago', 'Metropolitana'),
('Universidad Técnica Federico Santa María', 'universidad', 'Valparaíso', 'Valparaíso'),
('Liceo Carmela Carvajal', 'colegio', 'Santiago', 'Metropolitana');

-- ==========================================
-- DATOS INICIALES - LOGROS
-- ==========================================

INSERT INTO logros (nombre, descripcion, icono, condicion, valor_requerido, puntos_experiencia, monedas_recompensa, rareza) VALUES
('Primer Paso', 'Completa tu primera misión', '🎯', 'misiones_completadas', 1, 50, 10, 'comun'),
('Estudiante Dedicado', 'Completa 10 misiones', '📚', 'misiones_completadas', 10, 200, 50, 'raro'),
('Maestro del Conocimiento', 'Completa 50 misiones', '🏆', 'misiones_completadas', 50, 1000, 200, 'epico'),
('Leyenda', 'Alcanza el nivel 10', '⭐', 'nivel', 10, 500, 100, 'legendario'),
('Coleccionista', 'Obtén 1000 monedas', '💰', 'monedas', 1000, 300, 0, 'raro');

-- ==========================================
-- DATOS INICIALES - COMPETENCIAS
-- ==========================================

INSERT INTO competencias (nombre, descripcion, categoria, icono) VALUES
('Razonamiento Lógico', 'Capacidad de analizar y resolver problemas', 'cognitiva', '🧠'),
('Matemáticas', 'Habilidades matemáticas y numéricas', 'academica', '🔢'),
('Comprensión Lectora', 'Capacidad de entender textos escritos', 'academica', '📖'),
('Creatividad', 'Capacidad de generar ideas innovadoras', 'cognitiva', '🎨');

-- ==========================================
-- DATOS DE PRUEBA - CURSOS GM
-- ==========================================

INSERT INTO cursos (nombre, descripcion, codigo_acceso, gm_rut, activo) VALUES
(
  'Matemáticas 1° Básico',
  'Curso de introducción a las matemáticas para primer año básico. Aprenderemos números, sumas, restas y conceptos básicos.',
  'MAT1B2025',
  '98.765.432-1',
  true
),
(
  'Ciencias Naturales',
  'Exploración del mundo natural, el sistema solar y los seres vivos.',
  'CIEN2025',
  '98.765.432-1',
  true
);

-- ==========================================
-- DATOS DE PRUEBA - ESTUDIANTES EN CURSOS
-- ==========================================

INSERT INTO curso_estudiantes (curso_id, estudiante_rut, progreso) VALUES
(1, '11.222.333-4', 60.00),
(1, '11.222.333-5', 45.50),
(1, '22.333.444-5', 30.25),
(2, '11.222.333-4', 55.75),
(2, '22.333.444-5', 20.00);

-- ==========================================
-- DATOS DE PRUEBA - MISIONES
-- ==========================================

INSERT INTO misiones (curso_id, titulo, descripcion, tipo, dificultad, puntos_experiencia, monedas_recompensa, orden, activo, creador_rut) VALUES
(
  1,
  'Introducción a los Números',
  'Aprende a contar del 1 al 10 y completa las actividades básicas.',
  'ejercicio',
  'facil',
  50,
  10,
  1,
  true,
  '98.765.432-1'
),
(
  1,
  'Suma y Resta Básica',
  'Practica sumas y restas con números del 1 al 20.',
  'ejercicio',
  'medio',
  100,
  20,
  2,
  true,
  '98.765.432-1'
),
(
  1,
  'Examen de Matemáticas Básicas',
  'Demuestra lo que has aprendido en un examen completo.',
  'examen',
  'medio',
  200,
  50,
  3,
  true,
  '98.765.432-1'
),
(
  2,
  'El Sistema Solar',
  'Explora los planetas y aprende sobre nuestro sistema solar.',
  'lectura',
  'facil',
  75,
  15,
  1,
  true,
  '98.765.432-1'
),
(
  2,
  'Los Seres Vivos',
  'Descubre las características de los seres vivos.',
  'lectura',
  'medio',
  100,
  25,
  2,
  true,
  '98.765.432-1'
);

-- ==========================================
-- DATOS DE PRUEBA - PROGRESO DE ESTUDIANTES
-- ==========================================
-- Estados: no_iniciada, en_progreso, completada, revisando, aprobada, rechazada
-- Las misiones 'completada' aparecerán en el panel de evaluaciones del GM

INSERT INTO estudiante_misiones (mision_id, estudiante_rut, estado, progreso, puntuacion, intentos, fecha_inicio, fecha_completado) VALUES
-- Estudiante Test (11.222.333-4) - Curso Matemáticas
(1, '11.222.333-4', 'completada', 100, 88.00, 2, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(2, '11.222.333-4', 'completada', 100, 92.00, 1, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, '11.222.333-4', 'en_progreso', 45, NULL, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), NULL),

-- María González (11.222.333-5) - Curso Matemáticas
(1, '11.222.333-5', 'completada', 100, 95.00, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, '11.222.333-5', 'completada', 100, 87.50, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, '11.222.333-5', 'no_iniciada', 0, NULL, 0, NULL, NULL),

-- Juan Pérez (22.333.444-5) - Curso Matemáticas
(1, '22.333.444-5', 'aprobada', 100, 100.00, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY)),
(2, '22.333.444-5', 'completada', 100, 91.00, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, '22.333.444-5', 'en_progreso', 30, NULL, 1, NOW(), NULL),

-- Estudiante Test (11.222.333-4) - Curso Ciencias
(4, '11.222.333-4', 'completada', 100, 85.00, 1, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
(5, '11.222.333-4', 'en_progreso', 50, NULL, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), NULL),

-- Juan Pérez (22.333.444-5) - Curso Ciencias
(4, '22.333.444-5', 'completada', 100, 78.00, 2, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(5, '22.333.444-5', 'completada', 100, 93.00, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW());

-- ==========================================
-- DATOS DE PRUEBA - EVALUACIONES
-- ==========================================

INSERT INTO evaluaciones (mision_id, estudiante_rut, gm_rut, calificacion, comentarios, estado, fecha_entrega, fecha_revision) VALUES
(1, '11.222.333-4', '98.765.432-1', 88.00, 'Buen trabajo, pero revisa las sumas con acarreo.', 'aprobada', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(2, '11.222.333-4', '98.765.432-1', 92.00, 'Muy bien! Dominas las restas.', 'aprobada', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, '11.222.333-5', '98.765.432-1', 95.00, 'Excelente trabajo, sigue así!', 'aprobada', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, '22.333.444-5', '98.765.432-1', 100.00, 'Perfecto! Excelente comprensión.', 'aprobada', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY)),
(3, '11.222.333-4', '98.765.432-1', NULL, NULL, 'pendiente', DATE_SUB(NOW(), INTERVAL 1 DAY), NULL);

-- ==========================================
-- DATOS DE PRUEBA - ACTIVIDAD ADMIN
-- ==========================================

INSERT INTO actividad_admin (fecha, hora, titulo, usuario, tipo) VALUES
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '14:30:00', 'Nuevo usuario registrado: María González', 'Sistema', 'usuario'),
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '15:45:00', 'Misión completada: Introducción a los Números', 'Estudiante Test', 'sistema'),
(DATE_SUB(CURDATE(), INTERVAL 2 DAY), '10:20:00', 'Actualización de configuración del sistema', 'Administrador', 'configuracion'),
(DATE_SUB(CURDATE(), INTERVAL 2 DAY), '11:00:00', 'Nuevo curso creado: Matemáticas 1° Básico', 'Profesor Garcia', 'sistema'),
(DATE_SUB(CURDATE(), INTERVAL 3 DAY), '16:15:00', 'Misión creada: El Sistema Solar', 'Profesor Garcia', 'sistema'),
(DATE_SUB(CURDATE(), INTERVAL 3 DAY), '09:30:00', 'Backup automático completado', 'Sistema', 'auditoria'),
(DATE_SUB(CURDATE(), INTERVAL 4 DAY), '13:45:00', 'Evaluación revisada para María González', 'Profesor Garcia', 'sistema'),
(DATE_SUB(CURDATE(), INTERVAL 5 DAY), '12:00:00', 'Nuevo usuario registrado: Juan Pérez', 'Sistema', 'usuario'),
(DATE_SUB(CURDATE(), INTERVAL 6 DAY), '17:20:00', 'Configuración de roles actualizada', 'Administrador', 'configuracion'),
(DATE_SUB(CURDATE(), INTERVAL 7 DAY), '08:30:00', 'Inicio de sesión fallido detectado', 'Sistema', 'auditoria');

-- ==========================================
-- VERIFICACIÓN FINAL
-- ==========================================

SELECT '========================================' as separador;
SELECT '✅ BASE DE DATOS CREADA EXITOSAMENTE' as resultado;
SELECT '========================================' as separador;

SELECT '' as espacio;
SELECT '📊 RESUMEN DE TABLAS CREADAS:' as info;
SHOW TABLES;

SELECT '' as espacio;
SELECT '👥 USUARIOS CREADOS:' as info;
SELECT rut, nombre, email, rol, nivel, experiencia, monedas FROM usuarios;

SELECT '' as espacio;
SELECT '📚 CURSOS CREADOS:' as info;
SELECT id, nombre, codigo_acceso, gm_rut, activo FROM cursos;

SELECT '' as espacio;
SELECT '🎯 MISIONES CREADAS:' as info;
SELECT id, titulo, tipo, dificultad, curso_id FROM misiones;

SELECT '' as espacio;
SELECT '👨‍🎓 ESTUDIANTES INSCRITOS:' as info;
SELECT COUNT(*) as total FROM curso_estudiantes;

SELECT '' as espacio;
SELECT '📝 EVALUACIONES PENDIENTES:' as info;
SELECT COUNT(*) as total FROM evaluaciones WHERE estado = 'pendiente';

SELECT '' as espacio;
SELECT '🏆 LOGROS DEL SISTEMA:' as info;
SELECT COUNT(*) as total FROM logros;

SELECT '' as espacio;
SELECT '========================================' as separador;
SELECT '🔐 CREDENCIALES DE ACCESO' as info;
SELECT '========================================' as separador;
SELECT '' as espacio;
SELECT '👤 ADMIN' as info;
SELECT '   Email:    admin@test.com' as credencial;
SELECT '   Password: password123' as credencial;
SELECT '   RUT:      12.345.678-9' as credencial;
SELECT '' as espacio;
SELECT '🎮 GAME MASTER (GM)' as info;
SELECT '   Email:    gm@test.com' as credencial;
SELECT '   Password: password123' as credencial;
SELECT '   RUT:      98.765.432-1' as credencial;
SELECT '' as espacio;
SELECT '📚 ESTUDIANTE' as info;
SELECT '   Email:    estudiante@test.com' as credencial;
SELECT '   Password: password123' as credencial;
SELECT '   RUT:      11.222.333-4' as credencial;
SELECT '' as espacio;
SELECT '========================================' as separador;
SELECT '✅ IMPORTANTE: Todos los usuarios tienen la misma contraseña' as nota;
SELECT '   Contraseña: password123' as nota;
SELECT '========================================' as separador;

SELECT '' as espacio;
SELECT '🚀 TODO LISTO PARA USAR!' as mensaje;
SELECT 'La base de datos está completamente configurada' as instruccion;
SELECT 'Puedes iniciar sesión con cualquiera de las cuentas de prueba' as instruccion;
SELECT '========================================' as separador;
