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
--
-- 4. Columnas adicionales en tabla actividades:
--    Usar columna 'tipo_pregunta', NO 'tipo'
--    Incluye campos: titulo, enunciado, pregunta, tipo_pregunta, consejo, respuesta_correcta
--
-- 5. Columnas en tabla actividad_opciones:
--    Usar columna 'valor' para el valor de la opción
--    Usar columna 'texto' para el texto mostrado al usuario
--
-- 6. Columnas en tabla estudiante_respuestas:
--    Incluye campos: intentos, tiempo_respuesta (en segundos)
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
  avatar LONGTEXT COMMENT 'Avatar del usuario en formato base64 o ruta del archivo',
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
  frecuencia_respaldo ENUM('diaria', 'semanal', 'mensual') DEFAULT 'diaria' COMMENT 'Frecuencia del respaldo automático',
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
-- SISTEMA DE PERSONALIZACIONES
-- ==========================================

-- Personalizaciones disponibles (apariencias, atuendos, accesorios, herramientas)
CREATE TABLE personalizaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('apariencia', 'atuendo', 'accesorio', 'herramienta') NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  imagen VARCHAR(255) NOT NULL,
  requisito_nivel INT DEFAULT 0 COMMENT 'Nivel mínimo para desbloquear',
  requisito_misiones INT DEFAULT 0 COMMENT 'Misiones completadas para desbloquear',
  orden INT DEFAULT 0 COMMENT 'Orden de aparición',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tipo (tipo),
  INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Configuración de personaje del estudiante
CREATE TABLE estudiante_personaje (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_rut VARCHAR(12) NOT NULL,
  apariencia_activa INT DEFAULT 1,
  atuendo_activo INT DEFAULT 10,
  accesorio_activo INT DEFAULT 19,
  herramienta_activa INT DEFAULT 28,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_estudiante (estudiante_rut),
  FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
  FOREIGN KEY (apariencia_activa) REFERENCES personalizaciones(id),
  FOREIGN KEY (atuendo_activo) REFERENCES personalizaciones(id),
  FOREIGN KEY (accesorio_activo) REFERENCES personalizaciones(id),
  FOREIGN KEY (herramienta_activa) REFERENCES personalizaciones(id)
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
  curso_id INT NULL COMMENT 'Puede ser NULL si la misión no está asignada a ningún curso',
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
  retroalimentacion TEXT,
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
  estudiante_rut VARCHAR(12) NOT NULL,
  actividad_id INT NOT NULL,
  respuesta TEXT,
  es_correcta BOOLEAN DEFAULT FALSE,
  intentos INT DEFAULT 1,
  tiempo_respuesta INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE,
  INDEX idx_estudiante (estudiante_rut),
  INDEX idx_actividad (actividad_id),
  INDEX idx_fecha (created_at)
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
  '$2b$10$yKyWzl4SZSGCKJqUtDH54.EaPpGaVCAyPC5SycIuFVKXIvNYduc/S',  -- Password: password123
  'estudiante',
  1,    -- Nivel inicial (recién registrado)
  0,    -- Sin experiencia
  0,    -- Sin monedas
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
-- DATOS INICIALES - PERSONALIZACIONES
-- ==========================================

-- Apariencias (9 opciones)
INSERT INTO personalizaciones (tipo, nombre, imagen, requisito_nivel, requisito_misiones, orden) VALUES
('apariencia', 'Apariencia 1', '/images/apariencia1.png', 0, 0, 1),
('apariencia', 'Apariencia 2', '/images/apariencia2.png', 3, 0, 2),
('apariencia', 'Apariencia 3', '/images/apariencia3.png', 5, 0, 3),
('apariencia', 'Apariencia 4', '/images/apariencia4.png', 0, 20, 4),
('apariencia', 'Apariencia 5', '/images/apariencia5.png', 8, 0, 5),
('apariencia', 'Apariencia 6', '/images/apariencia6.png', 10, 0, 6),
('apariencia', 'Apariencia 7', '/images/apariencia7.png', 12, 0, 7),
('apariencia', 'Apariencia 8', '/images/apariencia8.png', 15, 0, 8),
('apariencia', 'Apariencia 9', '/images/apariencia9.png', 20, 0, 9);

-- Atuendos (9 opciones)
INSERT INTO personalizaciones (tipo, nombre, imagen, requisito_nivel, requisito_misiones, orden) VALUES
('atuendo', 'Atuendo 1', '/images/atuendo1.png', 0, 0, 1),
('atuendo', 'Atuendo 2', '/images/atuendo2.png', 3, 0, 2),
('atuendo', 'Atuendo 3', '/images/atuendo3.png', 5, 0, 3),
('atuendo', 'Atuendo 4', '/images/atuendo4.png', 0, 20, 4),
('atuendo', 'Atuendo 5', '/images/atuendo5.png', 8, 0, 5),
('atuendo', 'Atuendo 6', '/images/atuendo6.png', 10, 0, 6),
('atuendo', 'Atuendo 7', '/images/atuendo7.png', 12, 0, 7),
('atuendo', 'Atuendo 8', '/images/atuendo8.png', 15, 0, 8),
('atuendo', 'Atuendo 9', '/images/atuendo9.png', 20, 0, 9);

-- Accesorios (9 opciones)
INSERT INTO personalizaciones (tipo, nombre, imagen, requisito_nivel, requisito_misiones, orden) VALUES
('accesorio', 'Accesorio 1', '/images/accesorio1.png', 0, 0, 1),
('accesorio', 'Accesorio 2', '/images/accesorio2.png', 3, 0, 2),
('accesorio', 'Accesorio 3', '/images/accesorio3.png', 5, 0, 3),
('accesorio', 'Accesorio 4', '/images/accesorio4.png', 0, 20, 4),
('accesorio', 'Accesorio 5', '/images/accesorio5.png', 8, 0, 5),
('accesorio', 'Accesorio 6', '/images/accesorio6.png', 10, 0, 6),
('accesorio', 'Accesorio 7', '/images/accesorio7.png', 12, 0, 7),
('accesorio', 'Accesorio 8', '/images/accesorio8.png', 15, 0, 8),
('accesorio', 'Accesorio 9', '/images/accesorio9.png', 20, 0, 9);

-- Herramientas (9 opciones)
INSERT INTO personalizaciones (tipo, nombre, imagen, requisito_nivel, requisito_misiones, orden) VALUES
('herramienta', 'Herramienta 1', '/images/herramienta1.png', 0, 0, 1),
('herramienta', 'Herramienta 2', '/images/herramienta2.png', 3, 0, 2),
('herramienta', 'Herramienta 3', '/images/herramienta3.png', 5, 0, 3),
('herramienta', 'Herramienta 4', '/images/herramienta4.png', 0, 20, 4),
('herramienta', 'Herramienta 5', '/images/herramienta5.png', 8, 0, 5),
('herramienta', 'Herramienta 6', '/images/herramienta6.png', 10, 0, 6),
('herramienta', 'Herramienta 7', '/images/herramienta7.png', 12, 0, 7),
('herramienta', 'Herramienta 8', '/images/herramienta8.png', 15, 0, 8),
('herramienta', 'Herramienta 9', '/images/herramienta9.png', 20, 0, 9);

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
(1, '11.222.333-4', 0.00),  -- Estudiante test: sin progreso (recién inscrito)
(1, '11.222.333-5', 45.50),
(1, '22.333.444-5', 30.25),
(2, '11.222.333-4', 0.00),  -- Estudiante test: sin progreso (recién inscrito)
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
-- DATOS INICIALES - ACTIVIDADES DE MISIONES
-- ==========================================

-- Actividades para Misión 1: Introducción a los Números
INSERT INTO actividades (mision_id, tipo, pregunta, orden, puntos, imagen, explicacion) VALUES
(1, 'opcion_multiple', '¿Cuántos dedos tienes en una mano?', 1, 10, '/images/mision1.jpg', 'Cuenta los dedos de tu mano para encontrar la respuesta correcta.'),
(1, 'opcion_multiple', '¿Qué número viene después del 5?', 2, 10, '/images/mision1.jpg', 'Piensa en la secuencia numérica: 1, 2, 3, 4, 5...'),
(1, 'verdadero_falso', 'El número 3 es mayor que el número 7', 3, 10, '/images/mision1.jpg', 'Compara los dos números para determinar cuál es mayor.'),
(1, 'opcion_multiple', '¿Cuántos elementos hay en el grupo: 🍎🍎🍎?', 4, 10, '/images/mision1.jpg', 'Cuenta las manzanas una por una.'),
(1, 'opcion_multiple', '¿Qué número está entre el 4 y el 6?', 5, 10, '/images/mision1.jpg', 'Piensa en la secuencia: 4, ?, 6');

-- Opciones para actividad 1 (¿Cuántos dedos?)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(1, '3', false, 1),
(1, '5', true, 2),
(1, '7', false, 3),
(1, '10', false, 4);

-- Opciones para actividad 2 (¿Qué número viene después del 5?)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(2, '4', false, 1),
(2, '6', true, 2),
(2, '7', false, 3),
(2, '3', false, 4);

-- Opciones para actividad 3 (Verdadero/Falso - 3 > 7)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(3, 'Verdadero', false, 1),
(3, 'Falso', true, 2);

-- Opciones para actividad 4 (¿Cuántas manzanas?)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(4, '2', false, 1),
(4, '3', true, 2),
(4, '4', false, 3),
(4, '5', false, 4);

-- Opciones para actividad 5 (¿Qué número está entre 4 y 6?)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(5, '3', false, 1),
(5, '5', true, 2),
(5, '7', false, 3),
(5, '4', false, 4);

-- Actividades para Misión 2: Suma y Resta Básica
INSERT INTO actividades (mision_id, tipo, pregunta, orden, puntos, imagen, explicacion) VALUES
(2, 'opcion_multiple', '¿Cuánto es 5 + 3?', 1, 10, '/images/mision1.jpg', 'Suma los dos números para encontrar el resultado.'),
(2, 'opcion_multiple', '¿Cuánto es 10 - 4?', 2, 10, '/images/mision1.jpg', 'Resta 4 de 10 para obtener la respuesta.'),
(2, 'opcion_multiple', 'Si tienes 7 manzanas y te dan 5 más, ¿cuántas tienes en total?', 3, 10, '/images/mision1.jpg', 'Suma las manzanas que tenías con las que te dieron.'),
(2, 'opcion_multiple', '¿Cuánto es 15 - 8?', 4, 10, '/images/mision1.jpg', 'Resta 8 de 15.'),
(2, 'verdadero_falso', '6 + 6 = 12', 5, 10, '/images/mision1.jpg', 'Verifica si la suma es correcta.');

-- Opciones para actividad 6 (5 + 3)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(6, '7', false, 1),
(6, '8', true, 2),
(6, '9', false, 3),
(6, '6', false, 4);

-- Opciones para actividad 7 (10 - 4)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(7, '5', false, 1),
(7, '6', true, 2),
(7, '7', false, 3),
(7, '4', false, 4);

-- Opciones para actividad 8 (7 + 5 manzanas)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(8, '11', false, 1),
(8, '12', true, 2),
(8, '13', false, 3),
(8, '10', false, 4);

-- Opciones para actividad 9 (15 - 8)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(9, '6', false, 1),
(9, '7', true, 2),
(9, '8', false, 3),
(9, '9', false, 4);

-- Opciones para actividad 10 (6 + 6 = 12)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(10, 'Verdadero', true, 1),
(10, 'Falso', false, 2);

-- Actividades para Misión 3: Examen de Matemáticas Básicas
INSERT INTO actividades (mision_id, tipo, pregunta, orden, puntos, imagen, explicacion) VALUES
(3, 'opcion_multiple', '¿Cuánto es 12 + 8?', 1, 20, '/images/mision1.jpg', 'Suma 12 + 8 para obtener el resultado.'),
(3, 'opcion_multiple', '¿Cuánto es 20 - 13?', 2, 20, '/images/mision1.jpg', 'Resta 13 de 20.'),
(3, 'opcion_multiple', 'Si tienes 15 caramelos y le das 6 a tu amigo, ¿cuántos te quedan?', 3, 20, '/images/mision1.jpg', 'Resta los caramelos que diste de los que tenías.'),
(3, 'opcion_multiple', '¿Qué operación da como resultado 10? ', 4, 20, '/images/mision1.jpg', 'Encuentra la operación correcta.'),
(3, 'verdadero_falso', '18 - 9 = 9', 5, 20, '/images/mision1.jpg', 'Verifica si la resta es correcta.');

-- Opciones para actividad 11 (12 + 8)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(11, '19', false, 1),
(11, '20', true, 2),
(11, '21', false, 3),
(11, '18', false, 4);

-- Opciones para actividad 12 (20 - 13)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(12, '6', false, 1),
(12, '7', true, 2),
(12, '8', false, 3),
(12, '9', false, 4);

-- Opciones para actividad 13 (15 - 6 caramelos)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(13, '8', false, 1),
(13, '9', true, 2),
(13, '10', false, 3),
(13, '11', false, 4);

-- Opciones para actividad 14 (¿Qué da 10?)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(14, '5 + 4', false, 1),
(14, '7 + 3', true, 2),
(14, '6 + 5', false, 3),
(14, '8 + 3', false, 4);

-- Opciones para actividad 15 (18 - 9 = 9)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(15, 'Verdadero', true, 1),
(15, 'Falso', false, 2);

-- Actividades para Misión 4: El Sistema Solar
INSERT INTO actividades (mision_id, tipo, pregunta, orden, puntos, imagen, explicacion) VALUES
(4, 'opcion_multiple', '¿Cuál es el planeta más cercano al Sol?', 1, 10, '/images/mision1.jpg', 'El planeta más cercano al Sol es el primero en el orden del sistema solar.'),
(4, 'opcion_multiple', '¿Cuántos planetas tiene nuestro sistema solar?', 2, 10, '/images/mision1.jpg', 'Cuenta los planetas desde Mercurio hasta Neptuno.'),
(4, 'verdadero_falso', 'El Sol es una estrella', 3, 10, '/images/mision1.jpg', 'Piensa en qué tipo de objeto celeste es el Sol.'),
(4, 'opcion_multiple', '¿Cuál es el planeta más grande del sistema solar?', 4, 10, '/images/mision1.jpg', 'Este planeta es conocido por ser gigantesco y tener muchas lunas.'),
(4, 'opcion_multiple', '¿En qué planeta vivimos?', 5, 10, '/images/mision1.jpg', 'Este es nuestro hogar en el universo.');

-- Opciones para actividad 16 (planeta más cercano al Sol)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(16, 'Mercurio', true, 1),
(16, 'Venus', false, 2),
(16, 'Tierra', false, 3),
(16, 'Marte', false, 4);

-- Opciones para actividad 17 (¿cuántos planetas?)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(17, '7', false, 1),
(17, '8', true, 2),
(17, '9', false, 3),
(17, '10', false, 4);

-- Opciones para actividad 18 (El Sol es una estrella)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(18, 'Verdadero', true, 1),
(18, 'Falso', false, 2);

-- Opciones para actividad 19 (planeta más grande)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(19, 'Saturno', false, 1),
(19, 'Júpiter', true, 2),
(19, 'Neptuno', false, 3),
(19, 'Urano', false, 4);

-- Opciones para actividad 20 (¿en qué planeta vivimos?)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(20, 'Marte', false, 1),
(20, 'Tierra', true, 2),
(20, 'Venus', false, 3),
(20, 'Júpiter', false, 4);

-- Actividades para Misión 5: Los Seres Vivos
INSERT INTO actividades (mision_id, tipo, pregunta, orden, puntos, imagen, explicacion) VALUES
(5, 'opcion_multiple', '¿Cuál de estos es un ser vivo?', 1, 10, '/images/mision1.jpg', 'Los seres vivos nacen, crecen, se reproducen y mueren.'),
(5, 'verdadero_falso', 'Las plantas son seres vivos', 2, 10, '/images/mision1.jpg', 'Piensa si las plantas cumplen con las características de los seres vivos.'),
(5, 'opcion_multiple', '¿Qué necesitan todos los seres vivos para sobrevivir?', 3, 10, '/images/mision1.jpg', 'Todos los seres vivos necesitan esto para mantenerse con vida.'),
(5, 'opcion_multiple', '¿Cuál de estos NO es un ser vivo?', 4, 10, '/images/mision1.jpg', 'Identifica qué objeto no cumple con las características de los seres vivos.'),
(5, 'verdadero_falso', 'Los animales necesitan respirar para vivir', 5, 10, '/images/mision1.jpg', 'Piensa en una de las necesidades básicas de los animales.');

-- Opciones para actividad 21 (¿cuál es un ser vivo?)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(21, 'Una roca', false, 1),
(21, 'Un perro', true, 2),
(21, 'Una pelota', false, 3),
(21, 'Una silla', false, 4);

-- Opciones para actividad 22 (Las plantas son seres vivos)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(22, 'Verdadero', true, 1),
(22, 'Falso', false, 2);

-- Opciones para actividad 23 (¿qué necesitan los seres vivos?)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(23, 'Juguetes', false, 1),
(23, 'Agua y alimento', true, 2),
(23, 'Dinero', false, 3),
(23, 'Libros', false, 4);

-- Opciones para actividad 24 (¿cuál NO es un ser vivo?)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(24, 'Un gato', false, 1),
(24, 'Una flor', false, 2),
(24, 'Una piedra', true, 3),
(24, 'Un árbol', false, 4);

-- Opciones para actividad 25 (Los animales necesitan respirar)
INSERT INTO actividad_opciones (actividad_id, texto, es_correcta, orden) VALUES
(25, 'Verdadero', true, 1),
(25, 'Falso', false, 2);

-- ==========================================
-- DATOS DE PRUEBA - PROGRESO DE ESTUDIANTES
-- ==========================================
-- Estados: no_iniciada, en_progreso, completada, revisando, aprobada, rechazada
-- Las misiones 'completada' aparecerán en el panel de evaluaciones del GM

INSERT INTO estudiante_misiones (mision_id, estudiante_rut, estado, progreso, puntuacion, intentos, fecha_inicio, fecha_completado) VALUES
-- Estudiante Test (11.222.333-4) - Misiones asignadas sin iniciar (nivel 1, recién inscrito)
(1, '11.222.333-4', 'no_iniciada', 0, NULL, 0, NULL, NULL),
(2, '11.222.333-4', 'no_iniciada', 0, NULL, 0, NULL, NULL),
(3, '11.222.333-4', 'no_iniciada', 0, NULL, 0, NULL, NULL),

-- María González (11.222.333-5) - Curso Matemáticas
(1, '11.222.333-5', 'completada', 100, 95.00, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, '11.222.333-5', 'completada', 100, 87.50, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, '11.222.333-5', 'no_iniciada', 0, NULL, 0, NULL, NULL),

-- Juan Pérez (22.333.444-5) - Curso Matemáticas
(1, '22.333.444-5', 'aprobada', 100, 100.00, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY)),
(2, '22.333.444-5', 'completada', 100, 91.00, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, '22.333.444-5', 'en_progreso', 30, NULL, 1, NOW(), NULL),

-- Juan Pérez (22.333.444-5) - Curso Ciencias
(4, '22.333.444-5', 'completada', 100, 78.00, 2, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(5, '22.333.444-5', 'completada', 100, 93.00, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW());

-- ==========================================
-- DATOS DE PRUEBA - EVALUACIONES
-- ==========================================

INSERT INTO evaluaciones (mision_id, estudiante_rut, gm_rut, calificacion, comentarios, estado, fecha_entrega, fecha_revision) VALUES
-- Estudiante Test (11.222.333-4) - Sin evaluaciones (nivel 1, sin misiones completadas)
(1, '11.222.333-5', '98.765.432-1', 95.00, 'Excelente trabajo, sigue así!', 'aprobada', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, '22.333.444-5', '98.765.432-1', 100.00, 'Perfecto! Excelente comprensión.', 'aprobada', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY));

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

-- ==========================================
-- ACTUALIZACIONES DE ESQUEMA
-- ==========================================
-- Agregar columnas faltantes identificadas durante el desarrollo

-- Agregar campos a la tabla misiones para información completa de misión
ALTER TABLE misiones
ADD COLUMN objetivo_aprendizaje TEXT COMMENT 'Objetivo pedagógico de la misión' AFTER descripcion,
ADD COLUMN retroalimentacion TEXT COMMENT 'Retroalimentación general para el estudiante' AFTER objetivo_aprendizaje;

-- Agregar campos a la tabla actividades para compatibilidad con el sistema
ALTER TABLE actividades
ADD COLUMN titulo VARCHAR(200) COMMENT 'Título de la actividad' AFTER mision_id,
ADD COLUMN enunciado TEXT COMMENT 'Enunciado o contexto de la actividad' AFTER titulo,
CHANGE COLUMN tipo tipo_pregunta ENUM('opcion_multiple', 'verdadero_falso', 'completar', 'ordenar', 'relacionar', 'abierta') NOT NULL,
ADD COLUMN consejo TEXT COMMENT 'Consejo o pista para resolver la actividad' AFTER tipo_pregunta,
ADD COLUMN respuesta_correcta TEXT COMMENT 'Respuesta correcta de la actividad' AFTER explicacion;

-- Agregar campo valor a actividad_opciones para compatibilidad
ALTER TABLE actividad_opciones
ADD COLUMN valor TEXT COMMENT 'Valor de la opción (puede ser diferente del texto mostrado)' AFTER texto;

-- Agregar campos faltantes a estudiante_respuestas
ALTER TABLE estudiante_respuestas
ADD COLUMN intentos INT DEFAULT 1 COMMENT 'Número de intentos realizados' AFTER es_correcta,
ADD COLUMN tiempo_respuesta INT DEFAULT 0 COMMENT 'Tiempo en segundos que tomó responder' AFTER intentos;

-- ==========================================
-- NOTAS SOBRE MIGRACIONES Y ACTUALIZACIONES
-- ==========================================
--
-- 📋 Script de migración para actualizar misiones existentes:
--    - Archivo: backend/database/actualizar_misiones_existentes.sql
--    - Propósito: Asignar valores por defecto a misiones sin XP, monedas o fecha límite
--    - Ejecutar cuando: Se actualice una base de datos existente que tenga misiones sin estos campos
--
-- 🔄 Flujo de evaluación de misiones:
--    1. Estudiante completa misión → estado: 'completada'
--    2. GM recibe notificación → aparece en panel de evaluaciones
--    3. GM aprueba → estado: 'aprobada' + se asigna XP al estudiante
--    4. GM rechaza → estado: 'rechazada' + progreso = 0 + permite reintentar
--    5. Si rechazada → estudiante puede volver a iniciar (se borran respuestas anteriores)
--
-- ⚠️ IMPORTANTE: Al aprobar una misión, el XP se otorga en ese momento, NO al completar
--    - El controlador gm.evaluaciones.controller.js maneja la asignación de XP
--    - El controlador estudiante.misiones.controller.js permite reiniciar misiones rechazadas
--
-- 🎯 Validaciones de cursos:
--    - No se puede eliminar un curso si estudiantes han comenzado misiones (progreso > 0)
--    - Solo se pueden eliminar cursos sin progreso de estudiantes
--    - Validación en: backend/src/controllers/admin.cursos.controller.js
--
-- ==========================================

SELECT '' as espacio;
SELECT '🚀 TODO LISTO PARA USAR!' as mensaje;
SELECT 'La base de datos está completamente configurada' as instruccion;
SELECT 'Puedes iniciar sesión con cualquiera de las cuentas de prueba' as instruccion;
SELECT '========================================' as separador;
