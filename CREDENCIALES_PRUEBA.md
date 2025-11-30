# 🔑 Credenciales de Prueba - Aprende Jugando

Este documento contiene las credenciales de usuarios de prueba incluidos en el script `SCHEMA_COMPLETO.sql`.

---

## 👤 Usuarios Disponibles

### 🔴 Administrador
```
Email:      admin@test.com
Contraseña: password123
Rol:        admin
RUT:        12.345.678-9
```
**Acceso a:** Panel completo de administración (`/admin/dashboard`)

---

### 🟢 Game Master (Profesor)
```
Email:      gm@test.com
Contraseña: password123
Rol:        gm
RUT:        98.765.432-1
```
**Acceso a:** Panel de gestión de estudiantes y misiones (`/gm/inicio`)

**Datos de Prueba Incluidos:**
- ✅ 2 Cursos creados
- ✅ 5 Misiones asignadas
- ✅ 3 Estudiantes inscritos
- ✅ 1 Evaluación pendiente

---

### 🔵 Estudiantes

#### Estudiante Principal
```
Email:      estudiante@test.com
Contraseña: password123
Rol:        estudiante
RUT:        11.222.333-4
```

#### Estudiante 1
```
Email:      estudiante1@test.com
Contraseña: password123
Rol:        estudiante
RUT:        11.222.333-5
Nombre:     María González
```

#### Estudiante 2
```
Email:      estudiante2@test.com
Contraseña: password123
Rol:        estudiante
RUT:        22.333.444-5
Nombre:     Juan Pérez
```

**Acceso a:** Panel de estudiante con misiones, progreso y logros

---

## 🚀 Cómo Usar

1. **Ejecuta el script SQL**:
   ```bash
   # En MySQL Workbench, abre y ejecuta:
   backend/database/SCHEMA_COMPLETO.sql
   ```

2. **Inicia el backend**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Inicia el frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

4. **Accede a la aplicación**:
   - Abre tu navegador en `http://localhost:5173`
   - Usa cualquiera de las credenciales de arriba

---

## 📝 Notas Importantes

- ✅ Todas las contraseñas están **hasheadas con bcrypt** (salt rounds = 10)
- ✅ Los hashes son **reales y funcionales** (no placeholders)
- ✅ La contraseña para **TODOS** los usuarios es: `password123`
- ✅ Puedes cambiar las contraseñas desde el panel de cada usuario
- ✅ Los usuarios se crean automáticamente al ejecutar `SCHEMA_COMPLETO.sql`

---

## 🔒 Seguridad

**IMPORTANTE:** Estas son credenciales de **PRUEBA** únicamente.

- ❌ NO uses estas credenciales en producción
- ❌ NO uses la contraseña `password123` en entornos reales
- ✅ Cambia las contraseñas antes de desplegar
- ✅ Usa contraseñas fuertes en producción

---

## 🛠️ Crear Nuevos Usuarios

### Opción A: Desde el Panel de Admin

1. Inicia sesión como **admin**
2. Ve a **Usuarios** en el menú
3. Haz clic en **Crear Usuario**
4. Completa el formulario
5. ✅ La contraseña se hashea automáticamente

### Opción B: Manualmente con SQL

1. **Genera un hash bcrypt**:
   ```bash
   cd backend
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('TuContraseña123', 10, (err, hash) => console.log(hash));"
   ```

2. **Inserta en la base de datos**:
   ```sql
   INSERT INTO usuarios (rut, nombre, email, password, rol, nivel, experiencia, estado, institucion)
   VALUES (
     'XX.XXX.XXX-X',
     'Nombre Completo',
     'email@ejemplo.com',
     'PEGA_AQUI_EL_HASH',
     'estudiante',  -- o 'gm' o 'admin'
     1,
     0,
     'activo',
     'Nombre Institución'
   );
   ```

---

## 🔄 Restablecer Contraseñas

Si olvidas una contraseña o necesitas restablecerlas, ejecuta:

```bash
# En MySQL Workbench:
backend/database/ACTUALIZAR_PASSWORDS.sql
```

Este script restaura las contraseñas a `password123` para los 3 usuarios principales:
- admin@test.com
- gm@test.com
- estudiante@test.com

**Los hashes utilizados son:**
- Admin: `$2b$10$Z0SzqC4oC.yVV3a33Mua/.58KNiH3pBElJQT6UT9SWYvfTo6YrOSq`
- GM: `$2b$10$yDSeEhy/h5yf6Ywj0b1SiOFTomtkevNP5EkXYjAvTFakPk8my/9Ei`
- Estudiante: `$2b$10$yKyWzl4SZSGCKJqUtDH54.EaPpGaVCAyPC5SycIuFVKXIvNYduc/S`

---

## 📚 Recursos Adicionales

- **[SCHEMA_COMPLETO.sql](backend/database/SCHEMA_COMPLETO.sql)** - Script completo de la base de datos
- **[actualizar_passwords.sql](backend/database/actualizar_passwords.sql)** - Script para restablecer contraseñas
- **[SOLUCION_LOGIN.md](SOLUCION_LOGIN.md)** - Guía de solución de problemas de login

---

## ✅ Verificar Usuarios

Para verificar que los usuarios se crearon correctamente:

```sql
USE aprende_jugando;

SELECT
  rut,
  nombre,
  email,
  rol,
  estado
FROM usuarios
ORDER BY
  CASE rol
    WHEN 'admin' THEN 1
    WHEN 'gm' THEN 2
    WHEN 'estudiante' THEN 3
  END;
```

Deberías ver:

```
+----------------+------------------+-------------------------+-----------+--------+
| rut            | nombre           | email                   | rol       | estado |
+----------------+------------------+-------------------------+-----------+--------+
| 12.345.678-9   | Admin Test       | admin@test.com          | admin     | activo |
| 98.765.432-1   | Game Master Test | gm@test.com             | gm        | activo |
| 11.222.333-4   | Estudiante Uno   | estudiante1@test.com    | estudiante| activo |
| 22.333.444-5   | Estudiante Dos   | estudiante2@test.com    | estudiante| activo |
| 33.444.555-6   | Estudiante Tres  | estudiante3@test.com    | estudiante| activo |
+----------------+------------------+-------------------------+-----------+--------+
```

---

**Última actualización:** 2024
**Versión del schema:** 1.0
**Compatible con:** MySQL 8.0+, Node.js 14+
