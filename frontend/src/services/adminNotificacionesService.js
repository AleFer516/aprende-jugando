import api from './api';

const adminNotificacionesService = {
  // Obtener notificaciones del admin
  getNotificaciones: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    if (params.soloNoLeidas !== undefined) queryParams.append('solo_no_leidas', params.soloNoLeidas);

    const url = `/admin/notificaciones${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Marcar notificación como leída
  marcarComoLeida: async (notificacionId) => {
    const response = await api.put(`/admin/notificaciones/${notificacionId}/leida`);
    return response.data;
  },

  // Marcar todas las notificaciones como leídas
  marcarTodasComoLeidas: async () => {
    const response = await api.put('/admin/notificaciones/marcar-todas-leidas');
    return response.data;
  },

  // Eliminar notificación
  eliminarNotificacion: async (notificacionId) => {
    const response = await api.delete(`/admin/notificaciones/${notificacionId}`);
    return response.data;
  }
};

export default adminNotificacionesService;
