import api from './api';

const gmService = {
  // Dashboard
  getDashboardResumen: async () => {
    const response = await api.get('/gm/dashboard/resumen');
    return response.data;
  },

  getEstadisticas: async () => {
    const response = await api.get('/gm/dashboard/estadisticas');
    return response.data;
  },

  getMisionesPorRevisar: async () => {
    const response = await api.get('/gm/dashboard/misiones-revisar');
    return response.data;
  },

  // Misiones
  getMisiones: async (params = {}) => {
    let url = '/gm/misiones';
    const queryParams = new URLSearchParams();
    if (params.curso) queryParams.append('curso', params.curso);
    if (params.dificultad) queryParams.append('dificultad', params.dificultad);
    if (params.estado) queryParams.append('estado', params.estado);
    if (params.busqueda) queryParams.append('busqueda', params.busqueda);
    if (queryParams.toString()) url += `?${queryParams.toString()}`;

    const response = await api.get(url);
    return response.data;
  },

  getMisionDetalle: async (misionId) => {
    const response = await api.get(`/gm/misiones/${misionId}`);
    return response.data;
  },

  crearMision: async (misionData) => {
    const response = await api.post('/gm/misiones', misionData);
    return response.data;
  },

  actualizarMision: async (misionId, misionData) => {
    const response = await api.put(`/gm/misiones/${misionId}`, misionData);
    return response.data;
  },

  eliminarMision: async (misionId) => {
    const response = await api.delete(`/gm/misiones/${misionId}`);
    return response.data;
  },

  // Actividades
  crearActividad: async (misionId, actividadData) => {
    const response = await api.post(`/gm/misiones/${misionId}/actividades`, actividadData);
    return response.data;
  },

  actualizarActividad: async (misionId, actividadId, actividadData) => {
    const response = await api.put(`/gm/misiones/${misionId}/actividades/${actividadId}`, actividadData);
    return response.data;
  },

  eliminarActividad: async (misionId, actividadId) => {
    const response = await api.delete(`/gm/misiones/${misionId}/actividades/${actividadId}`);
    return response.data;
  },

  // Evaluaciones
  getEvaluaciones: async (estado = null) => {
    let url = '/gm/evaluaciones';
    if (estado) url += `?estado=${estado}`;
    const response = await api.get(url);
    return response.data;
  },

  getEvaluacionDetalle: async (evaluacionId) => {
    const response = await api.get(`/gm/evaluaciones/${evaluacionId}`);
    return response.data;
  },

  evaluarMision: async (evaluacionId, calificacion, retroalimentacion) => {
    const response = await api.put(`/gm/evaluaciones/${evaluacionId}`, {
      calificacion,
      retroalimentacion
    });
    return response.data;
  },

  // Estudiantes
  getEstudiantes: async (cursoId = null) => {
    let url = '/gm/estudiantes';
    if (cursoId) url += `?curso=${cursoId}`;
    const response = await api.get(url);
    return response.data;
  },

  getEstudianteDetalle: async (estudianteId) => {
    const response = await api.get(`/gm/estudiantes/${estudianteId}`);
    return response.data;
  },

  // Cursos
  getCursos: async () => {
    const response = await api.get('/gm/cursos');
    return response.data;
  },

  getCursoDetalle: async (cursoId) => {
    const response = await api.get(`/gm/cursos/${cursoId}`);
    return response.data;
  },

  crearCurso: async (cursoData) => {
    const response = await api.post('/gm/cursos', cursoData);
    return response.data;
  },

  actualizarCurso: async (cursoId, cursoData) => {
    const response = await api.put(`/gm/cursos/${cursoId}`, cursoData);
    return response.data;
  },

  eliminarCurso: async (cursoId) => {
    const response = await api.delete(`/gm/cursos/${cursoId}`);
    return response.data;
  },

  inscribirEstudiante: async (cursoId, estudianteId) => {
    const response = await api.post(`/gm/cursos/${cursoId}/estudiantes`, { estudianteId });
    return response.data;
  },

  // Configuración
  getConfiguracion: async () => {
    const response = await api.get('/gm/configuracion');
    return response.data;
  },

  actualizarConfiguracion: async (configuracion) => {
    const response = await api.put('/gm/configuracion', configuracion);
    return response.data;
  },

  cambiarContrasena: async (contrasenaActual, contrasenaNueva) => {
    const response = await api.put('/gm/configuracion/cambiar-contrasena', {
      contrasenaActual,
      contrasenaNueva
    });
    return response.data;
  },

  // Perfil
  getPerfil: async () => {
    const response = await api.get('/gm/perfil');
    return response.data;
  },

  actualizarPerfil: async (datos) => {
    const response = await api.put('/gm/perfil', datos);
    return response.data;
  },

  getEstadisticasDetalladas: async () => {
    const response = await api.get('/gm/perfil/estadisticas');
    return response.data;
  }
};

export default gmService;
