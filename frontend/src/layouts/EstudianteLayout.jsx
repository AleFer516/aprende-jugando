// src/layouts/EstudianteLayout.jsx
// Layout principal del panel de estudiantes.
// Sidebar colapsable + topbar + área de contenido.

import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";
import useSystemConfig from "../hooks/useSystemConfig";
import authService from "../services/authService";
import notificacionesService from "../services/notificacionesService";
import "../styles/estudianteLayout.css";
import "../styles/themes.css";

function EstudianteLayout() {
  // Configuración del sistema (incluye logo y nombre)
  const { nombreSistema, logoUrl } = useSystemConfig();
  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Usuario
  const [usuario, setUsuario] = useState(null);

  // Notificaciones
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [totalNoLeidas, setTotalNoLeidas] = useState(0);

  // Menú de usuario
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Modal de cierre de sesión
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const navigate = useNavigate();

  // Cargar información del usuario al montar
  useEffect(() => {
    cargarUsuario();
    cargarNotificaciones();

    // Actualizar notificaciones cada 30 segundos
    const interval = setInterval(() => {
      cargarNotificaciones();
    }, 30000);

    // Escuchar eventos de actualización de perfil
    const handleProfileUpdate = () => {
      cargarUsuario();
    };

    window.addEventListener('perfilActualizado', handleProfileUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('perfilActualizado', handleProfileUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarUsuario = async () => {
    try {
      // Obtener datos actualizados del servidor
      const response = await fetch('http://localhost:4000/api/estudiante/perfil', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Actualizar el usuario con los datos del servidor
          const updatedUser = {
            ...authService.getCurrentUser(),
            avatar: data.perfil.avatar,
            nombre: data.perfil.nombre,
            email: data.perfil.email
          };
          setUsuario(updatedUser);
        }
      } else {
        // Si falla, usar los datos del localStorage
        const user = authService.getCurrentUser();
        setUsuario(user);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      // Si falla, usar los datos del localStorage
      const user = authService.getCurrentUser();
      setUsuario(user);
    }
  };

  const cargarNotificaciones = async () => {
    try {
      const response = await notificacionesService.getNotificaciones({ limit: 10 });
      if (response.success) {
        setNotificaciones(response.notificaciones);
        setTotalNoLeidas(response.totalNoLeidas);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  const formatearTiempo = (fecha) => {
    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diff = Math.floor((ahora - fechaNotif) / 1000);

    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minuto${Math.floor(diff / 60) > 1 ? 's' : ''}`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} hora${Math.floor(diff / 3600) > 1 ? 's' : ''}`;
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} día${Math.floor(diff / 86400) > 1 ? 's' : ''}`;
    return fechaNotif.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const handleMarcarComoLeida = async (notificacionId) => {
    try {
      await notificacionesService.marcarComoLeida(notificacionId);
      await cargarNotificaciones();
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await notificacionesService.marcarTodasComoLeidas();
      await cargarNotificaciones();
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  };

  const cerrarSidebar = () => setSidebarOpen(false);
  const abrirSidebar = () => setSidebarOpen(true);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const toggleNotifications = async () => {
    setNotificationsOpen((prev) => !prev);
    if (!notificationsOpen) {
      await cargarNotificaciones();
    }
  };

  const toggleUserMenu = () => {
    setUserMenuOpen((prev) => !prev);
  };

  const abrirModalLogout = () => {
    setUserMenuOpen(false);
    setLogoutModalOpen(true);
  };

  const cancelarLogout = () => {
    setLogoutModalOpen(false);
  };

  const confirmarLogout = () => {
    setLogoutModalOpen(false);
    authService.logout();
    navigate("/");
  };

  const obtenerIniciales = (nombre) => {
    if (!nombre) return "U";
    const palabras = nombre.trim().split(' ');
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Notificaciones
      if (
        notificationsOpen &&
        !e.target.closest(".estudiante-topbar-bell") &&
        !e.target.closest(".estudiante-notifications-dropdown")
      ) {
        setNotificationsOpen(false);
      }

      // Menú de usuario
      if (
        userMenuOpen &&
        !e.target.closest(".estudiante-user-wrapper") &&
        !e.target.closest(".estudiante-user-dropdown")
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen, userMenuOpen]);

  return (
    <ThemeProvider>
      <div className="estudiante-layout">
        {/* BOTÓN FLOTANTE (solo cuando la sidebar está oculta) */}
        {!sidebarOpen && (
          <button
            className="estudiante-sidebar-floating-toggle"
            onClick={abrirSidebar}
            aria-label="Mostrar menú de navegación"
          >
            <span />
            <span />
            <span />
          </button>
        )}

        {/* SIDEBAR */}
        <aside className={`estudiante-sidebar ${sidebarOpen ? "open" : "closed"}`}>
          {/* Parte superior: logo + botón hamburguesa para ocultar */}
          <div className="estudiante-sidebar-top">
            <div
              className="estudiante-sidebar-logo"
              onClick={() => {
                navigate("/estudiante/inicio");
              }}
            >
              <img
                src={logoUrl ? `http://localhost:4000${logoUrl}` : "/images/logo_sin_fondo.png"}
                alt={`${nombreSistema} Logo`}
                className="estudiante-logo-img"
              />
              <div className="estudiante-logo-text">
                <p className="estudiante-logo-title">{nombreSistema}</p>
                <p className="estudiante-logo-subtitle">Aprende Jugando</p>
              </div>
            </div>

            {/* Botón hamburguesa dentro de la sidebar */}
            <button
              className="estudiante-sidebar-toggle"
              onClick={cerrarSidebar}
              aria-label="Ocultar menú de navegación"
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          {/* Menú */}
          <nav className="estudiante-sidebar-menu">
            <NavLink
              to="/estudiante/inicio"
              className={({ isActive }) =>
                "estudiante-sidebar-item" + (isActive ? " active" : "")
              }
            >
              <span className="estudiante-sidebar-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </span>
              <span>Inicio</span>
            </NavLink>

            <NavLink
              to="/estudiante/misiones"
              className={({ isActive }) =>
                "estudiante-sidebar-item" + (isActive ? " active" : "")
              }
            >
              <span className="estudiante-sidebar-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Misiones</span>
            </NavLink>

            <NavLink
              to="/estudiante/progreso"
              className={({ isActive}) =>
                "estudiante-sidebar-item" + (isActive ? " active" : "")
              }
            >
              <span className="estudiante-sidebar-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </span>
              <span>Progreso</span>
            </NavLink>

            <NavLink
              to="/estudiante/logros"
              className={({ isActive }) =>
                "estudiante-sidebar-item" + (isActive ? " active" : "")
              }
            >
              <span className="estudiante-sidebar-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
              <span>Logros</span>
            </NavLink>

            <NavLink
              to="/estudiante/personaje"
              className={({ isActive }) =>
                "estudiante-sidebar-item" + (isActive ? " active" : "")
              }
            >
              <span className="estudiante-sidebar-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Personaje</span>
            </NavLink>

            <NavLink
              to="/estudiante/configuracion"
              className={({ isActive }) =>
                "estudiante-sidebar-item" + (isActive ? " active" : "")
              }
            >
              <span className="estudiante-sidebar-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Configuración</span>
            </NavLink>
          </nav>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <div className={`estudiante-main ${sidebarOpen ? "" : "full-width"}`}>
          {/* TOPBAR */}
          <header className="estudiante-topbar">
            <div className="estudiante-topbar-right">
              {/* Notificaciones */}
              <div className="estudiante-notifications-wrapper">
                <button
                  className={`estudiante-topbar-bell ${
                    notificationsOpen ? "active" : ""
                  }`}
                  onClick={toggleNotifications}
                  aria-label="Notificaciones"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a4 4 0 00-4 4v1.528c0 .434-.14.857-.4 1.204L4.1 10.2A1 1 0 005 11.8h10a1 1 0 00.9-1.6l-1.5-1.968A2 2 0 0114 7.528V6a4 4 0 00-4-4z" />
                    <path d="M8 14a2 2 0 104 0H8z" />
                  </svg>
                  {totalNoLeidas > 0 && (
                    <span className="notification-badge">{totalNoLeidas}</span>
                  )}
                </button>

                {/* Dropdown de notificaciones */}
                {notificationsOpen && (
                  <div className="estudiante-notifications-dropdown">
                    <div className="notifications-header">
                      <h3>Notificaciones</h3>
                      {totalNoLeidas > 0 && (
                        <button
                          type="button"
                          onClick={handleMarcarTodasLeidas}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary-color)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            padding: '0.25rem 0.5rem'
                          }}
                        >
                          Marcar todas como leídas
                        </button>
                      )}
                    </div>
                    <div className="notifications-list">
                      {notificaciones.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No tienes notificaciones
                        </div>
                      ) : (
                        notificaciones.map((notif) => (
                          <div
                            key={notif.id}
                            className={`notification-item ${!notif.leida ? 'unread' : ''}`}
                            onClick={() => {
                              if (!notif.leida) {
                                handleMarcarComoLeida(notif.id);
                              }
                              if (notif.link) {
                                navigate(notif.link);
                                setNotificationsOpen(false);
                              }
                            }}
                            style={{ cursor: notif.link ? 'pointer' : 'default' }}
                          >
                            <div className="notification-icon">
                              <svg viewBox="0 0 20 20" fill="currentColor">
                                {notif.tipo === 'mision' && (
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                )}
                                {notif.tipo === 'logro' && (
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                )}
                                {notif.tipo === 'nivel' && (
                                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                )}
                                {notif.tipo === 'sistema' && (
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                )}
                              </svg>
                            </div>
                            <div className="notification-content">
                              <p className="notification-title">{notif.titulo}</p>
                              {notif.mensaje && (
                                <p className="notification-message">{notif.mensaje}</p>
                              )}
                              <p className="notification-time">
                                {formatearTiempo(notif.created_at)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Menú de usuario */}
              <div className="estudiante-user-wrapper">
                <button
                  type="button"
                  className={`estudiante-topbar-user ${userMenuOpen ? "active" : ""}`}
                  onClick={toggleUserMenu}
                  aria-label="Menú de usuario"
                >
                  <div className="estudiante-avatar">
                    {usuario?.avatar ? (
                      <img
                        src={`http://localhost:4000${usuario.avatar}`}
                        alt={usuario.nombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    ) : (
                      <span>{obtenerIniciales(usuario?.nombre)}</span>
                    )}
                  </div>
                  <span className="estudiante-username">{usuario?.nombre || 'Usuario'}</span>
                  <svg
                    className="estudiante-user-caret"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.086l3.71-3.856a.75.75 0 111.08 1.04l-4.24 4.41a.75.75 0 01-1.08 0l-4.24-4.41a.75.75 0 01.02-1.06z" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="estudiante-user-dropdown">
                    <div className="estudiante-user-dropdown-header">
                      <div className="estudiante-user-dropdown-avatar">
                        {usuario?.avatar ? (
                          <img
                            src={`http://localhost:4000${usuario.avatar}`}
                            alt={usuario.nombre}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                          />
                        ) : (
                          <span>{obtenerIniciales(usuario?.nombre)}</span>
                        )}
                      </div>
                      <div>
                        <p className="estudiante-user-dropdown-name">{usuario?.nombre || 'Usuario'}</p>
                        <p className="estudiante-user-dropdown-email">
                          {usuario?.email || 'No disponible'}
                        </p>
                      </div>
                    </div>

                    <div className="estudiante-user-dropdown-body">
                      <button
                        type="button"
                        className="estudiante-user-dropdown-item"
                        onClick={() => navigate("/estudiante/perfil")}
                      >
                        <span className="estudiante-user-item-icon">
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span>Ver perfil</span>
                      </button>

                      <button
                        type="button"
                        className="estudiante-user-dropdown-item"
                        onClick={() => navigate("/estudiante/configuracion")}
                      >
                        <span className="estudiante-user-item-icon">
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span>Configuración de cuenta</span>
                      </button>

                      <hr className="estudiante-user-dropdown-divider" />

                      <button
                        type="button"
                        className="estudiante-user-dropdown-item estudiante-user-logout"
                        onClick={abrirModalLogout}
                      >
                        <span className="estudiante-user-item-icon">
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M3 4a2 2 0 012-2h5a1 1 0 010 2H5v12h5a1 1 0 110 2H5a2 2 0 01-2-2V4zm10.293 2.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H9a1 1 0 110-2h5.586l-1.293-1.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* CONTENIDO */}
          <main className="estudiante-content">
            <Outlet />
          </main>
        </div>

        {/* MODAL CERRAR SESIÓN */}
        {logoutModalOpen && (
          <div className="estudiante-modal-overlay" onClick={cancelarLogout}>
            <div className="estudiante-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <header className="estudiante-modal-header">
                <h2>Cerrar sesión</h2>
              </header>

              <div className="estudiante-modal-body">
                <p>¿Estás seguro de que deseas cerrar sesión?</p>
              </div>

              <div className="estudiante-modal-actions">
                <button
                  type="button"
                  className="estudiante-modal-btn estudiante-modal-btn-secondary"
                  onClick={cancelarLogout}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="estudiante-modal-btn estudiante-modal-btn-primary"
                  onClick={confirmarLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default EstudianteLayout;
