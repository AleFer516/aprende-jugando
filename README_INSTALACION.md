# 🚀 Instalación de Aprende Jugando

Guía completa para instalar y ejecutar el proyecto en cualquier servidor local.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js** (versión 16 o superior) - [Descargar aquí](https://nodejs.org/)
- ✅ **MySQL** (versión 8.0 o superior) - [Descargar aquí](https://dev.mysql.com/downloads/mysql/)
- ✅ **MySQL Workbench** (recomendado) - [Descargar aquí](https://dev.mysql.com/downloads/workbench/)
- ✅ **Git** (opcional) - [Descargar aquí](https://git-scm.com/)

---

## 🔧 Paso 1: Clonar o Copiar el Proyecto

### Opción A: Con Git
```bash
git clone <url-del-repositorio>
cd aprende-jugando
```

### Opción B: Copiar carpeta
Simplemente copia la carpeta completa del proyecto a tu PC.

---

## 💾 Paso 2: Configurar la Base de Datos

### 2.1 Iniciar MySQL
Asegúrate de que MySQL esté corriendo en tu PC.

### 2.2 Crear la Base de Datos
1. **Abre MySQL Workbench**
2. **Conecta** a tu servidor local (localhost)
3. **Abre** el archivo: `backend/database/SCHEMA_COMPLETO.sql`
4. **Selecciona TODO** el contenido (Ctrl + A)
5. **Ejecuta** el script (Ctrl + Shift + Enter o botón ⚡)
6. **Espera** a que termine la ejecución

El script:
- ✅ Crea la base de datos `aprende_jugando`
- ✅ Crea todas las tablas necesarias
- ✅ Inserta usuarios de prueba
- ✅ Inserta datos de ejemplo (cursos, misiones, etc.)

### 2.3 Verificar la Instalación
Al finalizar, deberías ver mensajes como:
```
✅ BASE DE DATOS CREADA EXITOSAMENTE
📊 RESUMEN DE TABLAS CREADAS
👥 USUARIOS CREADOS
🔐 CREDENCIALES DE ACCESO
```

---

## ⚙️ Paso 3: Configurar el Backend

### 3.1 Navegar a la carpeta del backend
```bash
cd backend
```

### 3.2 Instalar dependencias
```bash
npm install
```

### 3.3 Configurar variables de entorno
El archivo `.env` ya está configurado con valores por defecto. **NO necesitas modificarlo** a menos que uses un puerto diferente para MySQL.

**Archivo `.env` actual:**
```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=aprende_jugando
JWT_SECRET=tu_clave_secreta_super_segura_aqui
```

**Si tu MySQL tiene contraseña**, edita `DB_PASSWORD`:
```env
DB_PASSWORD=tu_password_mysql
```

### 3.4 Iniciar el backend
```bash
npm run dev
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:4000
📚 Documentación de la API en http://localhost:4000/
```

---

## 🎨 Paso 4: Configurar el Frontend

### 4.1 Abrir una NUEVA terminal
No cierres la terminal del backend. Abre una nueva terminal.

### 4.2 Navegar a la carpeta del frontend
```bash
cd frontend
```

### 4.3 Instalar dependencias
```bash
npm install
```

### 4.4 Verificar configuración
El archivo `.env` ya está configurado:
```env
VITE_API_URL=http://localhost:4000/api
```

### 4.5 Iniciar el frontend
```bash
npm run dev
```

Deberías ver:
```
VITE v7.2.4  ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## 🎉 Paso 5: Acceder a la Aplicación

### 5.1 Abrir el navegador
Abre tu navegador en: **http://localhost:5173**

### 5.2 Iniciar sesión
Usa cualquiera de estas credenciales de prueba:

#### 👤 ADMINISTRADOR
- **Email:** `admin@test.com`
- **Password:** `password123`
- **RUT:** `12.345.678-9`

#### 🎮 GAME MASTER (GM)
- **Email:** `gm@test.com`
- **Password:** `password123`
- **RUT:** `98.765.432-1`

#### 📚 ESTUDIANTE
- **Email:** `estudiante@test.com`
- **Password:** `password123`
- **RUT:** `11.222.333-4`

---

## ✅ Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] MySQL está corriendo y accesible
- [ ] La base de datos `aprende_jugando` existe
- [ ] El backend está corriendo en puerto 4000
- [ ] El frontend está corriendo en puerto 5173
- [ ] No hay errores en la consola del backend
- [ ] No hay errores en la consola del navegador (F12)
- [ ] LocalStorage está limpio (F12 → Application → Clear)

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot connect to MySQL"
**Solución:**
1. Verifica que MySQL esté corriendo
2. Revisa las credenciales en `backend/.env`
3. Asegúrate de que el puerto 3306 no esté bloqueado

### Error: "Port 4000 already in use"
**Solución:**
1. Cierra otros procesos que usen el puerto 4000
2. O cambia el puerto en `backend/.env`

### Error: "Port 5173 already in use"
**Solución:**
1. Cierra otras instancias del frontend
2. Vite automáticamente usará el siguiente puerto disponible (5174, 5175, etc.)

### Error: "Credenciales incorrectas"
**Solución:**
1. Ejecuta el script `backend/database/ACTUALIZAR_PASSWORDS.sql`
2. O ejecuta nuevamente `SCHEMA_COMPLETO.sql`
3. Limpia el localStorage del navegador (F12 → Application → Clear)

### Error: "Cannot GET /"
**Solución:**
Asegúrate de estar accediendo a:
- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

---

## 📁 Estructura del Proyecto

```
aprende-jugando/
├── backend/
│   ├── database/
│   │   ├── SCHEMA_COMPLETO.sql      ← Script principal de instalación
│   │   └── ACTUALIZAR_PASSWORDS.sql ← Script para actualizar contraseñas
│   ├── src/
│   │   ├── controllers/             ← Controladores de la API
│   │   ├── routes/                  ← Rutas de la API
│   │   ├── middlewares/             ← Middlewares de autenticación
│   │   └── index.js                 ← Servidor principal
│   ├── .env                         ← Configuración del backend
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/                   ← Páginas de la aplicación
│   │   ├── components/              ← Componentes reutilizables
│   │   └── services/                ← Servicios de API
│   ├── .env                         ← Configuración del frontend
│   └── package.json
└── README_INSTALACION.md            ← Este archivo
```

---

## 📚 Recursos Adicionales

### Documentación de la API
Una vez que el backend esté corriendo, accede a:
**http://localhost:4000/**

### Paneles Disponibles
- **Admin:** `/admin/dashboard`
- **Game Master:** `/gm/inicio`
- **Estudiante:** `/estudiante/inicio`

---

## 🔒 Notas de Seguridad

**⚠️ IMPORTANTE:**
- Las contraseñas de prueba (`password123`) son SOLO para desarrollo
- Cambia el `JWT_SECRET` en producción
- Nunca subas el archivo `.env` a repositorios públicos
- Crea contraseñas seguras para usuarios reales

---

## 💡 Consejos

- **Usa MySQL Workbench** para gestionar la base de datos visualmente
- **Mantén el backend y frontend corriendo** en terminales separadas
- **Limpia localStorage** si tienes problemas de autenticación (F12 → Application → Clear)
- **Revisa las consolas** del navegador y del backend para errores
- **Usa Ctrl + C** para detener los servidores

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa la sección "Solución de Problemas Comunes"
2. Verifica el checklist de verificación
3. Consulta los logs del backend y del navegador

---

**¡Todo listo! Ahora puedes comenzar a usar Aprende Jugando.** 🎮📚
