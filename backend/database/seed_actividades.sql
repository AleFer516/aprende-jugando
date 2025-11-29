-- Insertar actividades para la misión de ecuaciones
-- Mision ID: 1 (Resolver ecuaciones de primer grado)

-- Actividad 1: Opción múltiple
INSERT INTO actividades (mision_id, titulo, enunciado, pregunta, tipo_pregunta, respuesta_correcta, consejo, orden) VALUES
(1,
 'Introducción a ecuaciones',
 'Una ecuación es una igualdad matemática que contiene una incógnita (generalmente representada con x). Para resolverla, debemos encontrar el valor de x que hace que la igualdad sea verdadera.',
 '¿Cuál es el valor de x en la ecuación: x + 5 = 12?',
 'opcion_multiple',
 '7',
 'Recuerda que debes aislar la x. Si tienes x + 5 = 12, resta 5 de ambos lados.',
 1);

-- Opciones para la actividad 1
INSERT INTO actividad_opciones (actividad_id, valor, es_correcta, orden) VALUES
(1, '5', FALSE, 1),
(1, '7', TRUE, 2),
(1, '12', FALSE, 3),
(1, '17', FALSE, 4);

-- Actividad 2: Opción múltiple
INSERT INTO actividades (mision_id, titulo, enunciado, pregunta, tipo_pregunta, respuesta_correcta, consejo, orden) VALUES
(1,
 'Ecuaciones con resta',
 'Cuando tenemos una resta en la ecuación, debemos hacer la operación inversa en ambos lados para aislar la incógnita.',
 '¿Cuál es el valor de x en la ecuación: x - 3 = 8?',
 'opcion_multiple',
 '11',
 'Si tienes x - 3 = 8, suma 3 a ambos lados de la ecuación.',
 2);

-- Opciones para la actividad 2
INSERT INTO actividad_opciones (actividad_id, valor, es_correcta, orden) VALUES
(2, '5', FALSE, 1),
(2, '11', TRUE, 2),
(2, '8', FALSE, 3),
(2, '-11', FALSE, 4);

-- Actividad 3: Opción múltiple
INSERT INTO actividades (mision_id, titulo, enunciado, pregunta, tipo_pregunta, respuesta_correcta, consejo, orden) VALUES
(1,
 'Ecuaciones con multiplicación',
 'Cuando la incógnita está multiplicada por un número, debemos dividir ambos lados por ese número para aislarla.',
 '¿Cuál es el valor de x en la ecuación: 3x = 15?',
 'opcion_multiple',
 '5',
 'Si tienes 3x = 15, divide ambos lados entre 3.',
 3);

-- Opciones para la actividad 3
INSERT INTO actividad_opciones (actividad_id, valor, es_correcta, orden) VALUES
(3, '3', FALSE, 1),
(3, '5', TRUE, 2),
(3, '12', FALSE, 3),
(3, '45', FALSE, 4);

-- Actividad 4: Opción múltiple
INSERT INTO actividades (mision_id, titulo, enunciado, pregunta, tipo_pregunta, respuesta_correcta, consejo, orden) VALUES
(1,
 'Ecuaciones con división',
 'Cuando la incógnita está dividida por un número, debemos multiplicar ambos lados por ese número.',
 '¿Cuál es el valor de x en la ecuación: x/4 = 6?',
 'opcion_multiple',
 '24',
 'Si tienes x/4 = 6, multiplica ambos lados por 4.',
 4);

-- Opciones para la actividad 4
INSERT INTO actividad_opciones (actividad_id, valor, es_correcta, orden) VALUES
(4, '2', FALSE, 1),
(4, '10', FALSE, 2),
(4, '24', TRUE, 3),
(4, '1.5', FALSE, 4);

-- Actividad 5: Opción múltiple (ecuación combinada)
INSERT INTO actividades (mision_id, titulo, enunciado, pregunta, tipo_pregunta, respuesta_correcta, consejo, orden) VALUES
(1,
 'Ecuaciones con dos operaciones',
 'A veces necesitamos hacer más de una operación para resolver la ecuación. El orden importa: primero eliminamos sumas/restas, luego multiplicaciones/divisiones.',
 '¿Cuál es el valor de x en la ecuación: 2x + 4 = 14?',
 'opcion_multiple',
 '5',
 'Primero resta 4 de ambos lados, luego divide entre 2.',
 5);

-- Opciones para la actividad 5
INSERT INTO actividad_opciones (actividad_id, valor, es_correcta, orden) VALUES
(5, '4', FALSE, 1),
(5, '5', TRUE, 2),
(5, '9', FALSE, 3),
(5, '7', FALSE, 4);
