// src/pages/gm/GMMisiones.jsx
// Página de gestión de misiones del Game Master.
// Lista de misiones con búsqueda, filtros y acción de gestión.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/gmMisiones.css";
import "../../styles/adminUsuarios.css"; // Para usar los estilos del modal
import "../../styles/themes.css";

function GMMisiones() {
  const navigate = useNavigate();
  // Datos de ejemplo de misiones
  const misionesData = [
    {
      id: 1,
      titulo: "Problemas de fracciones",
      descripcion: "Resolver ejercicios de fracciones",
      categoria: "Matemáticas",
      dificultad: "Baja"
    },
    {
      id: 2,
      titulo: "Tipos de energía",
      descripcion: "Identificar diferentes tipos de energía",
      categoria: "Ciencias",
      dificultad: "Media"
    },
    {
      id: 3,
      titulo: "Poema de primavera",
      descripcion: "Escribir un poema sobre la primavera",
      categoria: "Lenguaje",
      dificultad: "Alta"
    },
    {
      id: 4,
      titulo: "Ecuaciones de primer grado",
      descripcion: "Resolver ecuaciones lineales con una incógnita",
      categoria: "Matemáticas",
      dificultad: "Media"
    },
    {
      id: 5,
      titulo: "Ciclo del agua",
      descripcion: "Explicar las etapas del ciclo del agua",
      categoria: "Ciencias",
      dificultad: "Baja"
    }
  ];

  const [misiones] = useState(misionesData);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroDificultad, setFiltroDificultad] = useState("Todas");
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    dificultad: "Alta",
    categoria: "Matemáticas",
    objetivoAprendizaje: "",
    competencias: [""],
    pistas: [""],
    descripcion: "",
    competenciasDescripcion: ""
  });
  const [errores, setErrores] = useState({});

  // Categorías y dificultades para los combos
  const categoriasUnicas = ["Todas", ...new Set(misiones.map((m) => m.categoria))];
  const categoriasDisponibles = ["Matemáticas", "Ciencias", "Lenguaje", "Historia", "Arte"];
  const dificultades = ["Todas", "Baja", "Media", "Alta"];
  const dificultadesDisponibles = ["Baja", "Media", "Alta"];

  // Filtrar misiones por búsqueda + filtros
  const misionesFiltradas = misiones.filter((mision) => {
    const texto = `${mision.titulo} ${mision.descripcion} ${mision.categoria} ${mision.dificultad}`;
    const cumpleBusqueda = texto.toLowerCase().includes(busqueda.toLowerCase());
    const cumpleCategoria =
      filtroCategoria === "Todas" || mision.categoria === filtroCategoria;
    const cumpleDificultad =
      filtroDificultad === "Todas" || mision.dificultad === filtroDificultad;

    return cumpleBusqueda && cumpleCategoria && cumpleDificultad;
  });

  // Validar formulario
  const esFormularioValido = () => {
    return (
      formData.titulo.trim().length >= 3 &&
      formData.objetivoAprendizaje.trim().length >= 10 &&
      formData.competencias.some(c => c.trim().length > 0) &&
      formData.pistas.some(p => p.trim().length > 0) &&
      formData.descripcion.trim().length >= 10 &&
      formData.competenciasDescripcion.trim().length >= 10
    );
  };

  // Manejadores de modal
  const abrirModalCrear = () => {
    setFormData({
      titulo: "",
      dificultad: "Alta",
      categoria: "Matemáticas",
      objetivoAprendizaje: "",
      competencias: [""],
      pistas: [""],
      descripcion: "",
      competenciasDescripcion: ""
    });
    setErrores({});
    setModalCrearAbierto(true);
  };

  const cerrarModalCrear = () => {
    setModalCrearAbierto(false);
    setFormData({
      titulo: "",
      dificultad: "Alta",
      categoria: "Matemáticas",
      objetivoAprendizaje: "",
      competencias: [""],
      pistas: [""],
      descripcion: "",
      competenciasDescripcion: ""
    });
    setErrores({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Agregar competencia
  const agregarCompetencia = () => {
    setFormData(prev => ({
      ...prev,
      competencias: [...prev.competencias, ""]
    }));
  };

  // Actualizar competencia específica
  const actualizarCompetencia = (index, valor) => {
    const nuevasCompetencias = [...formData.competencias];
    nuevasCompetencias[index] = valor;
    setFormData(prev => ({
      ...prev,
      competencias: nuevasCompetencias
    }));
  };

  // Eliminar competencia
  const eliminarCompetencia = (index) => {
    if (formData.competencias.length > 1) {
      const nuevasCompetencias = formData.competencias.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        competencias: nuevasCompetencias
      }));
    }
  };

  // Agregar pista
  const agregarPista = () => {
    setFormData(prev => ({
      ...prev,
      pistas: [...prev.pistas, ""]
    }));
  };

  // Actualizar pista específica
  const actualizarPista = (index, valor) => {
    const nuevasPistas = [...formData.pistas];
    nuevasPistas[index] = valor;
    setFormData(prev => ({
      ...prev,
      pistas: nuevasPistas
    }));
  };

  // Eliminar pista
  const eliminarPista = (index) => {
    if (formData.pistas.length > 1) {
      const nuevasPistas = formData.pistas.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        pistas: nuevasPistas
      }));
    }
  };

  const handleCrearMision = (e) => {
    e.preventDefault();

    const nuevosErrores = {};

    if (formData.titulo.trim().length < 3) {
      nuevosErrores.titulo = "El título debe tener al menos 3 caracteres";
    }

    if (formData.objetivoAprendizaje.trim().length < 10) {
      nuevosErrores.objetivoAprendizaje = "El objetivo debe tener al menos 10 caracteres";
    }

    if (formData.descripcion.trim().length < 10) {
      nuevosErrores.descripcion = "La descripción debe tener al menos 10 caracteres";
    }

    if (formData.competenciasDescripcion.trim().length < 10) {
      nuevosErrores.competenciasDescripcion = "Las competencias deben tener al menos 10 caracteres";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    console.log("Crear misión:", formData);
    alert("Misión creada exitosamente\n(Esta funcionalidad se conectará al backend próximamente)");
    cerrarModalCrear();
  };

  const handleGestionarMision = (mision) => {
    navigate(`/gm/misiones/${mision.id}`);
  };

  return (
    <div className="gm-misiones">
      {/* Header */}
      <div className="gm-misiones-header">
        <h1 className="gm-misiones-title">Misiones</h1>

        <button className="gm-misiones-btn-crear" onClick={abrirModalCrear}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Crear misión
        </button>
      </div>

      {/* Filtros (estilo igual a Estudiantes) */}
      <div className="gm-misiones-filters">
        <div className="gm-filter-group">
          <label>Categoría:</label>
          <select
            className="gm-misiones-select"
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
          <label>Dificultad:</label>
          <select
            className="gm-misiones-select"
            value={filtroDificultad}
            onChange={(e) => setFiltroDificultad(e.target.value)}
          >
            {dificultades.map((dif) => (
              <option key={dif} value={dif}>
                {dif}
              </option>
            ))}
          </select>
        </div>

        <div className="gm-filter-group gm-search-group">
          <label>Buscar:</label>
          <div className="gm-misiones-search-wrapper">
            <svg className="gm-search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              className="gm-misiones-search-input"
              placeholder="Buscar por título"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="gm-misiones-count">
        Mostrando {misionesFiltradas.length} de {misiones.length} misiones
      </div>

      {/* Tabla en panel (mismo estilo que Estudiantes) */}
      <div className="gm-misiones-table-container">
        <div className="gm-misiones-table-wrapper">
          <table className="gm-misiones-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Dificultad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {misionesFiltradas.length > 0 ? (
                misionesFiltradas.map((mision) => (
                  <tr key={mision.id}>
                    <td className="gm-mision-titulo">{mision.titulo}</td>
                    <td className="gm-mision-descripcion">{mision.descripcion}</td>
                    <td className="gm-mision-categoria">{mision.categoria}</td>
                    <td>
                      <span
                        className={
                          "gm-mision-dificultad " +
                          `gm-mision-dificultad-${mision.dificultad.toLowerCase()}`
                        }
                      >
                        {mision.dificultad}
                      </span>
                    </td>
                    <td>
                      <button
                        className="gm-misiones-gestionar-btn"
                        onClick={() => handleGestionarMision(mision)}
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="gm-misiones-no-results">
                    <div className="gm-misiones-no-results-content">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>No se encontraron misiones que coincidan con los filtros aplicados.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR MISIÓN */}
      {modalCrearAbierto && (
        <div className="admin-usuarios-modal-backdrop" onClick={cerrarModalCrear}>
          <div className="admin-usuarios-modal gm-modal-crear-mision" onClick={(e) => e.stopPropagation()}>
            <header className="admin-usuarios-modal-header">
              <h2>Crear misión</h2>
            </header>

            <form onSubmit={handleCrearMision} className="admin-usuarios-form">
              {/* Fila: Título, Dificultad, Categoría */}
              <div className="gm-mision-form-row-triple">
                <div className="admin-usuarios-form-group">
                  <label>Título</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    placeholder="Título de la misión"
                    className={errores.titulo ? "error" : ""}
                    required
                  />
                  <div className="gm-mision-field-hint">
                    <span className={formData.titulo.trim().length >= 3 ? "valid" : ""}>
                      Mínimo 3 caracteres ({formData.titulo.trim().length}/3)
                    </span>
                  </div>
                  {errores.titulo && (
                    <span className="admin-usuarios-error">{errores.titulo}</span>
                  )}
                </div>

                <div className="admin-usuarios-form-group">
                  <label>Dificultad</label>
                  <select
                    name="dificultad"
                    value={formData.dificultad}
                    onChange={handleInputChange}
                    required
                  >
                    {dificultadesDisponibles.map((dif) => (
                      <option key={dif} value={dif}>{dif}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-usuarios-form-group">
                  <label>Categoría</label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    required
                  >
                    {categoriasDisponibles.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Objetivo de aprendizaje */}
              <div className="admin-usuarios-form-group">
                <label>Objetivo de aprendizaje</label>
                <textarea
                  name="objetivoAprendizaje"
                  value={formData.objetivoAprendizaje}
                  onChange={handleInputChange}
                  placeholder="Describe el objetivo principal de esta misión"
                  className={errores.objetivoAprendizaje ? "error" : ""}
                  rows="3"
                  required
                />
                <div className="gm-mision-field-hint">
                  <span className={formData.objetivoAprendizaje.trim().length >= 10 ? "valid" : ""}>
                    Mínimo 10 caracteres ({formData.objetivoAprendizaje.trim().length}/10)
                  </span>
                </div>
                {errores.objetivoAprendizaje && (
                  <span className="admin-usuarios-error">{errores.objetivoAprendizaje}</span>
                )}
              </div>

              {/* Competencias y Pistas en dos columnas */}
              <div className="gm-mision-form-row-dual">
                {/* Competencias */}
                <div className="admin-usuarios-form-group">
                  <label>Competencias</label>
                  <div className="gm-mision-list-container">
                    {formData.competencias.map((competencia, index) => (
                      <div key={index} className="gm-mision-list-item">
                        <input
                          type="text"
                          value={competencia}
                          onChange={(e) => actualizarCompetencia(index, e.target.value)}
                          placeholder="Ej: Aplicar propiedades básicas de igualdad"
                        />
                        {formData.competencias.length > 1 && (
                          <button
                            type="button"
                            className="gm-mision-remove-btn"
                            onClick={() => eliminarCompetencia(index)}
                            title="Eliminar competencia"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="gm-mision-add-btn"
                      onClick={agregarCompetencia}
                    >
                      + Agregar otra
                    </button>
                  </div>
                  <div className="gm-mision-field-hint">
                    <span className={formData.competencias.some(c => c.trim().length > 0) ? "valid" : ""}>
                      Al menos una competencia requerida
                    </span>
                  </div>
                </div>

                {/* Pistas */}
                <div className="admin-usuarios-form-group">
                  <label>Pistas</label>
                  <div className="gm-mision-list-container">
                    {formData.pistas.map((pista, index) => (
                      <div key={index} className="gm-mision-list-item">
                        <input
                          type="text"
                          value={pista}
                          onChange={(e) => actualizarPista(index, e.target.value)}
                          placeholder="Recuerda: lo que haces en un lado de la ecuación..."
                        />
                        {formData.pistas.length > 1 && (
                          <button
                            type="button"
                            className="gm-mision-remove-btn"
                            onClick={() => eliminarPista(index)}
                            title="Eliminar pista"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="gm-mision-add-btn"
                      onClick={agregarPista}
                    >
                      + Agregar otra
                    </button>
                  </div>
                  <div className="gm-mision-field-hint">
                    <span className={formData.pistas.some(p => p.trim().length > 0) ? "valid" : ""}>
                      Al menos una pista requerida
                    </span>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="admin-usuarios-form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Describe en detalle la misión"
                  className={errores.descripcion ? "error" : ""}
                  rows="4"
                  required
                />
                <div className="gm-mision-field-hint">
                  <span className={formData.descripcion.trim().length >= 10 ? "valid" : ""}>
                    Mínimo 10 caracteres ({formData.descripcion.trim().length}/10)
                  </span>
                </div>
                {errores.descripcion && (
                  <span className="admin-usuarios-error">{errores.descripcion}</span>
                )}
              </div>

              {/* Competencias (sección final) */}
              <div className="admin-usuarios-form-group">
                <label>Competencias</label>
                <textarea
                  name="competenciasDescripcion"
                  value={formData.competenciasDescripcion}
                  onChange={handleInputChange}
                  placeholder="Describe las competencias que se desarrollarán"
                  className={errores.competenciasDescripcion ? "error" : ""}
                  rows="3"
                  required
                />
                <div className="gm-mision-field-hint">
                  <span className={formData.competenciasDescripcion.trim().length >= 10 ? "valid" : ""}>
                    Mínimo 10 caracteres ({formData.competenciasDescripcion.trim().length}/10)
                  </span>
                </div>
                {errores.competenciasDescripcion && (
                  <span className="admin-usuarios-error">{errores.competenciasDescripcion}</span>
                )}
              </div>

              <footer className="admin-usuarios-modal-footer">
                <button
                  type="button"
                  className="admin-usuarios-btn-cancelar"
                  onClick={cerrarModalCrear}
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="admin-usuarios-btn-guardar"
                  disabled={!esFormularioValido()}
                >
                  Guardar
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GMMisiones;
