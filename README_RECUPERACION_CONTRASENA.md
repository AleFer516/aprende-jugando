# 🔐 Sistema de Recuperación de Contraseñas - Aprende Jugando

Este documento explica el sistema completo de recuperación de contraseñas implementado en el proyecto.

---

## 📋 Resumen

El sistema permite a los usuarios recuperar su contraseña mediante un enlace enviado por email. Funciona completamente en entornos locales usando Gmail SMTP.

---

## 🗂️ Archivos Creados/Modificados

### Backend

1. **Base de Datos:**
   - `backend/database/SCHEMA_COMPLETO.sql` - Incluye tabla `password_reset_tokens`
   - `backend/database/add_password_reset_tokens.sql` - Script individual para crear la tabla
   - `backend/database/EJECUTAR_PRIMERO.sql` - Script de creación rápida

2. **Configuración:**
   - `backend/.env` - Variables de configuración de email
   - `backend/src/config/email.js` - Configuración de Nodemailer y función de envío

3. **Rutas API:**
   - `backend/src/routes/auth.routes.js` - Endpoints:
     - `POST /api/auth/forgot-password` - Solicitar recuperación
     - `POST /api/auth/reset-password` - Restablecer con token

### Frontend

1. **Páginas:**
   - `frontend/src/pages/OlvidoContrasena.jsx` - Formulario para solicitar recuperación
   - `frontend/src/pages/RestablecerContrasena.jsx` - Formulario para cambiar contraseña

2. **Rutas:**
   - `frontend/src/App.jsx` - Rutas configuradas:
     - `/olvido-contrasena` - Solicitar recuperación
     - `/restablecer-contrasena/:token` - Cambiar contraseña con token

3. **Navegación:**
   - `frontend/src/pages/Login.jsx` - Link "¿Olvidaste tu contraseña?" actualizado

---

## 🔧 Configuración Requerida

### 1. Tabla en Base de Datos

La tabla `password_reset_tokens` se crea automáticamente al ejecutar `SCHEMA_COMPLETO.sql`.

**Estructura:**
```sql
CREATE TABLE password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_rut VARCHAR(12) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_rut) REFERENCES usuarios(rut) ON DELETE CASCADE
);
```

### 2. Variables de Entorno (backend/.env)

```env
# Configuración de Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion
EMAIL_FROM_NAME=Aprende Jugando
EMAIL_FROM_ADDRESS=tu_email@gmail.com
```

**Importante:** `EMAIL_PASSWORD` debe ser una **Contraseña de Aplicación de Gmail**, no tu contraseña normal.

### 3. Generar Contraseña de Aplicación de Gmail

1. Ve a https://myaccount.google.com/
2. Seguridad → Verificación en 2 pasos (actívala si no la tienes)
3. Seguridad → Contraseñas de aplicaciones
4. Genera una nueva para "Correo" / "Otro (Aprende Jugando)"
5. Copia la contraseña de 16 caracteres SIN espacios
6. Pégala en `EMAIL_PASSWORD` del archivo `.env`

---

## 🚀 Flujo de Funcionamiento

### 1. Usuario Solicita Recuperación

**Frontend:** `/olvido-contrasena`
- Usuario ingresa su email
- Sistema valida formato (.com o .cl)
- Envía petición a `/api/auth/forgot-password`

**Backend:**
```javascript
POST /api/auth/forgot-password
Body: { email: "usuario@example.com" }
```

**Proceso:**
1. Busca usuario por email en BD
2. Si NO existe → Devuelve mensaje genérico (por seguridad)
3. Si SÍ existe:
   - Genera token único de 64 caracteres (crypto.randomBytes)
   - Guarda token en BD con expiración de 1 hora
   - Envía email con enlace: `http://localhost:3000/restablecer-contrasena/{token}`
   - Registra actividad en logs

**Email enviado:**
- Diseño HTML profesional con gradientes
- Botón destacado para restablecer
- Link alternativo para copiar/pegar
- Advertencias de seguridad (expira en 1 hora, uso único)

### 2. Usuario Hace Clic en el Enlace

**Frontend:** `/restablecer-contrasena/:token`
- Captura token de la URL
- Muestra formulario para nueva contraseña
- Validaciones:
  - Mínimo 8 caracteres
  - Al menos 1 mayúscula
  - Al menos 1 número
  - Al menos 1 símbolo especial

### 3. Usuario Ingresa Nueva Contraseña

**Backend:**
```javascript
POST /api/auth/reset-password
Body: {
  token: "abc123...",
  newPassword: "NuevaPassword123!"
}
```

**Proceso:**
1. Busca token en BD
2. Validaciones:
   - ✅ Token existe
   - ✅ No ha sido usado (`used = 0`)
   - ✅ No ha expirado (`expires_at > now`)
3. Si todas las validaciones pasan:
   - Encripta nueva contraseña (bcrypt, 10 rounds)
   - Actualiza contraseña del usuario
   - Marca token como usado (`used = 1`)
   - Registra actividad en logs
4. Redirecciona automáticamente al login tras 3 segundos

---

## 🔒 Características de Seguridad

1. **Tokens únicos y seguros:**
   - Generados con `crypto.randomBytes(32).toString('hex')` (64 caracteres)
   - Imposibles de predecir o adivinar

2. **Expiración temporal:**
   - Los tokens expiran en 1 hora
   - Se verifica la fecha antes de permitir el cambio

3. **Uso único:**
   - Cada token solo se puede usar una vez
   - Se marca como `used = 1` después de usarse

4. **Prevención de enumeración:**
   - Siempre devuelve el mismo mensaje genérico
   - No revela si un email existe o no en el sistema

5. **Validación de contraseñas:**
   - Mínimo 8 caracteres
   - Debe incluir mayúscula, número y símbolo
   - Regex: `/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]:;"'<>,.?/~`|\\]).{8,}$/`

6. **Registro de auditoría:**
   - Todas las acciones se registran en `actividad_admin`
   - Incluye: solicitudes, cambios exitosos, errores

7. **Limpieza automática:**
   - Si el email falla, el token se elimina de la BD
   - Previene tokens huérfanos

---

## 📧 Contenido del Email

El email enviado incluye:

```html
- Encabezado con gradiente morado/azul
- Emoji de candado 🔐
- Saludo personalizado con nombre del usuario
- Botón destacado "Restablecer Contraseña"
- Link alternativo para copiar/pegar
- Advertencias de seguridad:
  * Válido por 1 hora
  * Uso único
  * Si no lo solicitaste, ignora el email
- Footer con copyright y disclaimer
```

---

## 🧪 Cómo Probar

### Prueba Completa:

1. **Registra un usuario de prueba:**
   ```
   URL: http://localhost:3000/registro
   Email: tu_email_real@gmail.com
   Contraseña: Password123!
   ```

2. **Solicita recuperación:**
   ```
   URL: http://localhost:3000/olvido-contrasena
   Email: tu_email_real@gmail.com
   ```

3. **Verifica logs del backend:**
   ```
   ✅ Usuario encontrado: tu_email_real@gmail.com
   🎫 Token generado
   💾 Token guardado en la base de datos
   📧 Email de recuperación enviado
   ```

4. **Revisa tu email:**
   - Bandeja de entrada
   - Carpeta de SPAM (si no aparece)

5. **Haz clic en el enlace del email:**
   ```
   URL: http://localhost:3000/restablecer-contrasena/{token}
   ```

6. **Ingresa nueva contraseña:**
   ```
   Nueva contraseña: NuevaPassword456!
   Confirmar: NuevaPassword456!
   ```

7. **Espera redirección automática al login (3 segundos)**

8. **Inicia sesión con nueva contraseña:**
   ```
   Email: tu_email_real@gmail.com
   Contraseña: NuevaPassword456!
   ```

### Casos de Prueba Adicionales:

**1. Token expirado:**
- Modifica manualmente `expires_at` en la BD a una fecha pasada
- Intenta usar el token
- Debería mostrar: "El token ha expirado. Solicita uno nuevo."

**2. Token ya usado:**
- Usa un token válido una vez
- Intenta usarlo nuevamente
- Debería mostrar: "Este token ya ha sido utilizado"

**3. Token inválido:**
- Modifica manualmente el token en la URL
- Debería mostrar: "Token inválido o expirado"

**4. Email no existe:**
- Solicita recuperación con email no registrado
- Debería mostrar mensaje genérico sin revelar que no existe

**5. Contraseña débil:**
- Intenta cambiar a "password" (sin mayúscula, número o símbolo)
- Debería mostrar: "La contraseña debe tener al menos 8 caracteres..."

---

## 🐛 Solución de Problemas

### Error: "Email no existe"

**Causa:** El email no está registrado en la base de datos.

**Solución:**
- Verifica que el usuario existe: `SELECT * FROM usuarios WHERE email = 'email@test.com';`
- Registra un nuevo usuario primero

### Error: "Username and Password not accepted"

**Causa:** Credenciales de Gmail incorrectas.

**Solución:**
1. Verifica que `EMAIL_USER` sea correcto
2. Genera nueva contraseña de aplicación de Gmail
3. Actualiza `EMAIL_PASSWORD` en `.env`
4. Reinicia el backend

### Error: "No se pudo conectar con el servidor"

**Causa:** Backend no está corriendo o puerto incorrecto.

**Solución:**
1. Verifica que el backend esté corriendo en puerto 4000
2. Verifica que `api.js` apunte a `http://localhost:4000/api`

### Error: "Table 'password_reset_tokens' doesn't exist"

**Causa:** La tabla no fue creada en la base de datos.

**Solución:**
1. Ejecuta `SCHEMA_COMPLETO.sql` completo
2. O ejecuta `EJECUTAR_PRIMERO.sql` para crear solo esta tabla

### El email no llega:

**Posibles causas:**
1. Revisa la carpeta de SPAM
2. Verifica que `EMAIL_FROM_ADDRESS` sea igual a `EMAIL_USER`
3. Verifica logs del backend para ver errores
4. Verifica que la cuenta de Gmail tenga verificación en 2 pasos

---

## 📊 Estadísticas del Sistema

- **Tiempo de expiración:** 1 hora
- **Longitud del token:** 64 caracteres hexadecimales
- **Algoritmo de hash:** bcrypt con 10 rounds
- **Puerto SMTP:** 587 (TLS)
- **Formato de email:** HTML responsive
- **Tamaño promedio del email:** ~8KB

---

## 🔄 Mantenimiento

### Limpiar tokens expirados (opcional):

```sql
-- Eliminar tokens que expiraron hace más de 24 horas
DELETE FROM password_reset_tokens
WHERE expires_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);
```

Puedes crear un cron job o tarea programada para ejecutar esto diariamente.

---

## 📝 Notas de Desarrollo

- Los archivos `.OLD.jsx` fueron eliminados durante el desarrollo
- El archivo `recuperarContrasena.css` fue eliminado (se usa `login.css`)
- El diseño es consistente con Login.jsx (mismo fondo, header, estilos)
- Los iconos de ojo para mostrar contraseña usan `@heroicons/react/24/outline`

---

## ✅ Checklist de Verificación

- [x] Tabla `password_reset_tokens` en SCHEMA_COMPLETO.sql
- [x] Variables de entorno configuradas en `.env`
- [x] Nodemailer instalado (`npm install nodemailer`)
- [x] Endpoints backend implementados
- [x] Páginas frontend creadas
- [x] Rutas configuradas en App.jsx
- [x] Link en Login.jsx actualizado
- [x] Email HTML diseñado
- [x] Validaciones de seguridad implementadas
- [x] Logs de auditoría funcionando
- [x] Redirección automática tras éxito
- [x] Manejo de errores completo

---

**Desarrollado para:** Aprende Jugando
**Fecha:** Diciembre 2024
**Versión:** 1.0
