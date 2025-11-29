// src/pages/gm/GMInicio.jsx
// Página de inicio del panel Game Master.
// Dashboard principal con estadísticas y resumen de actividad.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import gmService from "../../services/gmService";
import authService from "../../services/authService";
import "../../styles/gmInicio.css";
import "../../styles/themes.css";

function GMInicio() {
  const navigate = useNavigate();
  const [indicadorSeleccionado, setIndicadorSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para los datos del dashboard
  const [estadisticas, setEstadisticas] = useState({
    estudiantesActivos: 0,
    misionesAsignadas: 0,
    misionesPorRevisar: 0,
    horasAcumuladas: "0 h"
  });
  const [misionesPorRevisar, setMisionesPorRevisar] = useState([]);
  const [estadoAvanceCursos, setEstadoAvanceCursos] = useState([]);
  const [misionesRecientes, setMisionesRecientes] = useState([]);
  const [indicadoresAvanzados, setIndicadoresAvanzados] = useState([]);
  const [nombreGM, setNombreGM] = useState("Profesor");

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener nombre del usuario actual
      const usuario = authService.getCurrentUser();
      if (usuario) {
        setNombreGM(usuario.nombre);
      }

      // Cargar datos del dashboard
      const response = await gmService.getDashboardResumen();

      if (response.success) {
        const { dashboard } = response;

        // Actualizar estadísticas
        setEstadisticas(dashboard.estadisticas);

        // Actualizar misiones por revisar
        setMisionesPorRevisar(dashboard.misionesPorRevisar || []);

        // Actualizar estado de avance de cursos
        setEstadoAvanceCursos(dashboard.estadoAvanceCursos || []);

        // Actualizar misiones recientes
        setMisionesRecientes(dashboard.misionesRecientes || []);

        // Actualizar indicadores avanzados
        setIndicadoresAvanzados(dashboard.indicadoresAvanzados || []);
      }
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
      setError(err.response?.data?.message || "Error al cargar el dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Funciones de manejo de eventos
  const handleRevisarMision = (evaluacionId) => {
    navigate(`/gm/evaluar-mision/${evaluacionId}`);
  };

  const handleVerMision = (misionId) => {
    navigate(`/gm/misiones/gestionar/${misionId}`);
  };

  const handleIndicadorClick = (indicadorId) => {
    if (indicadorSeleccionado === indicadorId) {
      setIndicadorSeleccionado(null);
    } else {
      setIndicadorSeleccionado(indicadorId);
    }
  };

  if (loading) {
    return (
      <div className="gm-inicio">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gm-inicio">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
          <button
            onClick={cargarDashboard}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gm-inicio">
      {/* Header de bienvenida */}
      <div className="gm-inicio-header">
        <h1 className="gm-inicio-title">Hola, {nombreGM}</h1>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="gm-stats-grid">
        <div className="gm-stat-card">
          <h3 className="gm-stat-label">Estudiantes activos</h3>
          <p className="gm-stat-value">{estadisticas.estudiantesActivos || 0}</p>
        </div>

        <div className="gm-stat-card">
          <h3 className="gm-stat-label">Misiones asignadas</h3>
          <p className="gm-stat-value">{estadisticas.misionesAsignadas || 0}</p>
        </div>

        <div className="gm-stat-card">
          <h3 className="gm-stat-label">Misiones por revisar</h3>
          <p className="gm-stat-value">{estadisticas.misionesPorRevisar || 0}</p>
        </div>

        <div className="gm-stat-card">
          <h3 className="gm-stat-label">Horas acumuladas</h3>
          <p className="gm-stat-value">{estadisticas.horasAcumuladas || "0 h"}</p>
        </div>
      </div>

      {/* Grid de contenido */}
      <div className="gm-dashboard-grid">
        {/* Columna izquierda */}
        <div className="gm-dashboard-left">
          {/* Misiones por revisar */}
          <div className="gm-panel">
            <div className="gm-panel-header">
              <h2 className="gm-panel-title">Misiones por revisar</h2>
            </div>
            <div className="gm-missions-table-wrapper">
              {misionesPorRevisar.length > 0 ? (
                <table className="gm-missions-table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Misión</th>
                      <th>Fecha de entrega</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {misionesPorRevisar.map((item) => (
                      <tr key={item.id}>
                        <td className="gm-student-name">{item.estudiante}</td>
                        <td className="gm-mission-desc">{item.mision}</td>
                        <td className="gm-mission-date">{item.fechaEntrega}</td>
                        <td>
                          <button
                            className="gm-mission-action-btn"
                            onClick={() => handleRevisarMision(item.id)}
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            Revisar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No hay misiones pendientes por revisar</p>
                </div>
              )}
            </div>
          </div>

          {/* Estado de avance por curso */}
          <div className="gm-panel">
            <div className="gm-panel-header">
              <h2 className="gm-panel-title">Estado de avance por curso</h2>
            </div>
            <div className="gm-panel-body">
              {estadoAvanceCursos.length > 0 ? (
                <div className="gm-progress-list">
                  {estadoAvanceCursos.map((curso, index) => (
                    <div key={index} className="gm-progress-item">
                      <div className="gm-progress-header">
                        <span className="gm-progress-name">{curso.nombre}</span>
                        <span className="gm-progress-percent">{curso.progreso}%</span>
                      </div>
                      <div className="gm-progress-bar-bg">
                        <div
                          className="gm-progress-bar-fill"
                          style={{ width: `${curso.progreso}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay cursos disponibles</p>
                </div>
              )}
            </div>
          </div>

          {/* Indicadores avanzados */}
          <div className="gm-panel">
            <div className="gm-panel-header">
              <h2 className="gm-panel-title">Indicadores avanzados</h2>
            </div>
            <div className="gm-panel-body">
              {indicadoresAvanzados.length > 0 ? (
                <ul className="gm-indicators-list">
                  {indicadoresAvanzados.map((indicador) => (
                    <li
                      key={indicador.id}
                      className={`gm-indicator-item ${indicadorSeleccionado === indicador.id ? 'active' : ''}`}
                      onClick={() => handleIndicadorClick(indicador.id)}
                    >
                      <div className="gm-indicator-content">
                        <div className="gm-indicator-main">
                          <span className="gm-indicator-bullet"></span>
                          <span className="gm-indicator-name">{indicador.nombre}</span>
                        </div>
                        {indicadorSeleccionado === indicador.id && (
                          <div className="gm-indicator-details">
                            <p className="gm-indicator-description">{indicador.descripcion}</p>
                            <div className="gm-indicator-value-display">
                              <span className="gm-indicator-value-label">Valor actual:</span>
                              <span className="gm-indicator-value-text">{indicador.valor}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <svg
                        className={`gm-indicator-chevron ${indicadorSeleccionado === indicador.id ? 'rotated' : ''}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay indicadores disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="gm-dashboard-right">
          {/* Misiones recientes asignadas */}
          <div className="gm-panel">
            <div className="gm-panel-header">
              <h2 className="gm-panel-title">Misiones recientes asignadas</h2>
            </div>
            <div className="gm-panel-body">
              {misionesRecientes.length > 0 ? (
                <div className="gm-recent-missions-list">
                  {misionesRecientes.map((mision) => (
                    <div key={mision.id} className="gm-recent-mission">
                      <div className="gm-recent-mission-info">
                        <div className="gm-recent-mission-title">{mision.nombre}</div>
                        <div className="gm-recent-mission-date">{mision.fecha}</div>
                      </div>
                      <button
                        className="gm-recent-mission-btn"
                        onClick={() => handleVerMision(mision.id)}
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>No hay misiones recientes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GMInicio;
