// src/pages/gm/GMInicio.jsx
// Página de inicio del panel Game Master.
// Dashboard principal con estadísticas y resumen de actividad.

import { useState } from "react";
import "../../styles/gmInicio.css";
import "../../styles/themes.css";

function GMInicio() {
  // Estado para el indicador seleccionado
  const [indicadorSeleccionado, setIndicadorSeleccionado] = useState(null);

  // Datos de ejemplo
  const estadisticas = {
    estudiantesActivos: 35,
    misionesAsignadas: 120,
    misionesPorRevisar: 8,
    horasAcumuladas: "4.2 h"
  };

  const misionesPorRevisar = [
    { id: 1, estudiante: "Alejandra Fernandez", mision: "Resolver ecuaciones de primer grado", fechaEntrega: "15/07/2025" },
    { id: 2, estudiante: "Camila Santis", mision: "Crear diagrama de clases", fechaEntrega: "20/08/2025" },
    { id: 3, estudiante: "Jeremías Cansino", mision: "Crear módulo de pares e impares en Java", fechaEntrega: "17/11/2025" }
  ];

  const estadoAvanceCursos = [
    { nombre: "Curso A", progreso: 8 },
    { nombre: "Curso B", progreso: 65 },
    { nombre: "Curso C", progreso: 40 }
  ];

  const misionesRecientes = [
    { nombre: "Problemas de fracciones", fecha: "Hoy" },
    { nombre: "Ecuaciones básicas", fecha: "Ayer" },
    { nombre: "Funciones lineales", fecha: "La semana pasada" }
  ];

  const indicadoresAvanzados = [
    {
      id: 1,
      nombre: "Progreso promedio por misión",
      descripcion: "Visualiza el avance promedio de todas las misiones asignadas",
      valor: "68%"
    },
    {
      id: 2,
      nombre: "Competitividad por categoría",
      descripcion: "Analiza el nivel de competencia entre estudiantes por cada categoría",
      valor: "Alta"
    },
    {
      id: 3,
      nombre: "Horas semanales estudiadas",
      descripcion: "Promedio de horas dedicadas al estudio por semana",
      valor: "12.5 hrs"
    },
    {
      id: 4,
      nombre: "Dificultades con mayor tasa de error",
      descripcion: "Identifica los temas donde los estudiantes cometen más errores",
      valor: "Álgebra lineal"
    }
  ];

  // Funciones de manejo de eventos
  const handleRevisarMision = (misionId, estudiante, mision) => {
    alert(`Revisando misión de ${estudiante}:\n"${mision}"\n\n(Esta funcionalidad se implementará en el futuro)`);
  };

  const handleIndicadorClick = (indicadorId) => {
    if (indicadorSeleccionado === indicadorId) {
      setIndicadorSeleccionado(null);
    } else {
      setIndicadorSeleccionado(indicadorId);
    }
  };

  return (
    <div className="gm-inicio">
      {/* Header de bienvenida */}
      <div className="gm-inicio-header">
        <h1 className="gm-inicio-title">Hola, profesor Felipe</h1>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="gm-stats-grid">
        <div className="gm-stat-card">
          <h3 className="gm-stat-label">Estudiantes activos</h3>
          <p className="gm-stat-value">{estadisticas.estudiantesActivos}</p>
        </div>

        <div className="gm-stat-card">
          <h3 className="gm-stat-label">Misiones asignadas</h3>
          <p className="gm-stat-value">{estadisticas.misionesAsignadas}</p>
        </div>

        <div className="gm-stat-card">
          <h3 className="gm-stat-label">Misiones por revisar</h3>
          <p className="gm-stat-value">{estadisticas.misionesPorRevisar}</p>
        </div>

        <div className="gm-stat-card">
          <h3 className="gm-stat-label">Horas acumuladas</h3>
          <p className="gm-stat-value">{estadisticas.horasAcumuladas}</p>
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
                          onClick={() => handleRevisarMision(item.id, item.estudiante, item.mision)}
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
            </div>
          </div>

          {/* Estado de avance por curso */}
          <div className="gm-panel">
            <div className="gm-panel-header">
              <h2 className="gm-panel-title">Estado de avance por curso</h2>
            </div>
            <div className="gm-panel-body">
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
            </div>
          </div>

          {/* Indicadores avanzados */}
          <div className="gm-panel">
            <div className="gm-panel-header">
              <h2 className="gm-panel-title">Indicadores avanzados</h2>
            </div>
            <div className="gm-panel-body">
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
              <div className="gm-recent-missions-list">
                {misionesRecientes.map((mision, index) => (
                  <div key={index} className="gm-recent-mission">
                    <div className="gm-recent-mission-info">
                      <div className="gm-recent-mission-title">{mision.nombre}</div>
                      <div className="gm-recent-mission-date">{mision.fecha}</div>
                    </div>
                    <button className="gm-recent-mission-btn">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GMInicio;
