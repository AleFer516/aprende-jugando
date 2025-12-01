import api from './api';

const notificacionesService = {
  // Obtener notificaciones
  getNotificaciones: async (limit = 10, soloNoLeidas = false) => {
    const response = await api.get(`/admin/notificaciones?limit=${limit}&solo_no_leidas=${soloNoLeidas}`);
    return response.data;
  },

  // Marcar notificación como leída
  marcarComoLeida: async (id) => {
    const response = await api.put(`/admin/notificaciones/${id}/leida`);
    return response.data;
  },

  // Marcar todas como leídas
  marcarTodasLeidas: async () => {
    const response = await api.put('/admin/notificaciones/marcar-todas-leidas');
    return response.data;
  },

  // Eliminar notificación
  eliminarNotificacion: async (id) => {
    const response = await api.delete(`/admin/notificaciones/${id}`);
    return response.data;
  }
};

export default notificacionesService;
