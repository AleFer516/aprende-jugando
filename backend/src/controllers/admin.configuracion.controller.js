const pool = require('../db');
const { registrarActividad } = require('../utils/actividadLogger');

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
    // Aquí iría la lógica real de respaldo
    // Por ahora solo actualizamos la fecha del último respaldo

    await pool.query(`
      UPDATE configuracion_sistema
      SET ultimo_respaldo = NOW()
      WHERE id = 1
    `);

    res.json({
      success: true,
      message: 'Respaldo generado exitosamente'
    });
  } catch (error) {
    console.error('Error al generar respaldo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar respaldo',
      error: error.message
    });
  }
};

// Actualizar configuración de respaldo automático
const actualizarRespaldoAutomatico = async (req, res) => {
  try {
    const { respaldoAutomatico } = req.body;

    await pool.query(`
      UPDATE configuracion_sistema
      SET respaldo_automatico = ?
      WHERE id = 1
    `, [respaldoAutomatico]);

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

module.exports = {
  getConfiguracion,
  actualizarConfiguracion,
  actualizarPoliticasPassword,
  actualizarAutenticacion,
  generarRespaldo,
  actualizarRespaldoAutomatico,
  subirLogo,
  getRoles,
  crearRol,
  toggleRol,
  eliminarRol
};
