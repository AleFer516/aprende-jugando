// src/pages/estudiante/EstudianteInicio.jsx
// Página de inicio del panel de estudiante
// Muestra bienvenida, nivel actual, misiones y actividad reciente

import { useNavigate } from "react-router-dom";
import "../../styles/estudianteInicio.css";
import "../../styles/themes.css";

function EstudianteInicio() {
  const navigate = useNavigate();

  // Datos de ejemplo
  const estudiante = {
    nombre: "Alejandra",
    nivel: 5,
    tituloNivel: "Explorador del saber",
    xpActual: 1250,
    xpSiguienteNivel: 1500,
    misionesParaDesbloquear: 2,
  };

  const xpPercentage = Math.min(
    100,
    Math.round((estudiante.xpActual / estudiante.xpSiguienteNivel) * 100)
  );

  const logrosRecientes = [
    {
      id: 1,
      titulo: "Primer explorador",
      descripcion: "Completaste tu primera misión",
      fecha: "23/04/2025",
    },
  ];

  const tusMisiones = [
    {
      id: 1,
      nombre: "Resolver ecuaciones de primer grado",
      dificultad: "Baja",
      xp: 150,
      estado: "En progreso",
      progreso: 65,
    },
    {
      id: 2,
      nombre: "Crear módulo de pares e impares en Java",
      dificultad: "Media",
      xp: 300,
      estado: "Pendiente",
    },
    {
      id: 3,
      nombre: "Crear diagrama de clases",
      dificultad: "Alta",
      xp: 600,
      estado: "Completada",
    },
  ];

  const actividadReciente = [
    {
      id: 1,
      tipo: "mision",
      titulo: "Completaste la misión",
      descripcion: "Fracciones básicas",
      fecha: "15/07/2025",
    },
    {
      id: 2,
      tipo: "asignacion",
      titulo: "Problemas de porcentaje",
      descripcion: "El Game Master te asignó una nueva misión",
      fecha: "Hoy",
    },
    {
      id: 3,
      tipo: "nivel",
      titulo: "Subiste al nivel 5",
      descripcion: "Esta semana",
    },
  ];

  const handleContinuarMision = () => {
    const misionEnProgreso = tusMisiones.find(
      (m) => m.estado === "En progreso"
    );
    if (misionEnProgreso) {
      navigate(`/estudiante/misiones/${misionEnProgreso.id}`);
    }
  };

  const handleEmpezarMision = (misionId) => {
    navigate(`/estudiante/misiones/${misionId}`);
  };

  const handleVerDetalles = (misionId) => {
    navigate(`/estudiante/misiones/${misionId}`);
  };

  const handleVerMas = () => {
    navigate("/estudiante/logros");
  };

  const handleVerTodasLasMisiones = () => {
    navigate("/estudiante/misiones");
  };

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
            {logrosRecientes.map((logro) => (
              <div key={logro.id} className="estudiante-logro-item">
                <div className="estudiante-logro-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="estudiante-logro-info">
                  <h3>{logro.titulo}</h3>
                  <p>{logro.descripcion}</p>
                  <span className="estudiante-logro-fecha">{logro.fecha}</span>
                </div>
              </div>
            ))}
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
                onClick={handleVerTodasLasMisiones}
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
              {tusMisiones.map((mision) => (
                <div key={mision.id} className="estudiante-mision-card">
                  <div className="estudiante-mision-main">
                    <div className="estudiante-mision-icon">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        {mision.estado === "Completada" ? (
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
                          className={`estudiante-mision-dificultad dificultad-${mision.dificultad.toLowerCase()}`}
                        >
                          Dificultad: {mision.dificultad}
                        </span>
                        <span className="estudiante-mision-xp">
                          +{mision.xp} xp
                        </span>
                      </div>
                      {mision.estado === "En progreso" && (
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

                  <div className="estudiante-mision-acciones">
                    <span
                      className={`estudiante-mision-estado-pill estado-${mision.estado
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {mision.estado}
                    </span>

                    {mision.estado === "En progreso" && (
                      <button
                        className="estudiante-mision-btn btn-reanudar"
                        onClick={() => handleEmpezarMision(mision.id)}
                      >
                        Reanudar
                      </button>
                    )}
                    {mision.estado === "Pendiente" && (
                      <button
                        className="estudiante-mision-btn btn-empezar"
                        onClick={() => handleEmpezarMision(mision.id)}
                      >
                        Empezar
                      </button>
                    )}
                    {mision.estado === "Completada" && (
                      <button
                        className="estudiante-mision-btn btn-detalles"
                        onClick={() => handleVerDetalles(mision.id)}
                      >
                        Ver detalles
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
              {actividadReciente.map((actividad) => (
                <div
                  key={actividad.id}
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
                        {actividad.fecha}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EstudianteInicio;
