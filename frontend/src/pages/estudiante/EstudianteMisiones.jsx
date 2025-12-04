// src/pages/estudiante/EstudianteMisiones.jsx
// Página de misiones del panel de estudiantes

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import estudianteService from "../../services/estudianteService";
import "../../styles/estudianteMisiones.css";

function EstudianteMisiones() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [misiones, setMisiones] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargarMisiones = async () => {
      try {
        setLoading(true);
        const params = {};
        if (cursoSeleccionado) params.curso = cursoSeleccionado;
        if (busqueda) params.busqueda = busqueda;

        const response = await estudianteService.getMisiones(params);
        if (response.success) {
          setMisiones(response.misiones || []);
          // Solo actualizar cursos si no hay uno seleccionado
          if (response.cursos && response.cursos.length > 0 && !cursoSeleccionado) {
            setCursos(response.cursos);
            setCursoSeleccionado(response.cursos[0].id);
          } else if (response.cursos && cursos.length === 0) {
            setCursos(response.cursos);
          }
        }
      } catch (error) {
        console.error("Error al cargar misiones:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarMisiones();
  }, [cursoSeleccionado, busqueda]);

  const handleVerDetalles = (misionId) => {
    navigate(`/estudiante/misiones/${misionId}`);
  };

  const handleEmpezarMision = (misionId) => {
    navigate(`/estudiante/misiones/${misionId}/actividad`);
  };

  const handleReanudarMision = (misionId) => {
    navigate(`/estudiante/misiones/${misionId}/actividad`);
  };

  const getDificultadClass = (dificultad) => {
    return `dificultad-${dificultad.toLowerCase()}`;
  };

  const getEstadoClass = (estado) => {
    return `estado-${estado.toLowerCase().replace(" ", "-").replace("_", "-")}`;
  };

  const capitalizarEstado = (estado) => {
    if (!estado) return "";
    const estados = {
      'en_progreso': 'En progreso',
      'no_iniciada': 'Pendiente',
      'completada': 'Completada',
      'aprobada': 'Aprobada ✓',
      'rechazada': 'Rechazada ✗',
      'revisando': 'En revisión'
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

  if (loading) {
    return (
      <div className="estudiante-misiones" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Cargando misiones...</p>
      </div>
    );
  }

  return (
    <div className="estudiante-misiones">
      {/* Header con título y selector de curso */}
      <div className="misiones-header">
        <div className="misiones-title-section">
          <h1 className="misiones-title">Tus misiones</h1>
          <p className="misiones-subtitle">
            Selecciona una misión y continúa con tu aventura educativa
          </p>
        </div>

        <div className="curso-selector">
          <select
            value={cursoSeleccionado}
            onChange={(e) => setCursoSeleccionado(e.target.value)}
            className="curso-select"
          >
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.nombre}
              </option>
            ))}
          </select>
          <svg
            className="curso-select-icon"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="misiones-busqueda">
        <div className="busqueda-wrapper">
          <svg className="busqueda-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar misión"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="busqueda-input"
          />
        </div>
      </div>

      {/* Grid de misiones */}
      <div className="misiones-grid">
        {misiones.map((mision) => (
          <div key={mision.id} className="mision-card">
            <div className="mision-card-header">
              <h3 className="mision-card-title">{mision.nombre}</h3>
              <span className={`xp-badge ${getDificultadClass(mision.dificultad)}`}>
                {capitalizarDificultad(mision.dificultad)} XP
              </span>
            </div>

            <div className="mision-card-body">
              <div className="mision-info-row">
                <span className={`estado-badge ${getEstadoClass(mision.estado)}`}>
                  {capitalizarEstado(mision.estado)}
                </span>
                <span className="xp-text">+{mision.xp} XP</span>
              </div>

              {/* Mostrar puntuación si está aprobada o rechazada */}
              {(mision.estado === 'aprobada' || mision.estado === 'rechazada') && mision.puntuacion && (
                <div style={{
                  backgroundColor: mision.estado === 'aprobada' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  marginTop: '0.5rem',
                  textAlign: 'center'
                }}>
                  <span style={{
                    fontWeight: 'bold',
                    color: mision.estado === 'aprobada' ? '#22c55e' : '#ef4444'
                  }}>
                    Puntuación: {mision.puntuacion}/100
                  </span>
                </div>
              )}

              {mision.estado !== "no_iniciada" && mision.estado !== 'aprobada' && mision.estado !== 'rechazada' && (
                <div className="progreso-wrapper">
                  <div className="progreso-bar-bg">
                    <div
                      className="progreso-bar-fill"
                      style={{ width: `${mision.progreso}%` }}
                    ></div>
                  </div>
                  <span className="progreso-text">{mision.progreso}%</span>
                </div>
              )}
            </div>

            <div className="mision-card-footer">
              {mision.estado === "en_progreso" && (
                <>
                  <button
                    className="mision-btn btn-primary"
                    onClick={() => handleReanudarMision(mision.id)}
                  >
                    Reanudar
                  </button>
                  <button
                    className="mision-btn btn-secondary"
                    onClick={() => handleVerDetalles(mision.id)}
                  >
                    Ver detalles
                  </button>
                </>
              )}
              {mision.estado === "no_iniciada" && (
                <>
                  <button
                    className="mision-btn btn-primary"
                    onClick={() => handleEmpezarMision(mision.id)}
                  >
                    Empezar
                  </button>
                  <button
                    className="mision-btn btn-secondary"
                    onClick={() => handleVerDetalles(mision.id)}
                  >
                    Ver detalles
                  </button>
                </>
              )}
              {(mision.estado === "completada" || mision.estado === "aprobada" || mision.estado === "rechazada") && (
                <button
                  className="mision-btn btn-secondary btn-full"
                  onClick={() => handleVerDetalles(mision.id)}
                >
                  Ver detalles
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {misiones.length === 0 && (
        <div className="misiones-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>No se encontraron misiones</p>
        </div>
      )}
    </div>
  );
}

export default EstudianteMisiones;
