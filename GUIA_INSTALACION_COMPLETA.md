# 🚀 Guía de Instalación Completa - Aprende Jugando

Esta guía te ayudará a instalar y configurar el proyecto completo en un nuevo servidor local desde cero.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v16 o superior) - [Descargar](https://nodejs.org/)
- **MySQL** (v8.0 o superior) - [Descargar](https://dev.mysql.com/downloads/mysql/)
- **Git** (opcional, para clonar el repositorio)
- **Cuenta de Gmail** (para la recuperación de contraseñas)

---

## 📁 Estructura del Proyecto

```
aprende-jugando/
├── backend/          # Servidor Node.js + Express
├── frontend/         # Cliente React + Vite
└── README.md
```

---

## 🔧 Paso 1: Clonar o Copiar el Proyecto

### Opción A: Clonar desde Git
```bash
git clone <url-del-repositorio>
cd aprende-jugando
```

### Opción B: Copiar manualmente
Copia toda la carpeta `aprende-jugando` al servidor local.

---

## 🗄️ Paso 2: Configurar la Base de Datos MySQL

### 2.1. Iniciar MySQL

Asegúrate de que el servidor MySQL esté ejecutándose:

**Windows:**
```bash
# Busca "Services" y verifica que MySQL esté iniciado
# O usa XAMPP/WAMP/MAMP
```

**macOS/Linux:**
```bash
sudo systemctl start mysql
# O
sudo service mysql start
```

### 2.2. Crear la Base de Datos

**Opción 1: Usando MySQL Workbench**
1. Abre MySQL Workbench
2. Conecta al servidor local (usuario: `root`, password: tu contraseña)
3. Ve a `File` → `Open SQL Script`
4. Abre el archivo: `backend/database/SCHEMA_COMPLETO.sql`
5. Haz clic en el icono de rayo ⚡ para ejecutar

**Opción 2: Usando phpMyAdmin (XAMPP/WAMP)**
1. Abre phpMyAdmin en http://localhost/phpmyadmin
2. Ve a la pestaña "SQL"
3. Copia y pega el contenido de `backend/database/SCHEMA_COMPLETO.sql`
4. Haz clic en "Continuar"

**Opción 3: Usando línea de comandos**
```bash
# Conectarse a MySQL
mysql -u root -p

# Dentro de MySQL, ejecutar:
source /ruta/completa/aprende-jugando/backend/database/SCHEMA_COMPLETO.sql
```

**Opción 4: Comando directo (Windows)**
```bash
mysql -u root -p < "C:\ruta\aprende-jugando\backend\database\SCHEMA_COMPLETO.sql"
```

### 2.3. Verificar la Creación

Ejecuta en MySQL:
```sql
USE aprende_jugando;
SHOW TABLES;
```

Deberías ver aproximadamente 20 tablas incluyendo:
- `usuarios`
- `cursos`
- `misiones`
- `notificaciones`
- `password_reset_tokens` ← **¡Importante para recuperación de contraseña!**

---

## ⚙️ Paso 3: Configurar el Backend

### 3.1. Instalar Dependencias

```bash
cd backend
npm install
```

### 3.2. Configurar Variables de Entorno

Edita el archivo `backend/.env`:

```env
# Configuración del Servidor
PORT=4000

# Configuración de la Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql    # ← CAMBIA ESTO
DB_NAME=aprende_jugando
DB_PORT=3306

# Seguridad JWT
JWT_SECRET=un_secreto_super_seguro  # ← Cambia por algo más seguro en producción

# Configuración de Email (Gmail SMTP para recuperación de contraseña)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com                    # ← CAMBIA ESTO
EMAIL_PASSWORD=tu_contraseña_de_aplicacion       # ← CAMBIA ESTO (ver sección 3.3)
EMAIL_FROM_NAME=Aprende Jugando
EMAIL_FROM_ADDRESS=tu_email@gmail.com            # ← CAMBIA ESTO
```

### 3.3. Configurar Gmail para Recuperación de Contraseñas

El sistema de recuperación de contraseñas requiere una **Contraseña de Aplicación de Gmail**:

#### Pasos para Generar la Contraseña:

1. **Ve a tu cuenta de Google**: https://myaccount.google.com/

2. **Activa la Verificación en 2 Pasos** (si no la tienes):
   - Haz clic en "Seguridad" (panel izquierdo)
   - Busca "Verificación en dos pasos"
   - Sigue los pasos para activarla

3. **Genera una Contraseña de Aplicación**:
   - En "Seguridad", busca "Contraseñas de aplicaciones"
   - Haz clic en "Contraseñas de aplicaciones"
   - Selecciona "Correo" como aplicación
   - Selecciona "Otro" como dispositivo
   - Escribe "Aprende Jugando"
   - Haz clic en "Generar"

4. **Copia la Contraseña**:
   - Google te mostrará una contraseña de 16 caracteres
   - Ejemplo: `abcd efgh ijkl mnop`
   - **COPIA esta contraseña SIN los espacios**: `abcdefghijklmnop`

5. **Pega en el .env**:
   ```env
   EMAIL_PASSWORD=abcdefghijklmnop
   ```

#### ⚠️ Notas Importantes sobre el Email:

- **NO** uses tu contraseña normal de Gmail
- **SÍ** usa la contraseña de aplicación de 16 caracteres
- La verificación en 2 pasos **DEBE** estar activada
- Si obtienes el error `Username and Password not accepted`:
  - Verifica que la contraseña no tenga espacios
  - Verifica que sea la contraseña de aplicación (no tu contraseña de Gmail)
  - Verifica que el email sea correcto

### 3.4. Probar el Backend

```bash
npm run dev
```

Deberías ver:
```
✅ Conectado a la base de datos MySQL
✅ Servidor de email listo para enviar mensajes
🚀 Servidor corriendo en http://localhost:4000
```

**Si ves el error de email:**
```
❌ Error al conectar con el servidor de email: Invalid login
```
→ Revisa la sección 3.3 nuevamente y verifica las credenciales.

---

## 🎨 Paso 4: Configurar el Frontend

### 4.1. Instalar Dependencias

Abre una **nueva terminal** (mantén el backend corriendo):

```bash
cd frontend
npm install
```

### 4.2. Configurar la URL del Backend (si es necesario)

Si tu backend NO está en `http://localhost:4000`, edita `frontend/src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:4000/api',  // ← Cambia el puerto si es diferente
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### 4.3. Iniciar el Frontend

```bash
npm run dev
```

Deberías ver:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

---

## 🧪 Paso 5: Verificar la Instalación

### 5.1. Abrir la Aplicación

Abre tu navegador en: **http://localhost:3000**

### 5.2. Probar el Login

Usa las credenciales de prueba:

**Admin:**
- Email: `admin@test.com`
- Contraseña: `password123`

**Game Master:**
- Email: `gm@test.com`
- Contraseña: `password123`

**Estudiante:**
- Email: `estudiante@test.com`
- Contraseña: `password123`

### 5.3. Probar el Registro de Estudiantes

1. Haz clic en "Registrarse aquí"
2. Completa el formulario:
   - Nombre completo
   - RUT (formato: `12.345.678-9`)
   - Email (debe terminar en `.com` o `.cl`)
   - Contraseña (mín 8 chars, 1 mayúscula, 1 número, 1 símbolo)
   - Institución (opcional)
   - Fecha de nacimiento (opcional)
3. Haz clic en "Registrarse"
4. Deberías poder iniciar sesión inmediatamente

### 5.4. Probar la Recuperación de Contraseña

1. En el login, haz clic en "¿Olvidaste tu contraseña?"
2. Ingresa un email registrado (ej: `estudiante@test.com`)
3. Haz clic en "Enviar Instrucciones"
4. **Verifica tu email** (el configurado en `EMAIL_USER`)
5. Deberías recibir un correo con un enlace
6. Haz clic en el enlace o cópialo en el navegador
7. Ingresa una nueva contraseña
8. Inicia sesión con la nueva contraseña

---

## 📊 Datos de Prueba Incluidos

El esquema incluye datos de prueba:

### Usuarios:
- 1 Admin
- 1 Game Master (profesor)
- 3 Estudiantes

### Cursos:
- Matemáticas 1° Básico
- Ciencias Naturales

### Misiones:
- 5 misiones de ejemplo con diferentes tipos (ejercicio, lectura, examen)

### Otros:
- Logros del sistema
- Competencias
- Instituciones educativas
- Roles y permisos

---

## 🔧 Solución de Problemas

### Problema 1: "Cannot connect to MySQL"

**Síntomas:**
```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'
```

**Solución:**
- Verifica que MySQL esté corriendo
- Verifica la contraseña en `backend/.env`
- Prueba conectarte manualmente:
  ```bash
  mysql -u root -p
  ```

### Problema 2: "Table 'password_reset_tokens' doesn't exist"

**Síntomas:**
```
Error: Table 'aprende_jugando.password_reset_tokens' doesn't exist
```

**Solución:**
Ejecuta este SQL en tu base de datos:
```sql
USE aprende_jugando;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_rut VARCHAR(12) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_usuario_rut (usuario_rut),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Problema 3: "Username and Password not accepted" (Email)

**Síntomas:**
```
❌ Error al conectar con el servidor de email: Invalid login
```

**Solución:**
1. Verifica que tengas la verificación en 2 pasos activada en Gmail
2. Genera una nueva contraseña de aplicación
3. Copia la contraseña SIN espacios en `EMAIL_PASSWORD`
4. Reinicia el backend (`Ctrl+C` y luego `npm run dev`)

### Problema 4: Puerto 3000 o 4000 en uso

**Síntomas:**
```
Error: Port 4000 is already in use
```

**Solución:**

**Windows:**
```bash
# Encontrar el proceso
netstat -ano | findstr :4000

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Encontrar y matar el proceso
lsof -ti:4000 | xargs kill -9
```

### Problema 5: Errores de dependencias npm

**Síntomas:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solución:**
```bash
# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Instalar con --legacy-peer-deps
npm install --legacy-peer-deps
```

---

## 📝 Notas Importantes

### Seguridad en Producción

Si vas a desplegar en producción, recuerda:

1. **Cambiar JWT_SECRET** a algo más seguro:
   ```env
   JWT_SECRET=generar_string_aleatorio_muy_largo_y_seguro_123456789
   ```

2. **Usar HTTPS** en producción

3. **Configurar CORS** apropiadamente en `backend/src/index.js`

4. **No compartir** el archivo `.env`

5. **Cambiar contraseñas** de los usuarios de prueba

### Estructura de Contraseñas

Todas las contraseñas deben cumplir:
- Mínimo 8 caracteres
- Al menos 1 letra mayúscula
- Al menos 1 número
- Al menos 1 símbolo especial (`!@#$%^&*()_-+={}[]:;"'<>,.?/~``)

### RUT Chileno

El formato debe ser: `XX.XXX.XXX-X`
- Ejemplo válido: `12.345.678-9`
- Ejemplo inválido: `12345678-9` (sin puntos)

---

## 🎯 Checklist de Instalación

Marca cada paso completado:

- [ ] Node.js instalado
- [ ] MySQL instalado y corriendo
- [ ] Base de datos creada con `SCHEMA_COMPLETO.sql`
- [ ] Tabla `password_reset_tokens` existe
- [ ] Backend: `npm install` ejecutado
- [ ] Backend: `.env` configurado
- [ ] Gmail: Contraseña de aplicación generada
- [ ] Gmail: Contraseña agregada al `.env`
- [ ] Backend: `npm run dev` corriendo sin errores
- [ ] Backend: Mensaje "Servidor de email listo" visible
- [ ] Frontend: `npm install` ejecutado
- [ ] Frontend: `npm run dev` corriendo
- [ ] Login funciona con usuarios de prueba
- [ ] Registro de estudiantes funciona
- [ ] Recuperación de contraseña envía email correctamente

---

## 📞 Soporte

Si encuentras problemas no cubiertos en esta guía:

1. Verifica los logs de la consola del backend
2. Verifica los logs de la consola del navegador (F12 → Console)
3. Revisa la sección "Solución de Problemas" arriba
4. Consulta el archivo `backend/database/INSTRUCCIONES_PASSWORD_RESET.md` para detalles específicos del sistema de recuperación de contraseñas

---

## ✅ ¡Instalación Completa!

Si completaste todos los pasos, tu instalación está lista. Puedes comenzar a usar Aprende Jugando en tu servidor local.

**URLs importantes:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Documentación API: http://localhost:4000 (si está configurado)

---

**Última actualización:** Noviembre 2024
**Versión del proyecto:** 2.0
