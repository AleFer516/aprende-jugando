import api from './api';

const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      // Guardar token y datos del usuario en localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  // Registro
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Actualizar avatar del usuario en localStorage
  updateUserAvatar: (avatarUrl) => {
    const usuario = authService.getCurrentUser();
    if (usuario) {
      usuario.avatar = avatarUrl;
      localStorage.setItem('usuario', JSON.stringify(usuario));
      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: usuario }));
    }
  },

  // Actualizar nombre del usuario en localStorage
  updateUserName: (nombre) => {
    const usuario = authService.getCurrentUser();
    if (usuario) {
      usuario.nombre = nombre;
      localStorage.setItem('usuario', JSON.stringify(usuario));
      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: usuario }));
    }
  }
};

export default authService;
