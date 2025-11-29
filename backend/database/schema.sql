-- Base de datos: aprende_jugando
-- Schema SQL para el sistema de gamificación educativa

-- Tabla de usuarios (estudiantes, GMs, administradores)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('estudiante', 'gm', 'admin') NOT NULL DEFAULT 'estudiante',
  nivel INT DEFAULT 1,
  experiencia INT DEFAULT 0,
  avatar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS cursos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  gm_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (gm_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de estudiantes en cursos
CREATE TABLE IF NOT EXISTS curso_estudiantes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  curso_id INT NOT NULL,
  estudiante_id INT NOT NULL,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (estudiante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY unique_curso_estudiante (curso_id, estudiante_id)
);

-- Tabla de misiones
CREATE TABLE IF NOT EXISTS misiones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  objetivo TEXT,
  dificultad ENUM('Baja', 'Media', 'Alta') NOT NULL DEFAULT 'Media',
  categoria VARCHAR(100),
  xp_recompensa INT DEFAULT 100,
  curso_id INT NOT NULL,
  gm_id INT NOT NULL,
  estado ENUM('activa', 'inactiva', 'archivada') DEFAULT 'activa',
  fecha_inicio DATE,
  fecha_fin DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (gm_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de competencias de una misión
CREATE TABLE IF NOT EXISTS mision_competencias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  mision_id INT NOT NULL,
  descripcion TEXT NOT NULL,
  orden INT DEFAULT 0,
  FOREIGN KEY (mision_id) REFERENCES misiones(id) ON DELETE CASCADE
);

-- Tabla de pistas de una misión
CREATE TABLE IF NOT EXISTS mision_pistas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  mision_id INT NOT NULL,
  descripcion TEXT NOT NULL,
  orden INT DEFAULT 0,
  FOREIGN KEY (mision_id) REFERENCES misiones(id) ON DELETE CASCADE
);

-- Tabla de actividades/ejercicios de una misión
CREATE TABLE IF NOT EXISTS actividades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  mision_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  enunciado TEXT NOT NULL,
  pregunta TEXT NOT NULL,
  tipo_pregunta ENUM('opcion_multiple', 'texto', 'verdadero_falso') DEFAULT 'opcion_multiple',
  respuesta_correcta TEXT NOT NULL,
  consejo TEXT,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mision_id) REFERENCES misiones(id) ON DELETE CASCADE
);

-- Tabla de opciones de respuesta para actividades
CREATE TABLE IF NOT EXISTS actividad_opciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  actividad_id INT NOT NULL,
  valor TEXT NOT NULL,
  es_correcta BOOLEAN DEFAULT FALSE,
  orden INT DEFAULT 0,
  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE
);

-- Tabla de progreso del estudiante en misiones
CREATE TABLE IF NOT EXISTS estudiante_misiones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  estudiante_id INT NOT NULL,
  mision_id INT NOT NULL,
  estado ENUM('Pendiente', 'En progreso', 'Completada') DEFAULT 'Pendiente',
  progreso INT DEFAULT 0,
  actividad_actual INT DEFAULT 1,
  xp_ganado INT DEFAULT 0,
  fecha_inicio TIMESTAMP NULL,
  fecha_completado TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (mision_id) REFERENCES misiones(id) ON DELETE CASCADE,
  UNIQUE KEY unique_estudiante_mision (estudiante_id, mision_id)
);

-- Tabla de respuestas del estudiante en actividades
CREATE TABLE IF NOT EXISTS estudiante_respuestas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  estudiante_id INT NOT NULL,
  actividad_id INT NOT NULL,
  respuesta TEXT NOT NULL,
  es_correcta BOOLEAN DEFAULT FALSE,
  intentos INT DEFAULT 1,
  tiempo_respuesta INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE
);

-- Tabla de evaluaciones del GM
CREATE TABLE IF NOT EXISTS evaluaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  gm_id INT NOT NULL,
  estudiante_id INT NOT NULL,
  mision_id INT NOT NULL,
  calificacion DECIMAL(5,2),
  retroalimentacion TEXT,
  estado ENUM('pendiente', 'evaluada') DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (gm_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (estudiante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (mision_id) REFERENCES misiones(id) ON DELETE CASCADE
);

-- Tabla de logros
CREATE TABLE IF NOT EXISTS logros (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(255),
  requisito_tipo ENUM('nivel', 'misiones', 'xp', 'racha') NOT NULL,
  requisito_valor INT NOT NULL,
  xp_recompensa INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de logros desbloqueados por estudiantes
CREATE TABLE IF NOT EXISTS estudiante_logros (
  id INT PRIMARY KEY AUTO_INCREMENT,
  estudiante_id INT NOT NULL,
  logro_id INT NOT NULL,
  fecha_desbloqueo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (logro_id) REFERENCES logros(id) ON DELETE CASCADE,
  UNIQUE KEY unique_estudiante_logro (estudiante_id, logro_id)
);

-- Tabla de personalizaciones (apariencias, atuendos, accesorios, herramientas)
CREATE TABLE IF NOT EXISTS personalizaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tipo ENUM('apariencia', 'atuendo', 'accesorio', 'herramienta') NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  imagen VARCHAR(255) NOT NULL,
  requisito_nivel INT DEFAULT 1,
  requisito_misiones INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de personalizaciones desbloqueadas por estudiantes
CREATE TABLE IF NOT EXISTS estudiante_personalizaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  estudiante_id INT NOT NULL,
  personalizacion_id INT NOT NULL,
  desbloqueado BOOLEAN DEFAULT FALSE,
  fecha_desbloqueo TIMESTAMP NULL,
  FOREIGN KEY (estudiante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (personalizacion_id) REFERENCES personalizaciones(id) ON DELETE CASCADE,
  UNIQUE KEY unique_estudiante_personalizacion (estudiante_id, personalizacion_id)
);

-- Tabla de configuración del estudiante (personalizaciones activas)
CREATE TABLE IF NOT EXISTS estudiante_configuracion (
  id INT PRIMARY KEY AUTO_INCREMENT,
  estudiante_id INT UNIQUE NOT NULL,
  apariencia_activa INT DEFAULT 1,
  atuendo_activo INT DEFAULT 1,
  accesorio_activo INT DEFAULT 1,
  herramienta_activa INT DEFAULT 1,
  tema VARCHAR(50) DEFAULT 'light',
  idioma VARCHAR(10) DEFAULT 'es',
  FOREIGN KEY (estudiante_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Insertar usuarios de prueba (password: password123)
INSERT INTO usuarios (nombre, email, password, rol, nivel, experiencia) VALUES
('Alejandra', 'estudiante@test.com', '$2b$10$xmFayKK/FlsHLs3i6oJL0e8XKenHFm.98fLjOCtwsdXHeCkjCEr4K', 'estudiante', 5, 1400),
('Profesor García', 'gm@test.com', '$2b$10$xmFayKK/FlsHLs3i6oJL0e8XKenHFm.98fLjOCtwsdXHeCkjCEr4K', 'gm', 1, 0),
('Admin Sistema', 'admin@test.com', '$2b$10$xmFayKK/FlsHLs3i6oJL0e8XKenHFm.98fLjOCtwsdXHeCkjCEr4K', 'admin', 1, 0);

-- Insertar curso de prueba
INSERT INTO cursos (nombre, descripcion, gm_id) VALUES
('Matemáticas 5to Grado', 'Curso de matemáticas para estudiantes de 5to grado', 2);

-- Asociar estudiante al curso
INSERT INTO curso_estudiantes (curso_id, estudiante_id) VALUES (1, 1);

-- Insertar misión de prueba
INSERT INTO misiones (nombre, descripcion, objetivo, dificultad, categoria, xp_recompensa, curso_id, gm_id, fecha_inicio, fecha_fin) VALUES
('Resolver ecuaciones de primer grado',
 'En esta misión, el estudiante se adentra en un desafío matemático donde deberá manipular ecuaciones paso a paso para encontrar el valor desconocido.',
 'Que el estudiante sea capaz de resolver ecuaciones de primer grado con una incógnita, aplicando reglas básicas de equivalencia y manteniendo el equilibrio de la igualdad.',
 'Baja',
 'Matemáticas',
 150,
 1,
 2,
 CURRENT_DATE,
 DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY));

-- Insertar competencias para la misión
INSERT INTO mision_competencias (mision_id, descripcion, orden) VALUES
(1, 'Aplicar propiedades básicas de igualdad', 1),
(1, 'Aislar términos en una ecuación', 2),
(1, 'Simplificar expresiones algebraicas', 3),
(1, 'Verificar soluciones reemplazando en la ecuación original', 4);

-- Insertar pistas para la misión
INSERT INTO mision_pistas (mision_id, descripcion, orden) VALUES
(1, 'Recuerda: lo que haces en un lado de la ecuación, debes hacerlo en el otro.', 1),
(1, 'Agrupa términos semejantes para simplificar tu avance.', 2),
(1, 'Si tienes dudas, prueba reemplazar tu respuesta para verificar si cumple la igualdad.', 3),
(1, 'Identifica primero qué operación te permitirá aislar la incógnita más rápido.', 4);

-- Insertar logros de prueba
INSERT INTO logros (nombre, descripcion, icono, requisito_tipo, requisito_valor, xp_recompensa) VALUES
('Primer Paso', 'Completa tu primera misión', 'logro_primera_mision.png', 'misiones', 1, 50),
('Aprendiz Dedicado', 'Alcanza el nivel 5', 'logro_nivel_5.png', 'nivel', 5, 100),
('Coleccionista', 'Completa 10 misiones', 'logro_10_misiones.png', 'misiones', 10, 200),
('Maestro del Juego', 'Alcanza el nivel 10', 'logro_nivel_10.png', 'nivel', 10, 300);

-- Insertar personalizaciones de prueba
INSERT INTO personalizaciones (tipo, nombre, imagen, requisito_nivel, requisito_misiones) VALUES
('apariencia', 'Apariencia 1', 'apariencia1.png', 1, 0),
('apariencia', 'Apariencia 2', 'apariencia2.png', 3, 0),
('apariencia', 'Apariencia 3', 'apariencia3.png', 5, 0),
('atuendo', 'Atuendo 1', 'atuendo1.png', 1, 0),
('atuendo', 'Atuendo 2', 'atuendo2.png', 3, 0),
('accesorio', 'Accesorio 1', 'accesorio1.png', 1, 0),
('accesorio', 'Accesorio 2', 'accesorio2.png', 3, 0),
('herramienta', 'Herramienta 1', 'herramienta1.png', 1, 0),
('herramienta', 'Herramienta 2', 'herramienta2.png', 3, 0);
