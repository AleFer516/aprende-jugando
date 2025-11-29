// src/pages/estudiante/EstudianteMisiones.jsx
// Página de misiones del panel de estudiantes

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/estudianteMisiones.css";

function EstudianteMisiones() {
  const navigate = useNavigate();
  const [cursoSeleccionado, setCursoSeleccionado] = useState("Curso A");
  const [busqueda, setBusqueda] = useState("");

  // Datos de ejemplo de misiones
  const misiones = [
    {
      id: 1,
      nombre: "Resolver ecuaciones de primer grado",
      xp: 150,
      dificultad: "Baja",
      estado: "En progreso",
      progreso: 60,
      curso: "Curso A",
    },
    {
      id: 2,
      nombre: "Introducción a las fracciones",
      xp: 300,
      dificultad: "Media",
      estado: "Pendiente",
      progreso: 0,
      curso: "Curso A",
    },
    {
      id: 3,
      nombre: "Datos gráficos y estadísticos",
      xp: 450,
      dificultad: "Alta",
      estado: "Completada",
      progreso: 100,
      curso: "Curso A",
    },
    {
      id: 4,
      nombre: "Problemas de geometría",
      xp: 200,
      dificultad: "Baja",
      estado: "En progreso",
      progreso: 10,
      curso: "Curso A",
    },
    {
      id: 5,
      nombre: "Introducción a POO con Java",
      xp: 350,
      dificultad: "Media",
      estado: "Completada",
      progreso: 100,
      curso: "Curso A",
    },
    {
      id: 6,
      nombre: "Datos gráficos y estadísticos",
      xp: 450,
      dificultad: "Alta",
      estado: "En progreso",
      progreso: 27,
      curso: "Curso A",
    },
  ];

  const cursos = ["Curso A", "Curso B", "Curso C"];

  const misionesFiltradas = misiones.filter(
    (mision) =>
      mision.curso === cursoSeleccionado &&
      mision.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

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
    return `estado-${estado.toLowerCase().replace(" ", "-")}`;
  };

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
              <option key={curso} value={curso}>
                {curso}
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
        {misionesFiltradas.map((mision) => (
          <div key={mision.id} className="mision-card">
            <div className="mision-card-header">
              <h3 className="mision-card-title">{mision.nombre}</h3>
              <span className={`xp-badge ${getDificultadClass(mision.dificultad)}`}>
                {mision.dificultad} XP
              </span>
            </div>

            <div className="mision-card-body">
              <div className="mision-info-row">
                <span className={`estado-badge ${getEstadoClass(mision.estado)}`}>
                  {mision.estado}
                </span>
                <span className="xp-text">+{mision.xp} XP</span>
              </div>

              {mision.estado !== "Pendiente" && (
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
              {mision.estado === "En progreso" && (
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
              {mision.estado === "Pendiente" && (
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
              {mision.estado === "Completada" && (
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

      {misionesFiltradas.length === 0 && (
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
