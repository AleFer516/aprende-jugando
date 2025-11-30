// src/layouts/AdminLayout.jsx
// Layout principal del panel de administración.
// Sidebar colapsable + topbar + área de contenido.

import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";
import useSystemConfig from "../hooks/useSystemConfig";
import "../styles/adminLayout.css";
import "../styles/adminUsuarios.css";
import "../styles/themes.css";

function AdminLayout() {
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
    // Mensaje de éxito
    alert("Sesión cerrada correctamente.");
    // Ajusta la ruta si tu Login.jsx está en otra URL (por ejemplo '/login')
    navigate("/");
  };

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Notificaciones
      if (
        notificationsOpen &&
        !e.target.closest(".admin-topbar-bell") &&
        !e.target.closest(".admin-notifications-dropdown")
      ) {
        setNotificationsOpen(false);
      }

      // Menú de usuario
      if (
        userMenuOpen &&
        !e.target.closest(".admin-user-wrapper") &&
        !e.target.closest(".admin-user-dropdown")
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen, userMenuOpen]);

  return (
    <ThemeProvider>
      <div className="admin-layout">
        {/* BOTÓN FLOTANTE (solo cuando la sidebar está oculta) */}
        {!sidebarOpen && (
        <button
          className="admin-sidebar-floating-toggle"
          onClick={abrirSidebar}
          aria-label="Mostrar menú de navegación"
        >
          <span />
          <span />
          <span />
        </button>
      )}

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        {/* Parte superior: logo + botón hamburguesa para ocultar */}
        <div className="admin-sidebar-top">
          <div
            className="admin-sidebar-logo"
            onClick={() => {
              navigate("/admin/dashboard");
            }}
          >
            <img
              src={logoUrl ? `http://localhost:4000${logoUrl}` : "/images/logo_sin_fondo.png"}
              alt={`${nombreSistema} Logo`}
              className="admin-logo-img"
            />
            <div className="admin-logo-text">
              <p className="admin-logo-title">{nombreSistema}</p>
              <p className="admin-logo-subtitle">Aprende Jugando</p>
            </div>
          </div>

          {/* Botón hamburguesa dentro de la sidebar */}
          <button
            className="admin-sidebar-toggle"
            onClick={cerrarSidebar}
            aria-label="Ocultar menú de navegación"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Menú */}
        <nav className="admin-sidebar-menu">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              "admin-sidebar-item" + (isActive ? " active" : "")
            }
          >
            <span className="admin-sidebar-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 1.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 10h1v6a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7z" />
              </svg>
            </span>
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/admin/usuarios"
            className={({ isActive }) =>
              "admin-sidebar-item" + (isActive ? " active" : "")
            }
          >
            <span className="admin-sidebar-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </span>
            <span>Usuarios</span>
          </NavLink>

          <NavLink
            to="/admin/estadisticas"
            className={({ isActive }) =>
              "admin-sidebar-item" + (isActive ? " active" : "")
            }
          >
            <span className="admin-sidebar-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 3a1 1 0 00-1 1v12h2V4a1 1 0 00-1-1zm5 4a1 1 0 00-1 1v8h2V8a1 1 0 00-1-1zm4-3a1 1 0 00-1 1v11h2V5a1 1 0 00-1-1zm4 6a1 1 0 00-1 1v5h2v-5a1 1 0 00-1-1z" />
              </svg>
            </span>
            <span>Estadísticas globales</span>
          </NavLink>

          <NavLink
            to="/admin/actividad"
            className={({ isActive }) =>
              "admin-sidebar-item" + (isActive ? " active" : "")
            }
          >
            <span className="admin-sidebar-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 000 2h4.586l-2.293 2.293a1 1 0 001.414 1.414L10 7.414l3.293 3.293a1 1 0 001.414-1.414L12.414 6H17a1 1 0 100-2H3z" />
                <path d="M5 14a1 1 0 011-1h8a1 1 0 010 2H6a1 1 0 01-1-1z" />
              </svg>
            </span>
            <span>Actividad</span>
          </NavLink>

          <NavLink
            to="/admin/configuracion"
            className={({ isActive }) =>
              "admin-sidebar-item" + (isActive ? " active" : "")
            }
          >
            <span className="admin-sidebar-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M11.983 1.907a1 1 0 00-1.966 0l-.262 1.571a5.972 5.972 0 00-1.302.752L6.12 3.5a1 1 0 00-1.414 1.414l.73 1.333a5.972 5.972 0 00-.352 1.46L3.5 8.77a1 1 0 000 1.96l1.584.063a5.972 5.972 0 00.73 1.46l-.73 1.333A1 1 0 006.12 15.5l1.333-.73c.4.3.839.548 1.302.752l.262 1.571a1 1 0 001.966 0l.262-1.571a5.972 5.972 0 001.302-.752l1.333.73a1 1 0 001.414-1.414l-.73-1.333c.3-.4.548-.839.752-1.302l1.571-.262a1 1 0 000-1.966l-1.571-.262a5.972 5.972 0 00-.752-1.302l.73-1.333A1 1 0 0013.88 3.5l-1.333.73a5.972 5.972 0 00-1.302-.752l-.262-1.571zM10 8a2 2 0 110 4 2 2 0 010-4z" />
              </svg>
            </span>
            <span>Configuración</span>
          </NavLink>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className={`admin-main ${sidebarOpen ? "" : "full-width"}`}>
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="admin-topbar-right">
            {/* Notificaciones */}
            <div className="admin-notifications-wrapper">
              <button
                className={`admin-topbar-bell ${
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
                <div className="admin-notifications-dropdown">
                  <div className="notifications-header">
                    <h3>Notificaciones</h3>
                  </div>
                  <div className="notifications-list">
                    <div className="notification-item">
                      <div className="notification-icon">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path
                            fillRule="evenodd"
                            d="M5 12a4 4 0 018 0v1H5v-1zm-2 3a2 2 0 012-2h8a2 2 0 012 2v1H3v-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="notification-content">
                        <p className="notification-title">
                          Nuevo usuario registrado
                        </p>
                        <p className="notification-time">Hace 5 minutos</p>
                      </div>
                    </div>
                    <div className="notification-item">
                      <div className="notification-icon">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 3a1 1 0 00-1 1v12h2V4a1 1 0 00-1-1zm5 4a1 1 0 00-1 1v8h2V8a1 1 0 00-1-1zm4-3a1 1 0 00-1 1v11h2V5a1 1 0 00-1-1zm4 6a1 1 0 00-1 1v5h2v-5a1 1 0 00-1-1z" />
                        </svg>
                      </div>
                      <div className="notification-content">
                        <p className="notification-title">
                          Nuevo récord de usuarios activos
                        </p>
                        <p className="notification-time">Hace 1 hora</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Menú de usuario */}
            <div className="admin-user-wrapper">
              <button
                type="button"
                className={`admin-topbar-user ${userMenuOpen ? "active" : ""}`}
                onClick={toggleUserMenu}
                aria-label="Menú de usuario"
              >
                <div className="admin-avatar">
                  <span>AD</span>
                </div>
                <span className="admin-username">Admin</span>
                <svg
                  className="admin-user-caret"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.086l3.71-3.856a.75.75 0 111.08 1.04l-4.24 4.41a.75.75 0 01-1.08 0l-4.24-4.41a.75.75 0 01.02-1.06z" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="admin-user-dropdown">
                  <div className="admin-user-dropdown-header">
                    <div className="admin-user-dropdown-avatar">
                      <span>AD</span>
                    </div>
                    <div>
                      <p className="admin-user-dropdown-name">Admin</p>
                      <p className="admin-user-dropdown-email">
                        admin@luminia.app
                      </p>
                    </div>
                  </div>

                  <div className="admin-user-dropdown-body">
                    <button
                      type="button"
                      className="admin-user-dropdown-item"
                      onClick={() => navigate("/admin/perfil")}
                    >
                      <span className="admin-user-item-icon">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 2a4 4 0 00-4 4 4 4 0 108-0 4 4 0 00-4-4zm-6 14a6 6 0 1112 0v1H4v-1z" />
                        </svg>
                      </span>
                      <span>Ver perfil</span>
                    </button>

                    <button
                      type="button"
                      className="admin-user-dropdown-item"
                      onClick={() => navigate("/admin/configuracion")}
                    >
                      <span className="admin-user-item-icon">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11.983 1.907a1 1 0 00-1.966 0l-.262 1.571a5.972 5.972 0 00-1.302.752L6.12 3.5a1 1 0 00-1.414 1.414l.73 1.333a5.972 5.972 0 00-.352 1.46L3.5 8.77a1 1 0 000 1.96l1.584.063a5.972 5.972 0 00.73 1.46l-.73 1.333A1 1 0 006.12 15.5l1.333-.73c.4.3.839.548 1.302.752l.262 1.571a1 1 0 001.966 0l.262-1.571a5.972 5.972 0 001.302-.752l1.333.73a1 1 0 001.414-1.414l-.73-1.333c.3-.4.548-.839.752-1.302l1.571-.262a1 1 0 000-1.966l-1.571-.262a5.972 5.972 0 00-.752-1.302l.73-1.333A1 1 0 0013.88 3.5l-1.333.73a5.972 5.972 0 00-1.302-.752l-.262-1.571zM10 8a2 2 0 110 4 2 2 0 010-4z" />
                        </svg>
                      </span>
                      <span>Configuración de cuenta</span>
                    </button>

                    <hr className="admin-user-dropdown-divider" />

                    <button
                      type="button"
                      className="admin-user-dropdown-item admin-user-logout"
                      onClick={abrirModalLogout}
                    >
                      <span className="admin-user-item-icon">
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
        <main className="admin-content">
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

export default AdminLayout;
