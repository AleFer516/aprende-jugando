// src/pages/gm/GMEvaluaciones.jsx
// Página de evaluaciones del Game Master.
// Lista entregas de evaluaciones con filtros y botón Revisar.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/gmEvaluaciones.css";
import "../../styles/themes.css";

function GMEvaluaciones() {
  const navigate = useNavigate();

  const [cursos, setCursos] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [soloRecientes, setSoloRecientes] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargar cursos al montar el componente
  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      setCargando(true);
      setError(null);
      const response = await api.get('/gm/evaluaciones/cursos');
      setCursos(response.data.cursos || []);
    } catch (err) {
      console.error('Error al cargar cursos:', err);
      setError('Error al cargar los cursos');
    } finally {
      setCargando(false);
    }
  };

  const cargarEvaluacionesCurso = async (cursoId) => {
    try {
      setCargando(true);
      setError(null);
      const response = await api.get(`/gm/evaluaciones/cursos/${cursoId}`);
      setEvaluaciones(response.data.evaluaciones || []);
    } catch (err) {
      console.error('Error al cargar evaluaciones:', err);
      setError('Error al cargar las evaluaciones del curso');
      setEvaluaciones([]);
    } finally {
      setCargando(false);
    }
  };

  // Obtener evaluaciones del curso seleccionado
  const evaluacionesActuales = evaluaciones;

  // Valores únicos para selects
  const categoriasUnicas = ["Todas", ...new Set(evaluacionesActuales.map((e) => e.categoria))];
  const estados = ["Todos", "Pendiente", "Finalizado"];

  // Aplicar filtros
  const evaluacionesFiltradas = evaluacionesActuales.filter((ev) => {
    const cumpleCategoria =
      filtroCategoria === "Todas" || ev.categoria === filtroCategoria;
    const cumpleEstado = filtroEstado === "Todos" || ev.estado === filtroEstado;
    const cumpleReciente = !soloRecientes || ev.reciente;

    const textoBusqueda = `${ev.rut} ${ev.nombre} ${ev.categoria} ${ev.estado}`;
    const cumpleBusqueda = textoBusqueda
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    return (
      cumpleCategoria && cumpleEstado && cumpleReciente && cumpleBusqueda
    );
  });

  const handleSeleccionarCurso = async (curso) => {
    setCursoSeleccionado(curso);
    // Resetear filtros
    setFiltroCategoria("Todas");
    setFiltroEstado("Todos");
    setSoloRecientes(false);
    setBusqueda("");
    // Cargar evaluaciones del curso
    await cargarEvaluacionesCurso(curso.id);
  };

  const handleVolverACursos = () => {
    setCursoSeleccionado(null);
    setEvaluaciones([]);
  };

  const handleRevisar = (ev) => {
    navigate(`/gm/evaluaciones/${ev.id}`);
  };

  return (
    <div className="gm-evaluaciones">
      {/* Header */}
      <div className="gm-evaluaciones-header">
        <h1 className="gm-evaluaciones-title">Evaluaciones</h1>
      </div>

      {!cursoSeleccionado ? (
        /* Vista 1: Selección de curso */
        <div className="gm-evaluaciones-cursos-container">
          <p className="gm-evaluaciones-subtitle">Selecciona un curso para revisar las evaluaciones</p>

          {error && (
            <div className="gm-evaluaciones-error">
              <p>{error}</p>
            </div>
          )}

          {cargando ? (
            <div className="gm-evaluaciones-loading">
              <p>Cargando cursos...</p>
            </div>
          ) : (
            <div className="gm-evaluaciones-table-container">
              <div className="gm-evaluaciones-table-wrapper">
                <table className="gm-evaluaciones-table">
                  <thead>
                    <tr>
                      <th>Curso</th>
                      <th>Código</th>
                      <th>Categoría</th>
                      <th>Evaluaciones</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cursos.length > 0 ? (
                      cursos.map((curso) => (
                        <tr key={curso.id}>
                          <td className="gm-curso-nombre">{curso.nombre}</td>
                          <td className="gm-curso-codigo">{curso.codigo || 'N/A'}</td>
                          <td className="gm-curso-categoria">{curso.categoria}</td>
                          <td className="gm-curso-total">{curso.totalEvaluaciones}</td>
                          <td>
                            <button
                              className="gm-evaluaciones-revisar-btn"
                              onClick={() => handleSeleccionarCurso(curso)}
                            >
                              Ver evaluaciones
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="gm-evaluaciones-no-results">
                          <div className="gm-evaluaciones-no-results-content">
                            <p>No hay cursos disponibles.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Vista 2: Evaluaciones del curso seleccionado */
        <>
          {/* Botón volver */}
          <div className="gm-evaluaciones-volver-container">
            <button className="gm-evaluaciones-volver-btn" onClick={handleVolverACursos}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Volver a cursos
            </button>
            <span className="gm-evaluaciones-curso-actual">
              Curso: <strong>{cursoSeleccionado.nombre}</strong>
            </span>
          </div>

          {/* Filtros */}
          <div className="gm-evaluaciones-filters">
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
            Mostrando {evaluacionesFiltradas.length} de {evaluacionesActuales.length} evaluaciones
          </div>

          {/* Tabla de evaluaciones */}
          {error && (
            <div className="gm-evaluaciones-error">
              <p>{error}</p>
            </div>
          )}

          {cargando ? (
            <div className="gm-evaluaciones-loading">
              <p>Cargando evaluaciones...</p>
            </div>
          ) : (
            <div className="gm-evaluaciones-table-container">
              <div className="gm-evaluaciones-table-wrapper">
                <table className="gm-evaluaciones-table">
                  <thead>
                    <tr>
                      <th>Rut</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
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
                          <td className="gm-evaluacion-categoria">{ev.categoria || 'General'}</td>
                          <td className="gm-evaluacion-fecha">
                            {ev.fechaEntrega
                              ? new Date(ev.fechaEntrega).toLocaleDateString('es-CL', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })
                              : 'N/A'
                            }
                          </td>
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
                        <td colSpan="6" className="gm-evaluaciones-no-results">
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
          )}
        </>
      )}
    </div>
  );
}

export default GMEvaluaciones;
