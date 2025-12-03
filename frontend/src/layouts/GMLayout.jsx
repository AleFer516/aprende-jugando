// src/layouts/GMLayout.jsx
// Layout principal del panel del Game Master (Profesor).
// Sidebar colapsable + topbar + área de contenido.

import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";
import useSystemConfig from "../hooks/useSystemConfig";
import authService from "../services/authService";
import notificacionesService from "../services/notificacionesService";
import "../styles/gmLayout.css";
import "../styles/adminUsuarios.css";
import "../styles/themes.css";

function GMLayout() {
  // Configuración del sistema (incluye logo y nombre)
  const { nombreSistema, logoUrl } = useSystemConfig();
  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Notificaciones
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [totalNoLeidas, setTotalNoLeidas] = useState(0);

  // Menú de usuario
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Modal de cierre de sesión
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Información del usuario
  const [usuario, setUsuario] = useState(authService.getCurrentUser());

  const navigate = useNavigate();

  const cerrarSidebar = () => setSidebarOpen(false);
  const abrirSidebar = () => setSidebarOpen(true);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const formatearTiempo = (fecha) => {
    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diff = Math.floor((ahora - fechaNotif) / 1000); // diferencia en segundos

    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minuto${Math.floor(diff / 60) > 1 ? 's' : ''}`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} hora${Math.floor(diff / 3600) > 1 ? 's' : ''}`;
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} día${Math.floor(diff / 86400) > 1 ? 's' : ''}`;
    return fechaNotif.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
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

  const toggleNotifications = async () => {
    setNotificationsOpen((prev) => !prev);
    if (!notificationsOpen) {
      await cargarNotificaciones();
    }
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
    alert("Sesión cerrada correctamente.");
    navigate("/");
  };

  // Escuchar cambios en la información del usuario
  useEffect(() => {
    const handleUserUpdated = (event) => {
      setUsuario(event.detail);
    };

    window.addEventListener('userUpdated', handleUserUpdated);
    return () => window.removeEventListener('userUpdated', handleUserUpdated);
  }, []);

  // Cargar notificaciones al montar y periódicamente
  useEffect(() => {
    cargarNotificaciones();

    // Actualizar notificaciones cada 30 segundos
    const interval = setInterval(() => {
      cargarNotificaciones();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Notificaciones
      if (
        notificationsOpen &&
        !e.target.closest(".gm-topbar-bell") &&
        !e.target.closest(".gm-notifications-dropdown")
      ) {
        setNotificationsOpen(false);
      }

      // Menú de usuario
      if (
        userMenuOpen &&
        !e.target.closest(".gm-user-wrapper") &&
        !e.target.closest(".gm-user-dropdown")
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen, userMenuOpen]);

  return (
    <ThemeProvider>
      <div className="gm-layout">
        {/* BOTÓN FLOTANTE (solo cuando la sidebar está oculta) */}
        {!sidebarOpen && (
        <button
          className="gm-sidebar-floating-toggle"
          onClick={abrirSidebar}
          aria-label="Mostrar menú de navegación"
        >
          <span />
          <span />
          <span />
        </button>
      )}

      {/* SIDEBAR */}
      <aside className={`gm-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        {/* Parte superior: logo + botón hamburguesa para ocultar */}
        <div className="gm-sidebar-top">
          <div
            className="gm-sidebar-logo"
            onClick={() => {
              navigate("/gm/inicio");
            }}
          >
            <img
              src={logoUrl ? `http://localhost:4000${logoUrl}` : "/images/logo_sin_fondo.png"}
              alt={`${nombreSistema} Logo`}
              className="gm-logo-img"
            />
            <div className="gm-logo-text">
              <p className="gm-logo-title">{nombreSistema}</p>
              <p className="gm-logo-subtitle">Aprende Jugando</p>
            </div>
          </div>

          {/* Botón hamburguesa dentro de la sidebar */}
          <button
            className="gm-sidebar-toggle"
            onClick={cerrarSidebar}
            aria-label="Ocultar menú de navegación"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Menú */}
        <nav className="gm-sidebar-menu">
          <NavLink
            to="/gm/inicio"
            className={({ isActive }) =>
              "gm-sidebar-item" + (isActive ? " active" : "")
            }
          >
            <span className="gm-sidebar-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 1.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 10h1v6a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7z" />
              </svg>
            </span>
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/gm/estudiantes"
            className={({ isActive }) =>
              "gm-sidebar-item" + (isActive ? " active" : "")
            }
          >
            <span className="gm-sidebar-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
              </svg>
            </span>
            <span>Estudiantes</span>
          </NavLink>

          <NavLink
            to="/gm/misiones"
            className={({ isActive }) =>
              "gm-sidebar-item" + (isActive ? " active" : "")
            }
          >
            <span className="gm-sidebar-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </span>
            <span>Misiones</span>
          </NavLink>

          <NavLink
            to="/gm/evaluaciones"
            className={({ isActive }) =>
              "gm-sidebar-item" + (isActive ? " active" : "")
            }
          >
            <span className="gm-sidebar-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
            </span>
            <span>Evaluaciones</span>
          </NavLink>

          <NavLink
            to="/gm/configuracion"
            className={({ isActive }) =>
              "gm-sidebar-item" + (isActive ? " active" : "")
            }
          >
            <span className="gm-sidebar-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M11.983 1.907a1 1 0 00-1.966 0l-.262 1.571a5.972 5.972 0 00-1.302.752L6.12 3.5a1 1 0 00-1.414 1.414l.73 1.333a5.972 5.972 0 00-.352 1.46L3.5 8.77a1 1 0 000 1.96l1.584.063a5.972 5.972 0 00.73 1.46l-.73 1.333A1 1 0 006.12 15.5l1.333-.73c.4.3.839.548 1.302.752l.262 1.571a1 1 0 001.966 0l.262-1.571a5.972 5.972 0 001.302-.752l1.333.73a1 1 0 001.414-1.414l-.73-1.333c.3-.4.548-.839.752-1.302l1.571-.262a1 1 0 000-1.966l-1.571-.262a5.972 5.972 0 00-.752-1.302l.73-1.333A1 1 0 0013.88 3.5l-1.333.73a5.972 5.972 0 00-1.302-.752l-.262-1.571zM10 8a2 2 0 110 4 2 2 0 010-4z" />
              </svg>
            </span>
            <span>Configuración</span>
          </NavLink>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className={`gm-main ${sidebarOpen ? "" : "full-width"}`}>
        {/* TOPBAR */}
        <header className="gm-topbar">
          <div className="gm-topbar-right">
            {/* Notificaciones */}
            <div className="gm-notifications-wrapper">
              <button
                className={`gm-topbar-bell ${
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
                <div className="gm-notifications-dropdown">
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
                              {notif.tipo === 'estudiante' && (
                                <>
                                  <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path fillRule="evenodd" d="M5 12a4 4 0 018 0v1H5v-1zm-2 3a2 2 0 012-2h8a2 2 0 012 2v1H3v-1z" clipRule="evenodd" />
                                </>
                              )}
                              {notif.tipo === 'mision' && (
                                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                              )}
                              {(!notif.tipo || (notif.tipo !== 'estudiante' && notif.tipo !== 'mision')) && (
                                <path d="M10 2a4 4 0 00-4 4v1.528c0 .434-.14.857-.4 1.204L4.1 10.2A1 1 0 005 11.8h10a1 1 0 00.9-1.6l-1.5-1.968A2 2 0 0114 7.528V6a4 4 0 00-4-4z" />
                              )}
                            </svg>
                          </div>
                          <div className="notification-content">
                            <p className="notification-title">{notif.titulo}</p>
                            {notif.mensaje && (
                              <p className="notification-message" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                {notif.mensaje}
                              </p>
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
            <div className="gm-user-wrapper">
              <button
                type="button"
                className={`gm-topbar-user ${userMenuOpen ? "active" : ""}`}
                onClick={toggleUserMenu}
                aria-label="Menú de usuario"
              >
                <div className="gm-avatar">
                  {usuario?.avatar ? (
                    <img
                      src={`http://localhost:4000${usuario.avatar}`}
                      alt={usuario.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span>{usuario?.nombre?.charAt(0) || 'GM'}</span>
                  )}
                </div>
                <span className="gm-username">{usuario?.nombre || 'Profesor'}</span>
                <svg
                  className="gm-user-caret"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.086l3.71-3.856a.75.75 0 111.08 1.04l-4.24 4.41a.75.75 0 01-1.08 0l-4.24-4.41a.75.75 0 01.02-1.06z" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="gm-user-dropdown">
                  <div className="gm-user-dropdown-header">
                    <div className="gm-user-dropdown-avatar">
                      {usuario?.avatar ? (
                        <img
                          src={`http://localhost:4000${usuario.avatar}`}
                          alt={usuario.nombre}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        />
                      ) : (
                        <span>{usuario?.nombre?.charAt(0) || 'GM'}</span>
                      )}
                    </div>
                    <div>
                      <p className="gm-user-dropdown-name">{usuario?.nombre || 'Profesor'}</p>
                      <p className="gm-user-dropdown-email">
                        {usuario?.email || 'profesor@luminia.app'}
                      </p>
                    </div>
                  </div>

                  <div className="gm-user-dropdown-body">
                    <button
                      type="button"
                      className="gm-user-dropdown-item"
                      onClick={() => navigate("/gm/perfil")}
                    >
                      <span className="gm-user-item-icon">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 2a4 4 0 00-4 4 4 4 0 108-0 4 4 0 00-4-4zm-6 14a6 6 0 1112 0v1H4v-1z" />
                        </svg>
                      </span>
                      <span>Ver perfil</span>
                    </button>

                    <button
                      type="button"
                      className="gm-user-dropdown-item"
                      onClick={() => navigate("/gm/configuracion")}
                    >
                      <span className="gm-user-item-icon">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11.983 1.907a1 1 0 00-1.966 0l-.262 1.571a5.972 5.972 0 00-1.302.752L6.12 3.5a1 1 0 00-1.414 1.414l.73 1.333a5.972 5.972 0 00-.352 1.46L3.5 8.77a1 1 0 000 1.96l1.584.063a5.972 5.972 0 00.73 1.46l-.73 1.333A1 1 0 006.12 15.5l1.333-.73c.4.3.839.548 1.302.752l.262 1.571a1 1 0 001.966 0l.262-1.571a5.972 5.972 0 001.302-.752l1.333.73a1 1 0 001.414-1.414l-.73-1.333c.3-.4.548-.839.752-1.302l1.571-.262a1 1 0 000-1.966l-1.571-.262a5.972 5.972 0 00-.752-1.302l.73-1.333A1 1 0 0013.88 3.5l-1.333.73a5.972 5.972 0 00-1.302-.752l-.262-1.571zM10 8a2 2 0 110 4 2 2 0 010-4z" />
                        </svg>
                      </span>
                      <span>Configuración de cuenta</span>
                    </button>

                    <hr className="gm-user-dropdown-divider" />

                    <button
                      type="button"
                      className="gm-user-dropdown-item gm-user-logout"
                      onClick={abrirModalLogout}
                    >
                      <span className="gm-user-item-icon">
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

        {/* CONTENIDO (Dashboard, etc.) */}
        <main className="gm-content">
          <Outlet />
        </main>
      </div>

      {/* MODAL CERRAR SESIÓN */}
      {logoutModalOpen && (
        <div className="admin-usuarios-modal-backdrop" onClick={cancelarLogout}>
          <div className="admin-usuarios-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <header className="admin-usuarios-modal-header">
              <h2>Cerrar sesión</h2>
            </header>

            <div className="admin-modal-body">
              <p>¿Estás seguro de que deseas cerrar sesión?</p>
            </div>

            <footer className="admin-usuarios-modal-footer">
              <button
                type="button"
                className="admin-usuarios-btn-cancelar"
                onClick={cancelarLogout}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="admin-usuarios-btn-guardar"
                onClick={confirmarLogout}
              >
                Cerrar sesión
              </button>
            </footer>
          </div>
        </div>
      )}
      </div>
    </ThemeProvider>
  );
}

export default GMLayout;
