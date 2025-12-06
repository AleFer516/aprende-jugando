import api from './api';

const adminService = {
  // ============ DASHBOARD ============

  // Obtener estadísticas del dashboard
  getEstadisticasDashboard: async () => {
    const response = await api.get('/admin/dashboard/estadisticas');
    return response.data;
  },

  // Obtener registro de actividad
  getRegistroActividad: async (limit = 10) => {
    const response = await api.get(`/admin/dashboard/actividad?limit=${limit}`);
    return response.data;
  },

  // Obtener estado del sistema
  getEstadoSistema: async () => {
    const response = await api.get('/admin/dashboard/estado-sistema');
    return response.data;
  },

  // ============ ESTADÍSTICAS GLOBALES ============

  // Obtener estadísticas globales
  getEstadisticasGlobales: async () => {
    const response = await api.get('/admin/estadisticas');
    return response.data;
  },

  // ============ USUARIOS ============

  // Obtener usuarios con filtros
  getUsuarios: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.rol) params.append('rol', filtros.rol);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);

    const response = await api.get(`/admin/usuarios?${params.toString()}`);
    return response.data;
  },

  // Crear usuario
  crearUsuario: async (datosUsuario) => {
    const response = await api.post('/admin/usuarios', datosUsuario);
    return response.data;
  },

  // Actualizar usuario
  actualizarUsuario: async (rut, datosUsuario) => {
    const response = await api.put(`/admin/usuarios/${rut}`, datosUsuario);
    return response.data;
  },

  // Eliminar usuario
  eliminarUsuario: async (rut) => {
    const response = await api.delete(`/admin/usuarios/${rut}`);
    return response.data;
  },

  // ============ CONFIGURACIÓN ============

  // Obtener configuración
  getConfiguracion: async () => {
    const response = await api.get('/admin/configuracion');
    return response.data;
  },

  // Actualizar configuración general
  actualizarConfiguracionGeneral: async (configuracion) => {
    const response = await api.put('/admin/configuracion/general', configuracion);
    return response.data;
  },

  // Actualizar políticas de contraseña
  actualizarPoliticasPassword: async (politicas) => {
    const response = await api.put('/admin/configuracion/politicas-password', {
      politicasPassword: politicas
    });
    return response.data;
  },

  // Actualizar configuración de autenticación
  actualizarAutenticacion: async (autenticacion) => {
    const response = await api.put('/admin/configuracion/autenticacion', {
      autenticacion
    });
    return response.data;
  },

  // Generar respaldo
  generarRespaldo: async () => {
    const response = await api.post('/admin/configuracion/respaldo');
    return response.data;
  },

  // Actualizar respaldo automático
  actualizarRespaldoAutomatico: async (respaldoAutomatico, frecuenciaRespaldo = null) => {
    const data = { respaldoAutomatico };
    if (frecuenciaRespaldo) {
      data.frecuenciaRespaldo = frecuenciaRespaldo;
    }
    const response = await api.put('/admin/configuracion/respaldo-automatico', data);
    return response.data;
  },

  // Ejecutar diagnóstico del sistema
  ejecutarDiagnostico: async () => {
    const response = await api.post('/admin/configuracion/diagnostico');
    return response.data;
  },

  // ============ PERFIL ============

  // Obtener perfil
  getPerfil: async () => {
    const response = await api.get('/admin/perfil');
    return response.data;
  },

  // Actualizar perfil
  actualizarPerfil: async (datosPerfil) => {
    const response = await api.put('/admin/perfil', datosPerfil);
    return response.data;
  },

  // Cambiar contraseña
  cambiarPassword: async (passwordActual, passwordNuevo) => {
    const response = await api.put('/admin/perfil/password', {
      passwordActual,
      passwordNuevo
    });
    return response.data;
  },

  // Subir avatar
  subirAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/admin/perfil/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Subir logo del sistema
  subirLogoSistema: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await api.post('/admin/configuracion/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // ============ ROLES ============

  // Obtener todos los roles
  getRoles: async () => {
    const response = await api.get('/admin/configuracion/roles');
    return response.data;
  },

  // Crear nuevo rol
  crearRol: async (datosRol) => {
    const response = await api.post('/admin/configuracion/roles', datosRol);
    return response.data;
  },

  // Activar/desactivar rol
  toggleRol: async (nombre, activo) => {
    const response = await api.put(`/admin/configuracion/roles/${nombre}/toggle`, {
      activo
    });
    return response.data;
  },

  // Eliminar rol
  eliminarRol: async (id) => {
    const response = await api.delete(`/admin/configuracion/roles/${id}`);
    return response.data;
  }
};

export default adminService;
