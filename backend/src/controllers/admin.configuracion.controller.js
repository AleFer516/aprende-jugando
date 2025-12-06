const pool = require('../db');
const { registrarActividad } = require('../utils/actividadLogger');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');

// Convertir exec a promesa
const execPromise = util.promisify(exec);

// Obtener configuración general
const getConfiguracion = async (req, res) => {
  try {
    const [config] = await pool.query(`
      SELECT
        nombre_sistema,
        tema,
        tiempo_inactividad,
        zona_horaria,
        logo_url,
        politicas_password,
        autenticacion,
        respaldo_automatico,
        frecuencia_respaldo,
        ultimo_respaldo,
        tamano_backup
      FROM configuracion_sistema
      WHERE id = 1
    `);

    if (config.length === 0) {
      // Si no existe configuración, crear una por defecto
      await pool.query(`
        INSERT INTO configuracion_sistema
        (nombre_sistema, tema, tiempo_inactividad, zona_horaria, politicas_password, autenticacion)
        VALUES ('Luminia', 'claro', 15, 'GMT-3 Santiago', '{}', '{}')
      `);

      return res.json({
        success: true,
        data: {
          nombreSistema: 'Luminia',
          tema: 'claro',
          tiempoInactividad: 15,
          zonaHoraria: 'GMT-3 Santiago',
          logoUrl: null,
          politicasPassword: {
            minChars: true,
            mayusculas: true,
            numeros: true,
            simbolos: true,
            expiracion: 90
          },
          autenticacion: {
            twoFactor: true,
            maxIntentos: 5
          },
          respaldoAutomatico: true,
          ultimoRespaldo: 'Nunca',
          tamanoBackup: '0 MB'
        }
      });
    }

    const configData = config[0];

    // Manejar campos JSON (pueden venir como objetos o strings dependiendo del driver)
    let politicasPassword = {
      minChars: true,
      mayusculas: true,
      numeros: true,
      simbolos: true,
      expiracion: 90
    };

    let autenticacion = {
      twoFactor: true,
      maxIntentos: 5
    };

    // Si politicas_password ya es un objeto, usarlo directamente
    if (configData.politicas_password) {
      if (typeof configData.politicas_password === 'string') {
        politicasPassword = JSON.parse(configData.politicas_password);
      } else {
        politicasPassword = configData.politicas_password;
      }
    }

    // Si autenticacion ya es un objeto, usarlo directamente
    if (configData.autenticacion) {
      if (typeof configData.autenticacion === 'string') {
        autenticacion = JSON.parse(configData.autenticacion);
      } else {
        autenticacion = configData.autenticacion;
      }
    }

    res.json({
      success: true,
      data: {
        nombreSistema: configData.nombre_sistema,
        tema: configData.tema,
        tiempoInactividad: configData.tiempo_inactividad,
        zonaHoraria: configData.zona_horaria,
        logoUrl: configData.logo_url,
        politicasPassword: politicasPassword,
        autenticacion: autenticacion,
        respaldoAutomatico: configData.respaldo_automatico,
        frecuenciaRespaldo: configData.frecuencia_respaldo || 'diaria',
        ultimoRespaldo: configData.ultimo_respaldo || 'Nunca',
        tamanoBackup: configData.tamano_backup || '0 MB'
      }
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración',
      error: error.message
    });
  }
};

// Actualizar configuración general
const actualizarConfiguracion = async (req, res) => {
  try {
    const {
      nombreSistema,
      tema,
      tiempoInactividad,
      zonaHoraria
    } = req.body;

    await pool.query(`
      UPDATE configuracion_sistema
      SET
        nombre_sistema = ?,
        tema = ?,
        tiempo_inactividad = ?,
        zona_horaria = ?
      WHERE id = 1
    `, [nombreSistema, tema, tiempoInactividad, zonaHoraria]);

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Admin';
    await registrarActividad(
      `Configuración general actualizada: ${nombreSistema}`,
      usuario,
      'configuracion'
    );

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración',
      error: error.message
    });
  }
};

// Actualizar políticas de contraseña
const actualizarPoliticasPassword = async (req, res) => {
  try {
    const { politicasPassword } = req.body;

    await pool.query(`
      UPDATE configuracion_sistema
      SET politicas_password = ?
      WHERE id = 1
    `, [JSON.stringify(politicasPassword)]);

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Admin';
    await registrarActividad(
      'Políticas de contraseña actualizadas',
      usuario,
      'configuracion'
    );

    res.json({
      success: true,
      message: 'Políticas de contraseña actualizadas exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar políticas de contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar políticas de contraseña',
      error: error.message
    });
  }
};

// Actualizar configuración de autenticación
const actualizarAutenticacion = async (req, res) => {
  try {
    const { autenticacion } = req.body;

    await pool.query(`
      UPDATE configuracion_sistema
      SET autenticacion = ?
      WHERE id = 1
    `, [JSON.stringify(autenticacion)]);

    res.json({
      success: true,
      message: 'Configuración de autenticación actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar autenticación',
      error: error.message
    });
  }
};

// Generar respaldo de base de datos
const generarRespaldo = async (req, res) => {
  try {
    console.log('🔵 Iniciando generación de respaldo...');

    // Crear nombre de archivo con fecha y hora
    const fecha = new Date();
    const nombreArchivo = `backup_${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}_${String(fecha.getHours()).padStart(2, '0')}-${String(fecha.getMinutes()).padStart(2, '0')}-${String(fecha.getSeconds()).padStart(2, '0')}.sql`;

    // Ruta del directorio de backups
    const dirBackups = path.join(__dirname, '../../backups');
    const rutaBackup = path.join(dirBackups, nombreArchivo);

    console.log('📁 Ruta del backup:', rutaBackup);

    // Asegurar que existe el directorio
    if (!fs.existsSync(dirBackups)) {
      console.log('📂 Creando directorio de backups...');
      fs.mkdirSync(dirBackups, { recursive: true });
    }

    // Obtener credenciales de la base de datos desde variables de entorno
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'aprende_jugando';
    const dbPort = process.env.DB_PORT || '3306';

    console.log('🔑 Configuración DB:', { dbHost, dbUser, dbName, dbPort });

    // Construir comando mysqldump
    // Nota: En Windows, mysqldump debe estar en el PATH o usar ruta completa
    // Intentar encontrar mysqldump en rutas comunes si no está en PATH
    let mysqldumpPath = 'mysqldump';

    // Rutas comunes de MySQL/MariaDB en Windows
    // Intentar primero con MySQL de WAMP antes que MariaDB para evitar problemas de plugins
    const rutasComunes = [
      'D:\\wamp64\\bin\\mysql\\mysql8.0.27\\bin\\mysqldump.exe',
      'D:\\wamp64\\bin\\mysql\\mysql8.3.0\\bin\\mysqldump.exe',
      'D:\\wamp64\\bin\\mysql\\mysql5.7.36\\bin\\mysqldump.exe',
      'C:\\wamp64\\bin\\mysql\\mysql8.0.27\\bin\\mysqldump.exe',
      'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
      'C:\\Program Files\\MySQL\\MySQL Server 5.7\\bin\\mysqldump.exe',
      'D:\\wamp64\\bin\\mariadb\\mariadb11.3.2\\bin\\mysqldump.exe',
      'C:\\xampp\\mysql\\bin\\mysqldump.exe'
    ];

    // Intentar encontrar mysqldump en rutas comunes
    for (const ruta of rutasComunes) {
      if (fs.existsSync(ruta)) {
        mysqldumpPath = `"${ruta}"`;
        console.log(`✅ mysqldump encontrado en: ${ruta}`);
        break;
      }
    }

    let comando;
    if (dbPassword) {
      comando = `${mysqldumpPath} --default-auth=mysql_native_password -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPassword} ${dbName} > "${rutaBackup}"`;
    } else {
      comando = `${mysqldumpPath} --default-auth=mysql_native_password -h ${dbHost} -P ${dbPort} -u ${dbUser} ${dbName} > "${rutaBackup}"`;
    }

    console.log('⚙️ Ejecutando mysqldump...');

    // Ejecutar mysqldump
    await execPromise(comando);

    console.log('✅ Backup generado exitosamente');

    // Verificar que el archivo se creó y obtener su tamaño
    if (!fs.existsSync(rutaBackup)) {
      throw new Error('El archivo de respaldo no se generó correctamente');
    }

    const stats = fs.statSync(rutaBackup);
    const tamanoMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`📊 Tamaño del backup: ${tamanoMB} MB`);

    // Actualizar configuración en la base de datos
    await pool.query(`
      UPDATE configuracion_sistema
      SET ultimo_respaldo = NOW(),
          tamano_backup = ?
      WHERE id = 1
    `, [`${tamanoMB} MB`]);

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Admin';
    await registrarActividad(
      `Respaldo de base de datos generado: ${nombreArchivo} (${tamanoMB} MB)`,
      usuario,
      'sistema'
    );

    // Limpiar backups antiguos (mantener solo los últimos 10)
    const archivos = fs.readdirSync(dirBackups)
      .filter(file => file.endsWith('.sql'))
      .map(file => ({
        nombre: file,
        ruta: path.join(dirBackups, file),
        fecha: fs.statSync(path.join(dirBackups, file)).mtime
      }))
      .sort((a, b) => b.fecha - a.fecha);

    // Eliminar backups antiguos si hay más de 10
    if (archivos.length > 10) {
      const porEliminar = archivos.slice(10);
      porEliminar.forEach(archivo => {
        fs.unlinkSync(archivo.ruta);
        console.log(`🗑️ Backup antiguo eliminado: ${archivo.nombre}`);
      });
    }

    res.json({
      success: true,
      message: 'Respaldo generado exitosamente',
      nombreArchivo,
      tamano: `${tamanoMB} MB`
    });
  } catch (error) {
    console.error('❌ Error al generar respaldo:', error);

    // Mensaje de error más específico
    let mensaje = 'Error al generar respaldo';
    if (error.message.includes('mysqldump')) {
      mensaje = 'Error: mysqldump no encontrado. Asegúrate de que MySQL esté instalado y en el PATH del sistema.';
    } else if (error.message.includes('Access denied')) {
      mensaje = 'Error: Credenciales de base de datos incorrectas.';
    }

    res.status(500).json({
      success: false,
      message: mensaje,
      error: error.message
    });
  }
};

// Actualizar configuración de respaldo automático
const actualizarRespaldoAutomatico = async (req, res) => {
  try {
    const { respaldoAutomatico, frecuenciaRespaldo } = req.body;

    // Construir query dinámicamente según los campos recibidos
    let query = 'UPDATE configuracion_sistema SET ';
    const params = [];
    const updates = [];

    if (respaldoAutomatico !== undefined) {
      updates.push('respaldo_automatico = ?');
      params.push(respaldoAutomatico);
    }

    if (frecuenciaRespaldo !== undefined) {
      updates.push('frecuencia_respaldo = ?');
      params.push(frecuenciaRespaldo);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron datos para actualizar'
      });
    }

    query += updates.join(', ') + ' WHERE id = 1';
    await pool.query(query, params);

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Admin';
    await registrarActividad(
      `Configuración de respaldo actualizada: ${respaldoAutomatico ? 'activado' : 'desactivado'}${frecuenciaRespaldo ? `, frecuencia: ${frecuenciaRespaldo}` : ''}`,
      usuario,
      'configuracion'
    );

    res.json({
      success: true,
      message: 'Configuración de respaldo actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar respaldo automático:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar respaldo automático',
      error: error.message
    });
  }
};

// Subir logo del sistema
const subirLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    // Construir la URL del logo
    const logoUrl = `/uploads/logos/${req.file.filename}`;

    // Actualizar en la base de datos
    await pool.query(`
      UPDATE configuracion_sistema
      SET logo_url = ?
      WHERE id = 1
    `, [logoUrl]);

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Admin';
    await registrarActividad(
      'Logo del sistema actualizado',
      usuario,
      'configuracion'
    );

    res.json({
      success: true,
      message: 'Logo actualizado exitosamente',
      logoUrl: logoUrl
    });
  } catch (error) {
    console.error('Error al subir logo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir logo',
      error: error.message
    });
  }
};

// Obtener todos los roles del sistema
const getRoles = async (req, res) => {
  try {
    const [roles] = await pool.query(`
      SELECT
        id,
        nombre,
        descripcion,
        tipo,
        activo,
        permisos,
        created_at
      FROM roles_sistema
      ORDER BY
        CASE
          WHEN tipo = 'Sistema' THEN 1
          ELSE 2
        END,
        nombre ASC
    `);

    // Parsear permisos JSON si vienen como string
    const rolesFormateados = roles.map(rol => ({
      ...rol,
      permisos: typeof rol.permisos === 'string' ? JSON.parse(rol.permisos) : rol.permisos
    }));

    res.json({
      success: true,
      data: rolesFormateados
    });
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener roles',
      error: error.message
    });
  }
};

// Crear un nuevo rol
const crearRol = async (req, res) => {
  try {
    const { nombre, descripcion, tipo, permisos } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del rol es obligatorio'
      });
    }

    // Verificar si el rol ya existe
    const [existente] = await pool.query(
      'SELECT id FROM roles_sistema WHERE nombre = ?',
      [nombre.trim()]
    );

    if (existente.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un rol con ese nombre'
      });
    }

    // Insertar el nuevo rol
    const [result] = await pool.query(`
      INSERT INTO roles_sistema
        (nombre, descripcion, tipo, permisos, activo)
      VALUES (?, ?, ?, ?, true)
    `, [
      nombre.trim(),
      descripcion || '',
      tipo || 'Personalizado',
      JSON.stringify(permisos || {
        gestionarUsuarios: false,
        gestionarMisiones: false,
        verReportes: false
      })
    ]);

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Admin';
    await registrarActividad(
      `Nuevo rol creado: ${nombre.trim()}`,
      usuario,
      'configuracion'
    );

    res.json({
      success: true,
      message: 'Rol creado exitosamente',
      data: {
        id: result.insertId,
        nombre: nombre.trim(),
        descripcion: descripcion || '',
        tipo: tipo || 'Personalizado',
        permisos: permisos || {
          gestionarUsuarios: false,
          gestionarMisiones: false,
          verReportes: false
        },
        activo: true
      }
    });
  } catch (error) {
    console.error('Error al crear rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear rol',
      error: error.message
    });
  }
};

// Actualizar estado activo/inactivo de un rol
const toggleRol = async (req, res) => {
  try {
    const { nombre } = req.params;
    const { activo } = req.body;

    // Verificar que no sea un rol del sistema
    const [rol] = await pool.query(
      'SELECT tipo FROM roles_sistema WHERE nombre = ?',
      [nombre]
    );

    if (rol.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    if (rol[0].tipo === 'Sistema') {
      return res.status(400).json({
        success: false,
        message: 'No se puede desactivar un rol del sistema'
      });
    }

    await pool.query(
      'UPDATE roles_sistema SET activo = ? WHERE nombre = ?',
      [activo, nombre]
    );

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Admin';
    await registrarActividad(
      `Rol ${nombre} ${activo ? 'activado' : 'desactivado'}`,
      usuario,
      'configuracion'
    );

    res.json({
      success: true,
      message: `Rol ${activo ? 'activado' : 'desactivado'} exitosamente`
    });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar rol',
      error: error.message
    });
  }
};

// Eliminar un rol personalizado
const eliminarRol = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que no sea un rol del sistema
    const [rol] = await pool.query(
      'SELECT tipo, nombre FROM roles_sistema WHERE id = ?',
      [id]
    );

    if (rol.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    if (rol[0].tipo === 'Sistema') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un rol del sistema'
      });
    }

    // Verificar si hay usuarios con este rol
    const [usuarios] = await pool.query(
      'SELECT COUNT(*) as total FROM usuarios WHERE rol = ?',
      [rol[0].nombre]
    );

    if (usuarios[0].total > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el rol porque hay ${usuarios[0].total} usuario(s) asignado(s)`
      });
    }

    await pool.query('DELETE FROM roles_sistema WHERE id = ?', [id]);

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Admin';
    await registrarActividad(
      `Rol eliminado: ${rol[0].nombre}`,
      usuario,
      'configuracion'
    );

    res.json({
      success: true,
      message: 'Rol eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar rol',
      error: error.message
    });
  }
};

// Ejecutar diagnóstico del sistema
const ejecutarDiagnostico = async (req, res) => {
  try {
    console.log('🔍 Iniciando diagnóstico del sistema...');

    const resultados = {
      baseDatos: { estado: 'ok', mensaje: '', detalles: [] },
      rendimiento: { estado: 'ok', mensaje: '', detalles: [] },
      mantenimiento: { estado: 'ok', mensaje: '', detalles: [] },
      seguridad: { estado: 'ok', mensaje: '', detalles: [] }
    };

    // 1. DIAGNÓSTICO DE BASE DE DATOS
    try {
      // Verificar conexión
      const [dbTest] = await pool.query('SELECT 1 as test');
      resultados.baseDatos.detalles.push({ tipo: 'ok', mensaje: 'Conexión a base de datos: OK' });

      // Tamaño de la base de datos
      const [dbSize] = await pool.query(`
        SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as tamano_mb
        FROM information_schema.TABLES
        WHERE table_schema = ?
      `, [process.env.DB_NAME || 'aprende_jugando']);

      const tamanoMB = dbSize[0].tamano_mb;
      resultados.baseDatos.detalles.push({
        tipo: tamanoMB > 500 ? 'warning' : 'ok',
        mensaje: `Tamaño de BD: ${tamanoMB} MB ${tamanoMB > 500 ? '(considerar optimización)' : ''}`
      });

      // Contar tablas
      const [tablas] = await pool.query(`
        SELECT COUNT(*) as total
        FROM information_schema.TABLES
        WHERE table_schema = ?
      `, [process.env.DB_NAME || 'aprende_jugando']);
      resultados.baseDatos.detalles.push({ tipo: 'ok', mensaje: `Tablas en la BD: ${tablas[0].total}` });

      resultados.baseDatos.mensaje = 'Base de datos operativa';
    } catch (error) {
      resultados.baseDatos.estado = 'error';
      resultados.baseDatos.mensaje = 'Error en conexión a base de datos';
      resultados.baseDatos.detalles.push({ tipo: 'error', mensaje: error.message });
    }

    // 2. DIAGNÓSTICO DE RENDIMIENTO
    try {
      // Contar usuarios totales
      const [usuarios] = await pool.query('SELECT COUNT(*) as total FROM usuarios');
      resultados.rendimiento.detalles.push({ tipo: 'ok', mensaje: `Usuarios totales: ${usuarios[0].total}` });

      // Usuarios activos (últimos 30 días)
      const [usuariosActivos] = await pool.query(`
        SELECT COUNT(*) as total
        FROM usuarios
        WHERE ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);
      const porcentajeActivos = ((usuariosActivos[0].total / usuarios[0].total) * 100).toFixed(1);
      resultados.rendimiento.detalles.push({
        tipo: porcentajeActivos > 20 ? 'ok' : 'warning',
        mensaje: `Usuarios activos (30d): ${usuariosActivos[0].total} (${porcentajeActivos}%)`
      });

      // Misiones totales
      const [misiones] = await pool.query('SELECT COUNT(*) as total FROM misiones');
      resultados.rendimiento.detalles.push({ tipo: 'ok', mensaje: `Misiones creadas: ${misiones[0].total}` });

      // Progreso de misiones
      const [progresoMisiones] = await pool.query(`
        SELECT COUNT(*) as total FROM estudiante_misiones WHERE progreso > 0
      `);
      resultados.rendimiento.detalles.push({ tipo: 'ok', mensaje: `Misiones en progreso: ${progresoMisiones[0].total}` });

      resultados.rendimiento.mensaje = 'Rendimiento del sistema óptimo';
    } catch (error) {
      resultados.rendimiento.estado = 'warning';
      resultados.rendimiento.mensaje = 'Error al analizar rendimiento';
      resultados.rendimiento.detalles.push({ tipo: 'error', mensaje: error.message });
    }

    // 3. DIAGNÓSTICO DE MANTENIMIENTO
    try {
      // Logs antiguos (más de 90 días)
      const [logsAntiguos] = await pool.query(`
        SELECT COUNT(*) as total
        FROM actividad_admin
        WHERE fecha < DATE_SUB(NOW(), INTERVAL 90 DAY)
      `);

      if (logsAntiguos[0].total > 0) {
        resultados.mantenimiento.estado = 'warning';
        resultados.mantenimiento.detalles.push({
          tipo: 'warning',
          mensaje: `${logsAntiguos[0].total} logs antiguos (>90 días) - Considerar limpieza`
        });
      } else {
        resultados.mantenimiento.detalles.push({ tipo: 'ok', mensaje: 'No hay logs antiguos que limpiar' });
      }

      // Cuentas inactivas (sin acceso en 6 meses)
      const [cuentasInactivas] = await pool.query(`
        SELECT COUNT(*) as total
        FROM usuarios
        WHERE ultimo_acceso < DATE_SUB(NOW(), INTERVAL 6 MONTH)
        OR ultimo_acceso IS NULL
      `);

      if (cuentasInactivas[0].total > 0) {
        resultados.mantenimiento.detalles.push({
          tipo: 'info',
          mensaje: `${cuentasInactivas[0].total} cuentas inactivas (>6 meses)`
        });
      } else {
        resultados.mantenimiento.detalles.push({ tipo: 'ok', mensaje: 'No hay cuentas inactivas' });
      }

      // Misiones sin actividad (creadas hace más de 1 año sin estudiantes)
      const [misionesInactivas] = await pool.query(`
        SELECT COUNT(*) as total
        FROM misiones m
        LEFT JOIN estudiante_misiones em ON m.id = em.mision_id
        WHERE m.created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR)
        AND em.id IS NULL
      `);

      if (misionesInactivas[0].total > 0) {
        resultados.mantenimiento.detalles.push({
          tipo: 'info',
          mensaje: `${misionesInactivas[0].total} misiones sin uso (>1 año)`
        });
      } else {
        resultados.mantenimiento.detalles.push({ tipo: 'ok', mensaje: 'No hay misiones inactivas' });
      }

      if (resultados.mantenimiento.estado === 'ok') {
        resultados.mantenimiento.mensaje = 'Sistema limpio y optimizado';
      } else {
        resultados.mantenimiento.mensaje = 'Se recomienda mantenimiento';
      }
    } catch (error) {
      resultados.mantenimiento.estado = 'warning';
      resultados.mantenimiento.mensaje = 'Error al analizar mantenimiento';
      resultados.mantenimiento.detalles.push({ tipo: 'error', mensaje: error.message });
    }

    // 4. DIAGNÓSTICO DE SEGURIDAD Y RESPALDOS
    try {
      // Verificar último respaldo
      const [configRespaldo] = await pool.query(`
        SELECT ultimo_respaldo, respaldo_automatico, frecuencia_respaldo
        FROM configuracion_sistema
        WHERE id = 1
      `);

      if (configRespaldo[0] && configRespaldo[0].ultimo_respaldo) {
        const diasDesdeRespaldo = Math.floor((new Date() - new Date(configRespaldo[0].ultimo_respaldo)) / (1000 * 60 * 60 * 24));

        if (diasDesdeRespaldo > 7) {
          resultados.seguridad.estado = 'warning';
          resultados.seguridad.detalles.push({
            tipo: 'warning',
            mensaje: `Último respaldo hace ${diasDesdeRespaldo} días - Generar nuevo respaldo`
          });
        } else {
          resultados.seguridad.detalles.push({
            tipo: 'ok',
            mensaje: `Último respaldo hace ${diasDesdeRespaldo} día(s)`
          });
        }

        if (configRespaldo[0].respaldo_automatico) {
          resultados.seguridad.detalles.push({
            tipo: 'ok',
            mensaje: `Respaldo automático: Activo (${configRespaldo[0].frecuencia_respaldo})`
          });
        } else {
          resultados.seguridad.estado = 'warning';
          resultados.seguridad.detalles.push({
            tipo: 'warning',
            mensaje: 'Respaldo automático: Desactivado'
          });
        }
      } else {
        resultados.seguridad.estado = 'error';
        resultados.seguridad.detalles.push({ tipo: 'error', mensaje: 'No se ha generado ningún respaldo' });
      }

      // Contar admins
      const [admins] = await pool.query(`
        SELECT COUNT(*) as total FROM usuarios WHERE rol = 'admin'
      `);
      resultados.seguridad.detalles.push({
        tipo: admins[0].total > 0 ? 'ok' : 'error',
        mensaje: `Administradores: ${admins[0].total}`
      });

      if (resultados.seguridad.estado === 'ok') {
        resultados.seguridad.mensaje = 'Seguridad y respaldos configurados correctamente';
      } else if (resultados.seguridad.estado === 'warning') {
        resultados.seguridad.mensaje = 'Advertencias de seguridad detectadas';
      } else {
        resultados.seguridad.mensaje = 'Problemas críticos de seguridad';
      }
    } catch (error) {
      resultados.seguridad.estado = 'error';
      resultados.seguridad.mensaje = 'Error al verificar seguridad';
      resultados.seguridad.detalles.push({ tipo: 'error', mensaje: error.message });
    }

    // Determinar estado general
    let estadoGeneral = 'ok';
    if (Object.values(resultados).some(r => r.estado === 'error')) {
      estadoGeneral = 'error';
    } else if (Object.values(resultados).some(r => r.estado === 'warning')) {
      estadoGeneral = 'warning';
    }

    // Registrar actividad
    const usuario = req.usuario ? req.usuario.nombre : 'Admin';
    await registrarActividad(
      `Diagnóstico del sistema ejecutado - Estado: ${estadoGeneral}`,
      usuario,
      'sistema'
    );

    console.log('✅ Diagnóstico completado');

    res.json({
      success: true,
      estadoGeneral,
      resultados
    });
  } catch (error) {
    console.error('❌ Error al ejecutar diagnóstico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al ejecutar diagnóstico del sistema',
      error: error.message
    });
  }
};

module.exports = {
  getConfiguracion,
  actualizarConfiguracion,
  actualizarPoliticasPassword,
  actualizarAutenticacion,
  generarRespaldo,
  actualizarRespaldoAutomatico,
  ejecutarDiagnostico,
  subirLogo,
  getRoles,
  crearRol,
  toggleRol,
  eliminarRol
};
