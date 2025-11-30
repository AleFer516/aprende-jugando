// src/pages/admin/AdminDashboard.jsx
// Pantalla de inicio del admin ("Hola, Admin" + tarjetas + registro de actividad).

import { useState, useEffect } from "react";
import "../../styles/adminDashboard.css";
import adminService from "../../services/adminService";

function AdminDashboard() {
  // Estados para datos del backend
  const [estadisticas, setEstadisticas] = useState({
    usuarios: 0,
    instituciones: 0,
    misionesTotales: 0,
    misionesCompletadas: 0,
    estudiantesActivos: 0
  });
  const [actividades, setActividades] = useState([]);
  const [estadoSistema, setEstadoSistema] = useState({
    baseDatos: 'Cargando...',
    respaldos: 'Cargando...'
  });
  const [cargando, setCargando] = useState(true);

  // ID de la actividad actualmente expandida
  const [actividadExpandida, setActividadExpandida] = useState(null);
  // Estado del modal de estadísticas
  const [modalEstadisticasAbierto, setModalEstadisticasAbierto] = useState(false);
  // Estado para animación de números
  const [numerosAnimados, setNumerosAnimados] = useState(false);
  // Estado para tarjeta expandida de estadísticas
  const [estadisticasExpanded, setEstadisticasExpanded] = useState(false);

  // Cargar datos del backend
  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      setCargando(true);

      // Cargar estadísticas
      const resEstadisticas = await adminService.getEstadisticasDashboard();
      if (resEstadisticas.success) {
        setEstadisticas(resEstadisticas.data);
      }

      // Cargar actividades
      const resActividades = await adminService.getRegistroActividad(10);
      if (resActividades.success) {
        setActividades(resActividades.data);
      }

      // Cargar estado del sistema
      const resEstado = await adminService.getEstadoSistema();
      if (resEstado.success) {
        setEstadoSistema(resEstado.data);
      }
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleClickActividad = (id) => {
    setActividadExpandida((prev) => (prev === id ? null : id));
  };

  const abrirModalEstadisticas = () => {
    setModalEstadisticasAbierto(true);
    // Resetear la animación de números
    setNumerosAnimados(false);
    // Activar animación después de un pequeño delay
    setTimeout(() => setNumerosAnimados(true), 100);
  };

  const cerrarModalEstadisticas = () => {
    setModalEstadisticasAbierto(false);
    setEstadisticasExpanded(false);
  };

  // Obtener icono según tipo de actividad
  const getIconoActividad = (tipo) => {
    switch(tipo) {
      case "auditoria":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case "sistema":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        );
      case "configuracion":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      case "usuario":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Título principal */}
      <h1 className="admin-dashboard-title">Hola, Admin</h1>

      {/* Tarjetas superiores */}
      <section className="admin-stats-row">
        <article className="admin-stat-card">
          <div className="admin-stat-icon-top">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
          <h2>Usuarios</h2>
          <p className="admin-stat-number">
            {cargando ? '...' : estadisticas.usuarios}
          </p>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon-top">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
          </div>
          <h2>Instituciones</h2>
          <p className="admin-stat-number">
            {cargando ? '...' : estadisticas.instituciones}
          </p>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon-top">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2>Misiones totales</h2>
          <p className="admin-stat-number">
            {cargando ? '...' : estadisticas.misionesTotales}
          </p>
        </article>

        {/* Tarjeta Ver estadísticas → abre modal */}
        <article
          className={`admin-stat-card admin-stat-card--accent ${estadisticasExpanded ? 'admin-stat-card--expanded' : ''}`}
          onClick={abrirModalEstadisticas}
          onMouseEnter={() => setEstadisticasExpanded(true)}
          onMouseLeave={() => setEstadisticasExpanded(false)}
        >
          <h2>Ver estadísticas</h2>
          <div className="admin-stat-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <p className="admin-stat-hint">
            Haz clic para ver la vista general
          </p>
        </article>
      </section>

      {/* Fila inferior: registro + estado + alertas */}
      <section className="admin-lower-row">
        {/* Registro de actividad */}
        <article className="admin-panel admin-log">
          <header className="admin-panel-header">
            <span>Registro de actividad</span>
            <div className="admin-panel-pulse"></div>
          </header>
          <div className="admin-log-content">
            {actividades.map((act, index) => {
              const expandida = actividadExpandida === act.id;
              return (
                <div
                  key={act.id}
                  className={
                    "admin-log-item" +
                    (expandida ? " admin-log-item--expanded" : "")
                  }
                  onClick={() => handleClickActividad(act.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="admin-log-item-icon">
                    {getIconoActividad(act.tipo)}
                  </div>
                  <div className="admin-log-item-content">
                    <p className="admin-log-date">{act.fecha}</p>
                    <p className="admin-log-title">{act.titulo}</p>

                    {expandida && (
                      <div className="admin-log-extra">
                        <span>
                          <strong>Realizada por:</strong> {act.usuario}
                        </span>
                        <span>
                          <strong>Hora:</strong> {act.hora}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="admin-log-item-arrow">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        {/* Estado del sistema + Alertas */}
        <div className="admin-side-panels">
          {/* Estado del sistema */}
          <article className="admin-panel admin-system">
            <header className="admin-panel-header">Estado del sistema</header>
            <div className="admin-system-content">
              <div className="admin-system-row">
                <span>Base de datos</span>
                <span className={`admin-system-status ${estadoSistema.baseDatos === 'Operativa' ? 'admin-system-status--active' : ''}`}>
                  {estadoSistema.baseDatos === 'Operativa' && <span className="status-dot"></span>}
                  {estadoSistema.baseDatos}
                </span>
              </div>
              <div className="admin-system-row">
                <span>Respaldos</span>
                <span className="admin-system-status">
                  {estadoSistema.respaldos}
                </span>
              </div>
              <button className="admin-system-button">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                </svg>
                Crear respaldo
              </button>
            </div>
          </article>

          {/* Alertas */}
          <article className="admin-panel admin-alerts">
            <header className="admin-panel-header">Alertas</header>
            <div className="admin-alerts-content">
              <div className="admin-alerts-empty-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="admin-alerts-empty">
                No hay alertas pendientes por ahora.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* MODAL de estadísticas generales */}
      {modalEstadisticasAbierto && (
        <div
          className="admin-modal-backdrop"
          onClick={cerrarModalEstadisticas}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="admin-modal-header">
              <h2>Estadísticas generales</h2>
              <button
                className="admin-modal-close"
                onClick={cerrarModalEstadisticas}
                aria-label="Cerrar"
              >
                ×
              </button>
            </header>

            <div className="admin-modal-body">
              {/* Métricas grandes */}
              <div className="admin-modal-metrics">
                <div className={`admin-modal-metric ${numerosAnimados ? 'animated' : ''}`}>
                  <span className="admin-modal-metric-label">
                    Misiones completadas
                  </span>
                  <span className="admin-modal-metric-value">
                    {estadisticas.misionesCompletadas}%
                  </span>
                </div>
                <div className={`admin-modal-metric ${numerosAnimados ? 'animated' : ''}`} style={{ animationDelay: '0.1s' }}>
                  <span className="admin-modal-metric-label">
                    Estudiantes activos
                  </span>
                  <span className="admin-modal-metric-value">
                    {estadisticas.estudiantesActivos}
                  </span>
                </div>
                <div className={`admin-modal-metric ${numerosAnimados ? 'animated' : ''}`} style={{ animationDelay: '0.2s' }}>
                  <span className="admin-modal-metric-label">
                    Instituciones
                  </span>
                  <span className="admin-modal-metric-value">
                    {estadisticas.instituciones}
                  </span>
                </div>
              </div>

              {/* Gráfico simple de ejemplo */}
              <div className="admin-modal-chart">
                <div className="admin-modal-chart-bar admin-modal-chart-bar--1">
                  <span>Sem 1</span>
                </div>
                <div className="admin-modal-chart-bar admin-modal-chart-bar--2">
                  <span>Sem 2</span>
                </div>
                <div className="admin-modal-chart-bar admin-modal-chart-bar--3">
                  <span>Sem 3</span>
                </div>
                <div className="admin-modal-chart-bar admin-modal-chart-bar--4">
                  <span>Sem 4</span>
                </div>
              </div>
            </div>

            <footer className="admin-modal-footer">
              <button
                className="admin-modal-button"
                onClick={cerrarModalEstadisticas}
              >
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;