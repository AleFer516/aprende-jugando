// src/pages/gm/GMEvaluaciones.jsx
// Página de evaluaciones del Game Master.
// Lista entregas de evaluaciones con filtros y botón Revisar.

import { useState } from "react";
import "../../styles/gmEvaluaciones.css";
import "../../styles/themes.css";

function GMEvaluaciones() {
  const evaluacionesData = [
    {
      id: 1,
      rut: "12.345.678-9",
      nombre: "Alejandra Fernandez",
      curso: "3° Medio A",
      categoria: "Matemáticas",
      fechaEntrega: "15/07/2025",
      estado: "Pendiente",
      reciente: true
    },
    {
      id: 2,
      rut: "12.345.678-9",
      nombre: "Jeremías Cancino",
      curso: "3° Medio A",
      categoria: "Ciencias",
      fechaEntrega: "20/07/2025",
      estado: "Finalizado",
      reciente: true
    },
    {
      id: 3,
      rut: "12.345.678-9",
      nombre: "Camila Santis",
      curso: "2° Medio B",
      categoria: "Lenguaje",
      fechaEntrega: "11/09/2025",
      estado: "Finalizado",
      reciente: false
    },
    {
      id: 4,
      rut: "23.456.789-0",
      nombre: "Diego Morales",
      curso: "1° Medio C",
      categoria: "Matemáticas",
      fechaEntrega: "03/05/2025",
      estado: "Pendiente",
      reciente: false
    },
    {
      id: 5,
      rut: "23.456.789-0",
      nombre: "Valentina Torres",
      curso: "2° Medio B",
      categoria: "Ciencias",
      fechaEntrega: "28/06/2025",
      estado: "Finalizado",
      reciente: true
    }
  ];

  const [evaluaciones] = useState(evaluacionesData);
  const [filtroCurso, setFiltroCurso] = useState("Todos");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [soloRecientes, setSoloRecientes] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Valores únicos para selects
  const cursosUnicos = ["Todos", ...new Set(evaluaciones.map((e) => e.curso))];
  const categoriasUnicas = ["Todas", ...new Set(evaluaciones.map((e) => e.categoria))];
  const estados = ["Todos", "Pendiente", "Finalizado"];

  // Aplicar filtros
  const evaluacionesFiltradas = evaluaciones.filter((ev) => {
    const cumpleCurso = filtroCurso === "Todos" || ev.curso === filtroCurso;
    const cumpleCategoria =
      filtroCategoria === "Todas" || ev.categoria === filtroCategoria;
    const cumpleEstado = filtroEstado === "Todos" || ev.estado === filtroEstado;
    const cumpleReciente = !soloRecientes || ev.reciente;

    const textoBusqueda = `${ev.rut} ${ev.nombre} ${ev.curso} ${ev.categoria} ${ev.estado}`;
    const cumpleBusqueda = textoBusqueda
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    return (
      cumpleCurso && cumpleCategoria && cumpleEstado && cumpleReciente && cumpleBusqueda
    );
  });

  const handleRevisar = (ev) => {
    alert(
      `Revisar evaluación:\n\n` +
        `Estudiante: ${ev.nombre}\n` +
        `RUT: ${ev.rut}\n` +
        `Curso: ${ev.curso}\n` +
        `Categoría: ${ev.categoria}\n` +
        `Fecha de entrega: ${ev.fechaEntrega}\n` +
        `Estado: ${ev.estado}\n\n` +
        `(Vista detallada se implementará más adelante)`
    );
  };

  return (
    <div className="gm-evaluaciones">
      {/* Header */}
      <div className="gm-evaluaciones-header">
        <h1 className="gm-evaluaciones-title">Evaluaciones</h1>
      </div>

      {/* Filtros (estilo igual a Estudiantes) */}
      <div className="gm-evaluaciones-filters">
        <div className="gm-filter-group">
          <label>Curso:</label>
          <select
            className="gm-evaluaciones-select"
            value={filtroCurso}
            onChange={(e) => setFiltroCurso(e.target.value)}
          >
            {cursosUnicos.map((curso) => (
              <option key={curso} value={curso}>
                {curso}
              </option>
            ))}
          </select>
        </div>

        <div className="gm-filter-group">
          <label>Categoría:</label>
          <select
            className="gm-evaluaciones-select"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            {categoriasUnicas.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="gm-filter-group">
          <label>Estado:</label>
          <select
            className="gm-evaluaciones-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            {estados.map((est) => (
              <option key={est} value={est}>
                {est}
              </option>
            ))}
          </select>
        </div>

        <div className="gm-filter-group gm-search-group">
          <label>Buscar:</label>
          <div className="gm-evaluaciones-search-wrapper">
            <svg className="gm-search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              className="gm-evaluaciones-search-input"
              placeholder="Buscar por nombre o RUT"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Checkbox de recientes */}
      <div className="gm-evaluaciones-extra">
        <label className="gm-evaluaciones-checkbox">
          <input
            type="checkbox"
            checked={soloRecientes}
            onChange={(e) => setSoloRecientes(e.target.checked)}
          />
          <span className="gm-evaluaciones-checkbox-custom" />
          <span>Solo entregas recientes</span>
        </label>
      </div>

      {/* Contador de resultados */}
      <div className="gm-evaluaciones-count">
        Mostrando {evaluacionesFiltradas.length} de {evaluaciones.length} evaluaciones
      </div>

      {/* Tabla en panel */}
      <div className="gm-evaluaciones-table-container">
        <div className="gm-evaluaciones-table-wrapper">
          <table className="gm-evaluaciones-table">
            <thead>
              <tr>
                <th>Rut</th>
                <th>Nombre</th>
                <th>Fecha de entrega</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {evaluacionesFiltradas.length > 0 ? (
                evaluacionesFiltradas.map((ev) => (
                  <tr key={ev.id}>
                    <td className="gm-evaluacion-rut">{ev.rut}</td>
                    <td className="gm-evaluacion-nombre">{ev.nombre}</td>
                    <td className="gm-evaluacion-fecha">{ev.fechaEntrega}</td>
                    <td>
                      <span
                        className={
                          "gm-evaluacion-estado-badge " +
                          (ev.estado === "Pendiente"
                            ? "pendiente"
                            : "finalizado")
                        }
                      >
                        {ev.estado}
                      </span>
                    </td>
                    <td>
                      <button
                        className="gm-evaluaciones-revisar-btn"
                        onClick={() => handleRevisar(ev)}
                      >
                        Revisar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="gm-evaluaciones-no-results">
                    <div className="gm-evaluaciones-no-results-content">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>No se encontraron evaluaciones que coincidan con los filtros.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GMEvaluaciones;
