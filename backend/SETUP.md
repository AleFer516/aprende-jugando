# Guía de Configuración - Aprende Jugando Backend

Esta guía te llevará paso a paso para configurar la base de datos y ejecutar el backend.

## Requisitos Previos

- MySQL instalado y funcionando
- Node.js y npm instalados
- Git (opcional)

## Paso 1: Instalar Dependencias

Abre una terminal en la carpeta `backend` y ejecuta:

```bash
npm install
```

## Paso 2: Configurar Variables de Entorno

Ya tienes el archivo `.env` configurado con estos valores:

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=5657
DB_NAME=aprende_jugando
DB_PORT=3306
JWT_SECRET=un_secreto_super_seguro
```

**IMPORTANTE**: Si tu contraseña de MySQL es diferente a `5657`, edita el archivo `.env` y cambia el valor de `DB_PASSWORD`.

## Paso 3: Crear la Base de Datos

### Opción A: Usando MySQL Workbench o phpMyAdmin

1. Abre MySQL Workbench o phpMyAdmin
2. Crea una nueva base de datos llamada `aprende_jugando`
3. Ejecuta el archivo `database/schema.sql` completo
4. Ejecuta el archivo `database/seed_actividades.sql`

### Opción B: Usando la línea de comandos de MySQL

Abre una terminal y ejecuta:

```bash
# Conectarse a MySQL
mysql -u root -p
# Te pedirá tu contraseña (5657 según tu .env)

# Dentro de MySQL, ejecuta:
CREATE DATABASE aprende_jugando CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aprende_jugando;
SOURCE database/schema.sql;
SOURCE database/seed_actividades.sql;
EXIT;
```

### Opción C: Script automatizado (Windows)

Ejecuta desde la carpeta backend:

```bash
mysql -u root -p5657 -e "CREATE DATABASE IF NOT EXISTS aprende_jugando CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p5657 aprende_jugando < database/schema.sql
mysql -u root -p5657 aprende_jugando < database/seed_actividades.sql
```

## Paso 4: Verificar la Instalación

Conéctate a MySQL y verifica que las tablas se crearon correctamente:

```bash
mysql -u root -p
USE aprende_jugando;
SHOW TABLES;
```

Deberías ver estas tablas:
- actividades
- actividad_opciones
- curso_estudiantes
- cursos
- estudiante_configuracion
- estudiante_logros
- estudiante_misiones
- estudiante_personalizaciones
- estudiante_respuestas
- evaluaciones
- logros
- mision_competencias
- mision_pistas
- misiones
- personalizaciones
- usuarios

## Paso 5: Iniciar el Servidor Backend

En la terminal, dentro de la carpeta `backend`, ejecuta:

```bash
npm start
```

O para modo desarrollo con reinicio automático:

```bash
npm run dev
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:4000
📚 Documentación de la API en http://localhost:4000/
```

## Paso 6: Probar la API

Abre tu navegador y visita: http://localhost:4000

Deberías ver un JSON con todos los endpoints disponibles.

### Probar Login

Usa Postman, Thunder Client o curl para probar el login:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"estudiante@test.com\",\"password\":\"password123\"}"
```

**Usuarios de prueba creados:**
- **Estudiante**: `estudiante@test.com` / `password123`
- **Game Master**: `gm@test.com` / `password123`
- **Admin**: `admin@test.com` / `password123`

## Paso 7: Verificar Datos de Prueba

Verifica que los datos de prueba se insertaron correctamente:

```sql
-- Ver usuarios
SELECT id, nombre, email, rol, nivel, experiencia FROM usuarios;

-- Ver cursos
SELECT * FROM cursos;

-- Ver misión de ejemplo
SELECT * FROM misiones;

-- Ver actividades de la misión
SELECT id, titulo, pregunta FROM actividades WHERE mision_id = 1;

-- Ver logros
SELECT * FROM logros;

-- Ver personalizaciones
SELECT * FROM personalizaciones;
```

## Solución de Problemas Comunes

### Error: "Access denied for user 'root'@'localhost'"
- Verifica que la contraseña en `.env` sea correcta
- Verifica que MySQL esté corriendo: `mysql --version`

### Error: "Unknown database 'aprende_jugando'"
- La base de datos no se creó. Ejecuta el Paso 3 nuevamente.

### Error: "Table doesn't exist"
- Los scripts SQL no se ejecutaron correctamente. Ejecuta:
  ```sql
  DROP DATABASE aprende_jugando;
  CREATE DATABASE aprende_jugando;
  USE aprende_jugando;
  SOURCE database/schema.sql;
  SOURCE database/seed_actividades.sql;
  ```

### Error: "Port 4000 already in use"
- Cambia el puerto en `.env` a otro valor (ej: 4001)

## Estructura de la Base de Datos

### Tablas Principales:
- **usuarios**: Estudiantes, GMs y Admins
- **cursos**: Cursos creados por GMs
- **misiones**: Misiones/tareas asignadas
- **actividades**: Ejercicios dentro de cada misión
- **evaluaciones**: Evaluaciones de GMs a estudiantes

### Sistema de Gamificación:
- **logros**: Achievements del sistema
- **personalizaciones**: Avatares, atuendos, accesorios
- **estudiante_configuracion**: Personalización activa de cada estudiante

### Progreso y Respuestas:
- **estudiante_misiones**: Progreso en cada misión
- **estudiante_respuestas**: Respuestas a actividades
- **estudiante_logros**: Logros desbloqueados

## Próximos Pasos

1. Prueba todos los endpoints de la API con Postman
2. Conecta el frontend al backend
3. Crea más misiones y actividades desde el panel GM
4. Personaliza los logros y personalizaciones según tus necesidades

## Documentación de la API

Consulta el archivo `API_GM_COMPLETA.md` para ver todos los endpoints disponibles.

## Contacto y Soporte

Si tienes problemas, verifica:
1. MySQL está corriendo
2. Las credenciales en `.env` son correctas
3. La base de datos y tablas existen
4. El puerto 4000 está libre
