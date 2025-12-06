# Sistema de Respaldo de Base de Datos

Este directorio contiene los respaldos automáticos y manuales de la base de datos MySQL.

## 📋 Funcionalidades

### 1. Respaldo Manual
- Accede al panel de Admin → Configuración → Bases de datos
- Haz clic en "Generar respaldo ahora"
- El sistema generará un archivo `.sql` con toda la base de datos
- El archivo se nombrará con fecha y hora: `backup_YYYY-MM-DD_HH-MM-SS.sql`

### 2. Respaldo Automático
- Activa/desactiva el respaldo automático desde el panel de configuración
- Selecciona la frecuencia deseada:
  - **Diaria**: Se ejecuta cada día
  - **Semanal**: Se ejecuta cada semana
  - **Mensual**: Se ejecuta cada mes

### 3. Gestión Automática
- El sistema mantiene automáticamente los últimos **10 respaldos**
- Los respaldos antiguos se eliminan automáticamente
- Cada respaldo se registra en el log de actividad del sistema

## 🔧 Requisitos Técnicos

### Windows
- MySQL debe estar instalado
- `mysqldump.exe` debe estar en el PATH del sistema
- Ruta típica: `C:\Program Files\MySQL\MySQL Server X.X\bin\`

#### Cómo instalar/configurar mysqldump en Windows:

**Opción 1: Instalar MySQL Server completo (Recomendado)**
1. Descarga MySQL Community Server desde: https://dev.mysql.com/downloads/mysql/
2. Ejecuta el instalador MySQL Installer
3. Selecciona "MySQL Server" en la instalación
4. Durante la instalación, asegúrate de marcar "Add MySQL to PATH"
5. Una vez instalado, `mysqldump.exe` estará disponible automáticamente

**Opción 2: Agregar MySQL al PATH manualmente**
Si ya tienes MySQL instalado pero `mysqldump` no se encuentra:

1. Localiza la carpeta de instalación de MySQL:
   - Ruta común: `C:\Program Files\MySQL\MySQL Server 8.0\bin\`
   - O busca `mysqldump.exe` en el explorador de archivos

2. Agrega MySQL al PATH del sistema:
   - Presiona `Windows + R` y escribe `sysdm.cpl`
   - Ve a la pestaña "Opciones avanzadas"
   - Haz clic en "Variables de entorno"
   - En "Variables del sistema", busca y selecciona `Path`
   - Haz clic en "Editar"
   - Haz clic en "Nuevo" y pega la ruta: `C:\Program Files\MySQL\MySQL Server 8.0\bin\`
   - Haz clic en "Aceptar" en todas las ventanas

3. Verifica la instalación:
   - Abre una nueva terminal (CMD o PowerShell)
   - Ejecuta: `mysqldump --version`
   - Deberías ver la versión de mysqldump

**Opción 3: Instalar solo las herramientas de línea de comandos**
1. Descarga MySQL Shell desde: https://dev.mysql.com/downloads/shell/
2. Instala únicamente las herramientas CLI
3. Agrega la ruta al PATH siguiendo los pasos de la Opción 2

### Linux/Mac
- MySQL o MariaDB instalado
- `mysqldump` disponible en el sistema

#### Cómo instalar mysqldump en Linux:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-client
# Verificar instalación
mysqldump --version
```

**CentOS/RHEL/Fedora:**
```bash
sudo yum install mysql
# o en versiones más recientes
sudo dnf install mysql
# Verificar instalación
mysqldump --version
```

#### Cómo instalar mysqldump en macOS:

**Usando Homebrew:**
```bash
brew install mysql-client
# Agregar al PATH
echo 'export PATH="/usr/local/opt/mysql-client/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
# Verificar instalación
mysqldump --version
```

## 📝 Estructura de Archivos

```
backups/
├── .gitignore                    # Ignora archivos .sql en git
├── README.md                     # Este archivo
├── backup_2025-12-06_14-30-00.sql
├── backup_2025-12-06_15-45-00.sql
└── ...
```

## 🔄 Restaurar un Respaldo

### Desde Línea de Comandos:

**Windows:**
```bash
mysql -u root -p aprende_jugando < backup_2025-12-06_14-30-00.sql
```

**Linux/Mac:**
```bash
mysql -u root -p aprende_jugando < backup_2025-12-06_14-30-00.sql
```

### Desde MySQL Workbench:
1. Abre MySQL Workbench
2. Server → Data Import
3. Selecciona "Import from Self-Contained File"
4. Elige el archivo de respaldo
5. Selecciona la base de datos destino
6. Haz clic en "Start Import"

## ⚠️ Consideraciones Importantes

1. **Seguridad**: Los archivos de respaldo contienen TODA la información de la base de datos, incluidas contraseñas hasheadas. Mantén estos archivos seguros.

2. **Espacio en Disco**: Los respaldos ocupan espacio. El sistema mantiene solo los últimos 10 para evitar llenar el disco.

3. **Tiempo de Ejecución**: Para bases de datos grandes, el proceso puede tardar varios minutos.

4. **Variables de Entorno**: El sistema usa las credenciales del archivo `.env`:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_PORT`

## 🔄 Portabilidad entre Entornos

El sistema **detecta automáticamente** la ubicación de `mysqldump` en diferentes entornos. No necesitas hacer cambios al mover el proyecto a otro servidor local.

### Rutas que el sistema busca automáticamente:

El código busca `mysqldump.exe` en el siguiente orden de prioridad:

1. **WAMP/MySQL** (Windows):
   - `D:\wamp64\bin\mysql\mysql8.0.27\bin\mysqldump.exe`
   - `D:\wamp64\bin\mysql\mysql8.3.0\bin\mysqldump.exe`
   - `C:\wamp64\bin\mysql\mysql8.0.27\bin\mysqldump.exe`

2. **MySQL Server** (Instalación estándar):
   - `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe`
   - `C:\Program Files\MySQL\MySQL Server 5.7\bin\mysqldump.exe`

3. **WAMP/MariaDB** (Windows):
   - `D:\wamp64\bin\mariadb\mariadb11.3.2\bin\mysqldump.exe`

4. **XAMPP** (Windows):
   - `C:\xampp\mysql\bin\mysqldump.exe`

5. **PATH del sistema**: Si ninguna ruta anterior funciona, intenta usar `mysqldump` del PATH

### ¿Qué hacer si tu ruta es diferente?

Si tu instalación de MySQL/MariaDB está en una ubicación diferente:

**Opción 1: Agregar al PATH** (Recomendado)
- Sigue las instrucciones de "Opción 2: Agregar MySQL al PATH manualmente" arriba
- El sistema lo detectará automáticamente

**Opción 2: Agregar tu ruta al código**
Si necesitas una ruta personalizada permanente:

1. Abre el archivo: `backend/src/controllers/admin.configuracion.controller.js`
2. Busca la sección `const rutasComunes = [`
3. Agrega tu ruta al inicio del array:
   ```javascript
   const rutasComunes = [
     'TU_RUTA_PERSONALIZADA\\bin\\mysqldump.exe',  // Tu ruta aquí
     'D:\\wamp64\\bin\\mysql\\mysql8.0.27\\bin\\mysqldump.exe',
     // ... resto de rutas
   ];
   ```
4. Guarda y reinicia el servidor

**Ejemplo con ruta personalizada:**
```javascript
const rutasComunes = [
  'E:\\ServidorWeb\\mysql\\bin\\mysqldump.exe',  // Ruta personalizada
  'D:\\wamp64\\bin\\mysql\\mysql8.0.27\\bin\\mysqldump.exe',
  // ... resto
];
```

### Compatibilidad MySQL vs MariaDB

El sistema usa el parámetro `--default-auth=mysql_native_password` para garantizar compatibilidad entre:
- MySQL 5.7, 8.0, 8.3+
- MariaDB 10.x, 11.x
- Entornos mixtos (WAMP con MySQL o MariaDB)

## 🚨 Solución de Problemas

### Error: "mysqldump no encontrado"
**Causas posibles**:
1. MySQL/MariaDB no está instalado
2. La ruta de instalación no está en las rutas predefinidas
3. No está en el PATH del sistema

**Solución**:
1. Verifica que MySQL esté instalado
2. Agrega la ruta al PATH (ver "Opción 2" arriba)
3. O agrega tu ruta personalizada al código (ver "Opción 2: Agregar tu ruta al código")

### Error: "Plugin caching_sha2_password could not be loaded"
**Causa**: Incompatibilidad entre versiones de MySQL/MariaDB

**Solución**: El sistema ya incluye el parámetro `--default-auth=mysql_native_password`. Si persiste, ejecuta en MySQL:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'tu_password';
FLUSH PRIVILEGES;
```

### Error: "Access denied"
**Solución**: Verifica las credenciales en el archivo `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=aprende_jugando
DB_PORT=3306
```

### El respaldo está vacío (0 KB)
**Solución**: Verifica que el usuario de MySQL tenga permisos de lectura en la base de datos:
```sql
GRANT SELECT ON aprende_jugando.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## 📊 Información del Sistema

El panel de configuración muestra:
- **Último respaldo**: Fecha y hora del último respaldo generado
- **Tamaño actual**: Tamaño del último archivo de respaldo
- **Estado**: Si el respaldo automático está activado o desactivado
- **Frecuencia**: Cada cuánto se ejecutan los respaldos automáticos

---

**Nota**: Este directorio está ignorado en `.gitignore` para evitar subir datos sensibles al repositorio.
