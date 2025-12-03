import api from './api';

const estudianteService = {
  // Dashboard
  getDashboard: async () => {
    const response = await api.get('/estudiante/dashboard');
    return response.data;
  },

  // Misiones
  getMisiones: async (params = {}) => {
    let url = '/estudiante/misiones';
    const queryParams = new URLSearchParams();
    if (params.curso) queryParams.append('curso', params.curso);
    if (params.busqueda) queryParams.append('busqueda', params.busqueda);
    if (queryParams.toString()) url += `?${queryParams.toString()}`;

    const response = await api.get(url);
    return response.data;
  },

  getMisionDetalle: async (misionId) => {
    const response = await api.get(`/estudiante/misiones/${misionId}`);
    return response.data;
  },

  iniciarMision: async (misionId) => {
    const response = await api.post(`/estudiante/misiones/${misionId}/iniciar`);
    return response.data;
  },

  getActividades: async (misionId) => {
    const response = await api.get(`/estudiante/misiones/${misionId}/actividades`);
    return response.data;
  },

  responderActividad: async (actividadId, respuesta) => {
    const response = await api.post(`/estudiante/misiones/actividades/${actividadId}/responder`, {
      respuesta
    });
    return response.data;
  },

  // Progreso
  getProgreso: async () => {
    const response = await api.get('/estudiante/progreso');
    return response.data;
  },

  getRanking: async () => {
    const response = await api.get('/estudiante/progreso/ranking');
    return response.data;
  },

  // Logros
  getLogros: async () => {
    const response = await api.get('/estudiante/logros');
    return response.data;
  },

  verificarLogros: async () => {
    const response = await api.post('/estudiante/logros/verificar');
    return response.data;
  },

  // Personaje
  getPersonaje: async () => {
    const response = await api.get('/estudiante/personaje');
    return response.data;
  },

  actualizarPersonaje: async (personalizaciones) => {
    const response = await api.put('/estudiante/personaje', personalizaciones);
    return response.data;
  },

  // Perfil
  getPerfil: async () => {
    const response = await api.get('/estudiante/perfil');
    return response.data;
  },

  actualizarPerfil: async (datos) => {
    const response = await api.put('/estudiante/perfil', datos);
    return response.data;
  },

  getConfiguracion: async () => {
    const response = await api.get('/estudiante/perfil/configuracion');
    return response.data;
  },

  actualizarConfiguracion: async (configuracion) => {
    const response = await api.put('/estudiante/perfil/configuracion', configuracion);
    return response.data;
  },

  cambiarContrasena: async (contrasenaActual, contrasenaNueva) => {
    const response = await api.put('/estudiante/perfil/cambiar-contrasena', {
      contrasenaActual,
      contrasenaNueva
    });
    return response.data;
  }
};

export default estudianteService;
