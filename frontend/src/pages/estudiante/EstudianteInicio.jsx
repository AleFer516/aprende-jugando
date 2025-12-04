// src/pages/estudiante/EstudianteInicio.jsx
// Página de inicio del panel de estudiante
// Muestra bienvenida, nivel actual, misiones y actividad reciente

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import estudianteService from "../../services/estudianteService";
import "../../styles/estudianteInicio.css";
import "../../styles/themes.css";

function EstudianteInicio() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [estudiante, setEstudiante] = useState(null);
  const [logrosRecientes, setLogrosRecientes] = useState([]);
  const [tusMisiones, setTusMisiones] = useState([]);
  const [actividadReciente, setActividadReciente] = useState([]);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const response = await estudianteService.getDashboard();
      if (response.success) {
        setEstudiante(response.dashboard.estudiante);
        setLogrosRecientes(response.dashboard.logrosRecientes || []);
        setTusMisiones(response.dashboard.tusMisiones || []);
        setActividadReciente(response.dashboard.actividadReciente || []);
      }
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    const ahora = new Date();
    const diff = Math.floor((ahora - date) / 1000);

    // Formatear hora
    const hora = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (diff < 86400) return `Hoy a las ${hora}`;
    if (diff < 172800) return `Ayer a las ${hora}`;
    if (diff < 604800) return `${date.toLocaleDateString('es-ES', { weekday: 'long' })} a las ${hora}`;
    return `${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} a las ${hora}`;
  };

  const capitalizarEstado = (estado) => {
    if (!estado) return "";
    const estados = {
      'en_progreso': 'En progreso',
      'no_iniciada': 'Pendiente',
      'completada': 'Completada'
    };
    return estados[estado] || estado;
  };

  const capitalizarDificultad = (dificultad) => {
    if (!dificultad) return "";
    const dificultades = {
      'facil': 'Baja',
      'medio': 'Media',
      'dificil': 'Alta'
    };
    return dificultades[dificultad] || dificultad;
  };

  const xpPercentage = estudiante ? Math.min(
    100,
    Math.round((estudiante.xpActual / estudiante.xpSiguienteNivel) * 100)
  ) : 0;

  const handleContinuarMision = () => {
    // Buscar misión en progreso o no iniciada
    const misionEnProgreso = tusMisiones.find(
      (m) => m.estado === "en_progreso"
    );
    const misionPendiente = tusMisiones.find(
      (m) => m.estado === "no_iniciada"
    );

    const misionSeleccionada = misionEnProgreso || misionPendiente;

    if (misionSeleccionada) {
      // Ir directamente a la actividad
      navigate(`/estudiante/misiones/${misionSeleccionada.id}/actividad`);
    }
  };

  const handleEmpezarMision = (misionId) => {
    console.log('handleEmpezarMision llamado con ID:', misionId);
    // Ir directamente a la actividad
    navigate(`/estudiante/misiones/${misionId}/actividad`);
  };

  const handleVerDetalles = (misionId) => {
    console.log('handleVerDetalles llamado con ID:', misionId);
    navigate(`/estudiante/misiones/${misionId}`);
  };

  const handleVerMas = () => {
    console.log('handleVerMas llamado');
    navigate("/estudiante/logros");
  };

  const handleVerTodasLasMisiones = () => {
    console.log('handleVerTodasLasMisiones llamado');
    navigate("/estudiante/misiones");
  };

  if (loading) {
    return (
      <div className="estudiante-inicio" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Cargando dashboard...</p>
      </div>
    );
  }

  if (!estudiante) {
    return (
      <div className="estudiante-inicio" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--text-muted)' }}>No se pudo cargar la información del estudiante.</p>
      </div>
    );
  }

  return (
    <div className="estudiante-inicio">
      {/* Bienvenida */}
      <div className="estudiante-inicio-header">
        <h1 className="estudiante-inicio-title">
          Bienvenida de nuevo, {estudiante.nombre}!
        </h1>
      </div>

      {/* Primera fila: Nivel + Logros */}
      <div className="estudiante-top-grid">
        {/* Card de nivel y progreso */}
        <div className="estudiante-nivel-card">
          <div className="estudiante-nivel-left">
            <p className="estudiante-nivel-label">
              Estás en el nivel {estudiante.nivel}.
            </p>
            <p className="estudiante-nivel-subtitle">
              Completa{" "}
              <span className="estudiante-nivel-highlight">
                {estudiante.misionesParaDesbloquear} misiones más
              </span>{" "}
              para desbloquear el siguiente logro.
            </p>

            <button
              className="estudiante-continuar-btn"
              onClick={handleContinuarMision}
            >
              Continuar misión
            </button>
          </div>

          <div className="estudiante-nivel-right">
            <div className="estudiante-nivel-circulo-wrapper">
              <div className="estudiante-nivel-circulo">
                <span className="estudiante-nivel-numero">
                  {estudiante.nivel}
                </span>
              </div>
              <span className="estudiante-nivel-chip">NIVEL</span>
            </div>

            <div className="estudiante-nivel-info">
              <span className="estudiante-nivel-titulo">
                {estudiante.tituloNivel}
              </span>
              <div className="estudiante-xp-row">
                <span className="estudiante-xp-label">XP acumulada</span>
                <span className="estudiante-xp-valor">
                  {estudiante.xpActual} / {estudiante.xpSiguienteNivel}
                </span>
              </div>
              <div className="estudiante-xp-bar-bg">
                <div
                  className="estudiante-xp-bar-fill"
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Logros recientes (card superior derecha) */}
        <div className="estudiante-logros-card">
          <div className="estudiante-panel-header">
            <h2>Logros recientes</h2>
          </div>

          <div className="estudiante-logros-lista">
            {logrosRecientes && logrosRecientes.length > 0 ? (
              logrosRecientes.map((logro, index) => (
                <div key={logro.id || `logro-${index}`} className="estudiante-logro-item">
                  <div className="estudiante-logro-icon">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="estudiante-logro-info">
                    <h3>{logro.titulo}</h3>
                    <p>{logro.descripcion}</p>
                    <span className="estudiante-logro-fecha">{formatearFecha(logro.fecha)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                Aún no has desbloqueado logros
              </p>
            )}
          </div>

          <button className="estudiante-ver-mas-btn" onClick={handleVerMas}>
            Ver más
          </button>
        </div>
      </div>

      {/* Segunda fila: Tus misiones + Actividad reciente */}
      <div className="estudiante-inicio-grid">
        {/* Columna izquierda: Tus misiones */}
        <div className="estudiante-inicio-left">
          <div className="estudiante-panel">
            <div className="estudiante-panel-header estudiante-panel-header-inline">
              <h2>Tus misiones</h2>
              <button
                className="estudiante-ver-todas-btn"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Click en Ver todas las misiones');
                  handleVerTodasLasMisiones();
                }}
                style={{ cursor: 'pointer' }}
              >
                Ver todas las misiones
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="estudiante-misiones-lista">
              {tusMisiones && tusMisiones.length > 0 ? (
                tusMisiones.map((mision, index) => (
                  <div
                    key={mision.id || `mision-${index}`}
                    className="estudiante-mision-card"
                  >
                  <div
                    className="estudiante-mision-main"
                    onClick={() => handleEmpezarMision(mision.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="estudiante-mision-icon">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        {mision.estado === "completada" ? (
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        ) : (
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        )}
                      </svg>
                    </div>

                    <div className="estudiante-mision-info">
                      <h3 className="estudiante-mision-nombre">
                        {mision.nombre}
                      </h3>
                      <div className="estudiante-mision-meta">
                        <span
                          className={`estudiante-mision-dificultad dificultad-${mision.dificultad}`}
                        >
                          Dificultad: {capitalizarDificultad(mision.dificultad)}
                        </span>
                        <span className="estudiante-mision-xp">
                          +{mision.xp} xp
                        </span>
                      </div>
                      {mision.estado === "en_progreso" && (
                        <div className="estudiante-mision-progress">
                          <div className="estudiante-mision-progress-bg">
                            <div
                              className="estudiante-mision-progress-fill"
                              style={{ width: `${mision.progreso}%` }}
                            ></div>
                          </div>
                          <span className="estudiante-mision-progress-label">
                            {mision.progreso}% completado
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="estudiante-mision-acciones" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
                    <span
                      className={`estudiante-mision-estado-pill estado-${mision.estado.replace("_", "-")}`}
                    >
                      {capitalizarEstado(mision.estado)}
                    </span>

                    {mision.estado === "en_progreso" && (
                      <button
                        className="estudiante-mision-btn btn-reanudar"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Click en Reanudar, ID:', mision.id);
                          handleEmpezarMision(mision.id);
                        }}
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      >
                        Reanudar
                      </button>
                    )}
                    {mision.estado === "no_iniciada" && (
                      <button
                        className="estudiante-mision-btn btn-empezar"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Click en Empezar, ID:', mision.id);
                          handleEmpezarMision(mision.id);
                        }}
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      >
                        Empezar
                      </button>
                    )}
                    {mision.estado === "completada" && (
                      <button
                        className="estudiante-mision-btn btn-detalles"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Click en Ver detalles, ID:', mision.id);
                          handleVerDetalles(mision.id);
                        }}
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      >
                        Ver detalles
                      </button>
                    )}
                  </div>
                </div>
              ))
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No tienes misiones asignadas
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha: Actividad reciente */}
        <div className="estudiante-inicio-right">
          <div className="estudiante-panel">
            <div className="estudiante-panel-header">
              <h2>Actividad reciente</h2>
            </div>

            <div className="estudiante-actividad-lista">
              {actividadReciente && actividadReciente.length > 0 ? (
                actividadReciente.map((actividad, index) => (
                  <div
                    key={`actividad-${actividad.tipo}-${index}`}
                    className="estudiante-actividad-item"
                  >
                  <div
                    className={`estudiante-actividad-icon tipo-${actividad.tipo}`}
                  >
                    {actividad.tipo === "mision" && (
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586 7.707 11.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {actividad.tipo === "asignacion" && (
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {actividad.tipo === "nivel" && (
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="estudiante-actividad-info">
                    <h3>{actividad.titulo}</h3>
                    {actividad.descripcion && <p>{actividad.descripcion}</p>}
                    {actividad.fecha && (
                      <span className="estudiante-actividad-fecha">
                        {formatearFecha(actividad.fecha)}
                      </span>
                    )}
                  </div>
                </div>
              ))
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No hay actividad reciente
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EstudianteInicio;
