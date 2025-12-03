// src/pages/estudiante/EstudianteLogros.jsx
// Página de logros del panel de estudiantes

import { useState, useEffect } from "react";
import estudianteService from "../../services/estudianteService";
import "../../styles/estudianteLogros.css";

function EstudianteLogros() {
  const [logros, setLogros] = useState([]);
  const [estadisticas, setEstadisticas] = useState({ total: 0, desbloqueados: 0, porcentaje: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarLogros();
  }, []);

  const cargarLogros = async () => {
    try {
      setLoading(true);
      const response = await estudianteService.getLogros();
      if (response.success) {
        setLogros(response.logros);
        setEstadisticas(response.estadisticas);
      }
    } catch (error) {
      console.error("Error al cargar logros:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCardClass = (logro) => {
    const base = "logro-card";
    if (!logro.desbloqueado) return `${base} logro-card-bloqueado`;

    // Asignar color basado en el tipo de requisito
    if (logro.requisito_tipo === 'nivel') return `${base} logro-card-oro`;
    if (logro.requisito_tipo === 'misiones_completadas') return `${base} logro-card-azul`;
    if (logro.requisito_tipo === 'experiencia') return `${base} logro-card-cian`;
    if (logro.requisito_tipo === 'monedas') return `${base} logro-card-oro`;
    return `${base} logro-card-azul`;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="estudiante-logros-page">
        <div className="logros-bg"></div>
        <div className="logros-overlay">
          <div className="logros-header">
            <h1 className="logros-title">Logros</h1>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="estudiante-logros-page">
      {/* 🔹 Fondo fijo */}
      <div className="logros-bg"></div>

      {/* 🔹 Contenido encima del fondo */}
      <div className="logros-overlay">
        <div className="logros-header">
          <h1 className="logros-title">Logros</h1>
          <p className="logros-subtitle">
            Estos son los hitos que has alcanzado,
            <br />
            <span className="logros-subtitle-strong">
              ¡Sigue aprendiendo para conseguir más recompensas!
            </span>
          </p>
          <div className="logros-stats">
            <div className="logro-stat-item">
              <span className="logro-stat-value">{estadisticas.desbloqueados}</span>
              <span className="logro-stat-label">Desbloqueados</span>
            </div>
            <div className="logro-stat-item">
              <span className="logro-stat-value">{estadisticas.total}</span>
              <span className="logro-stat-label">Total</span>
            </div>
            <div className="logro-stat-item">
              <span className="logro-stat-value">{estadisticas.porcentaje}%</span>
              <span className="logro-stat-label">Progreso</span>
            </div>
          </div>
        </div>

        {/* Grid de tarjetas de logros */}
        <div className="logros-grid">
          {logros.map((logro) => (
            <div key={logro.id} className={getCardClass(logro)}>
              <div className="logro-icon-wrapper">
                {!logro.desbloqueado ? (
                  <div className="logro-icon-circle locked">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        d="M12 3a4 4 0 00-4 4v3H7a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-1V7a4 4 0 00-4-4z"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 14v3"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="0.75" fill="currentColor" />
                    </svg>
                  </div>
                ) : (
                  <div className={`logro-icon-circle ${logro.requisito_tipo === 'nivel' ? 'oro' : logro.requisito_tipo === 'misiones_completadas' ? 'azul' : 'cian'}`}>
                    {logro.icono ? (
                      <span style={{ fontSize: '2rem' }}>{logro.icono}</span>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle
                          cx="12"
                          cy="9"
                          r="5"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 14l-2 7 5-3 5 3-2-7"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 9l1 1 2-2"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                )}
              </div>

              <div className="logro-info">
                <h3 className="logro-title">{logro.nombre}</h3>
                <p className="logro-description">{logro.descripcion}</p>

                {!logro.desbloqueado && (
                  <>
                    <div className="logro-requisito">
                      <span className="logro-requisito-label">Requisito:</span>
                      <span className="logro-requisito-text">{logro.requisito}</span>
                    </div>
                    <div className="logro-progreso">
                      <div className="logro-progreso-bar">
                        <div
                          className="logro-progreso-fill"
                          style={{ width: `${logro.progreso}%` }}
                        ></div>
                      </div>
                      <span className="logro-progreso-text">
                        {logro.progresoActual} / {logro.requisito_valor}
                      </span>
                    </div>
                  </>
                )}

                {logro.desbloqueado && logro.fecha_desbloqueo && (
                  <span className="logro-date">
                    Desbloqueado el {formatearFecha(logro.fecha_desbloqueo)}
                  </span>
                )}

                {!logro.desbloqueado && (
                  <span className="logro-tag-bloqueado">Bloqueado</span>
                )}

                {logro.xp_recompensa > 0 && (
                  <span className="logro-xp-reward">
                    +{logro.xp_recompensa} XP
                  </span>
                )}
              </div>

              {logro.desbloqueado && (
                <div className="logro-ribbon">
                  <span>¡Desbloqueado!</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {logros.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            <p>No hay logros disponibles en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EstudianteLogros;
