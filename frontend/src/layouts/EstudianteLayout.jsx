// src/layouts/EstudianteLayout.jsx
// Layout principal del panel de estudiantes.
// Sidebar colapsable + topbar + área de contenido.

import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";
import useSystemConfig from "../hooks/useSystemConfig";
import "../styles/estudianteLayout.css";
import "../styles/themes.css";

function EstudianteLayout() {
  // Configuración del sistema (incluye logo y nombre)
  const { nombreSistema, logoUrl } = useSystemConfig();
  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Notificaciones
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);

  // Menú de usuario
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Modal de cierre de sesión
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const navigate = useNavigate();

  const cerrarSidebar = () => setSidebarOpen(false);
  const abrirSidebar = () => setSidebarOpen(true);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const toggleNotifications = () => {
    setNotificationsOpen((prev) => !prev);
    if (!notificationsOpen) {
      setHasNewNotifications(false);
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
                  {hasNewNotifications && (
                    <span className="notification-badge"></span>
                  )}
                </button>

                {/* Dropdown de notificaciones */}
                {notificationsOpen && (
                  <div className="estudiante-notifications-dropdown">
                    <div className="notifications-header">
                      <h3>Notificaciones</h3>
                    </div>
                    <div className="notifications-list">
                      <div className="notification-item">
                        <div className="notification-icon">
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="notification-content">
                          <p className="notification-title">
                            Nueva misión asignada
                          </p>
                          <p className="notification-time">Hace 1 hora</p>
                        </div>
                      </div>
                      <div className="notification-item">
                        <div className="notification-icon">
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <div className="notification-content">
                          <p className="notification-title">
                            ¡Nuevo logro desbloqueado!
                          </p>
                          <p className="notification-time">Hace 3 horas</p>
                        </div>
                      </div>
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
                    <span>AL</span>
                  </div>
                  <span className="estudiante-username">Alejandra</span>
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
                        <span>AL</span>
                      </div>
                      <div>
                        <p className="estudiante-user-dropdown-name">Alejandra</p>
                        <p className="estudiante-user-dropdown-email">
                          alejandra@estudiante.com
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
