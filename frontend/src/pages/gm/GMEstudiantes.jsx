// src/pages/gm/GMEstudiantes.jsx
// Página de gestión de estudiantes del Game Master.
// Muestra lista de estudiantes con búsqueda y filtros.

import { useState } from "react";
import "../../styles/gmEstudiantes.css";
import "../../styles/gmGestionarMision.css"; // Para usar los estilos de éxito
import "../../styles/adminUsuarios.css"; // Para usar los estilos del modal
import "../../styles/themes.css";

function GMEstudiantes() {
  // Datos de ejemplo de estudiantes
  const estudiantesData = [
    {
      id: 1,
      rut: "12.345.678-9",
      nombre: "Ana María González",
      curso: "3° Medio A",
      nivel: "Avanzado",
      estado: "Activo"
    },
    {
      id: 2,
      rut: "23.456.789-0",
      nombre: "Carlos Pérez Silva",
      curso: "2° Medio B",
      nivel: "Intermedio",
      estado: "Activo"
    },
    {
      id: 3,
      rut: "34.567.890-1",
      nombre: "María José Fernández",
      curso: "3° Medio A",
      nivel: "Básico",
      estado: "Inactivo"
    },
    {
      id: 4,
      rut: "45.678.901-2",
      nombre: "Diego Morales",
      curso: "1° Medio C",
      nivel: "Intermedio",
      estado: "Activo"
    },
    {
      id: 5,
      rut: "56.789.012-3",
      nombre: "Valentina Torres",
      curso: "2° Medio B",
      nivel: "Avanzado",
      estado: "Activo"
    },
    {
      id: 6,
      rut: "67.890.123-4",
      nombre: "Matías Rojas",
      curso: "1° Medio C",
      nivel: "Básico",
      estado: "Inactivo"
    }
  ];

  const [estudiantes] = useState(estudiantesData);
  const [filtroCurso, setFiltroCurso] = useState("Todos");
  const [filtroNivel, setFiltroNivel] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [mensajeExitoEdicion, setMensajeExitoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    rut: "",
    nombre: "",
    curso: "",
    nivel: "Intermedio",
    estado: "Activo"
  });
  const [formDataEdicion, setFormDataEdicion] = useState({
    rut: "",
    nombre: "",
    curso: "",
    nivel: "Intermedio",
    estado: "Activo"
  });
  const [errores, setErrores] = useState({});

  // Datos de misiones activas por estudiante (simulado)
  const misionesActivasPorEstudiante = {
    1: 3,
    2: 5,
    3: 1,
    4: 4,
    5: 6,
    6: 2
  };

  // Obtener cursos únicos
  const cursosUnicos = ["Todos", ...new Set(estudiantes.map(e => e.curso))];
  const nivelesUnicos = ["Todos", "Básico", "Intermedio", "Avanzado"];

  // Filtrar estudiantes
  const estudiantesFiltrados = estudiantes.filter((estudiante) => {
    const cumpleCurso = filtroCurso === "Todos" || estudiante.curso === filtroCurso;
    const cumpleNivel = filtroNivel === "Todos" || estudiante.nivel === filtroNivel;
    const cumpleEstado = filtroEstado === "Todos" || estudiante.estado === filtroEstado;
    const cumpleBusqueda =
      estudiante.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      estudiante.rut.includes(busqueda);

    return cumpleCurso && cumpleNivel && cumpleEstado && cumpleBusqueda;
  });

  // Validación de RUT simple (formato XX.XXX.XXX-X)
  const validarRut = (rut) => {
    const regex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
    return regex.test(rut);
  };

  // Validar formulario
  const esFormularioValido = () => {
    return (
      validarRut(formData.rut) &&
      formData.nombre.length >= 3 &&
      formData.curso.length >= 3
    );
  };

  // Manejadores de modal
  const abrirModalCrear = () => {
    setFormData({
      rut: "",
      nombre: "",
      curso: "",
      nivel: "Intermedio",
      estado: "Activo"
    });
    setErrores({});
    setModalCrearAbierto(true);
  };

  const cerrarModalCrear = () => {
    setModalCrearAbierto(false);
    setFormData({
      rut: "",
      nombre: "",
      curso: "",
      nivel: "Intermedio",
      estado: "Activo"
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

  const handleCrearEstudiante = (e) => {
    e.preventDefault();

    const nuevosErrores = {};

    if (!validarRut(formData.rut)) {
      nuevosErrores.rut = "El RUT debe tener el formato XX.XXX.XXX-X";
    }

    if (formData.nombre.length < 3) {
      nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres";
    }

    if (formData.curso.length < 3) {
      nuevosErrores.curso = "El curso es obligatorio";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    console.log("Crear estudiante:", formData);
    alert("Estudiante agregado exitosamente\n(Esta funcionalidad se conectará al backend próximamente)");
    cerrarModalCrear();
  };

  // Manejador para ver detalles del estudiante
  const handleVerDetalles = (estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setModalDetallesAbierto(true);
  };

  const cerrarModalDetalles = () => {
    setModalDetallesAbierto(false);
    setEstudianteSeleccionado(null);
  };

  // Manejador para editar estudiante
  const handleEditar = (estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setFormDataEdicion({
      rut: estudiante.rut,
      nombre: estudiante.nombre,
      curso: estudiante.curso,
      nivel: estudiante.nivel,
      estado: estudiante.estado
    });
    setModalEditarAbierto(true);
    setMensajeExitoEdicion(false);
  };

  const cerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setMensajeExitoEdicion(false);
    setEstudianteSeleccionado(null);
  };

  const handleInputChangeEdicion = (e) => {
    const { name, value } = e.target;
    setFormDataEdicion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGuardarEdicion = (e) => {
    e.preventDefault();
    console.log("Guardar cambios de estudiante:", formDataEdicion);
    setMensajeExitoEdicion(true);

    // Cerrar el modal después de 2 segundos
    setTimeout(() => {
      cerrarModalEditar();
    }, 2000);
  };

  return (
    <div className="gm-estudiantes">
      {/* Header */}
      <div className="gm-estudiantes-header">
        <h1 className="gm-estudiantes-title">Estudiantes</h1>

        <button className="gm-estudiantes-btn-crear" onClick={abrirModalCrear}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Agregar estudiante
        </button>
      </div>

      {/* Filtros */}
      <div className="gm-estudiantes-filters">
        <div className="gm-filter-group">
          <label>Curso:</label>
          <select
            className="gm-estudiantes-select"
            value={filtroCurso}
            onChange={(e) => setFiltroCurso(e.target.value)}
          >
            {cursosUnicos.map((curso) => (
              <option key={curso} value={curso}>{curso}</option>
            ))}
          </select>
        </div>

        <div className="gm-filter-group">
          <label>Nivel:</label>
          <select
            className="gm-estudiantes-select"
            value={filtroNivel}
            onChange={(e) => setFiltroNivel(e.target.value)}
          >
            {nivelesUnicos.map((nivel) => (
              <option key={nivel} value={nivel}>{nivel}</option>
            ))}
          </select>
        </div>

        <div className="gm-filter-group">
          <label>Estado:</label>
          <select
            className="gm-estudiantes-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        <div className="gm-filter-group gm-search-group">
          <label>Buscar:</label>
          <div className="gm-estudiantes-search-wrapper">
            <svg className="gm-search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              className="gm-estudiantes-search-input"
              placeholder="Buscar por nombre o RUT"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="gm-estudiantes-count">
        Mostrando {estudiantesFiltrados.length} de {estudiantes.length} estudiantes
      </div>

      {/* Tabla en panel */}
      <div className="gm-estudiantes-table-container">
        <div className="gm-estudiantes-table-wrapper">
          <table className="gm-estudiantes-table">
            <thead>
              <tr>
                <th>Rut</th>
                <th>Nombre</th>
                <th>Curso</th>
                <th>Nivel</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantesFiltrados.length > 0 ? (
                estudiantesFiltrados.map((estudiante) => (
                  <tr key={estudiante.id}>
                    <td className="gm-estudiante-rut">{estudiante.rut}</td>
                    <td className="gm-estudiante-nombre">{estudiante.nombre}</td>
                    <td className="gm-estudiante-curso">{estudiante.curso}</td>
                    <td className="gm-estudiante-nivel">{estudiante.nivel}</td>
                    <td>
                      <span className={`gm-estado-badge ${estudiante.estado === 'Activo' ? 'activo' : 'inactivo'}`}>
                        {estudiante.estado}
                      </span>
                    </td>
                    <td>
                      <div className="gm-estudiantes-actions">
                        <button
                          className="gm-action-btn gm-action-btn-view"
                          onClick={() => handleVerDetalles(estudiante)}
                          title="Ver detalles"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          className="gm-action-btn gm-action-btn-edit"
                          onClick={() => handleEditar(estudiante)}
                          title="Editar"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="gm-no-results">
                    <div className="gm-no-results-content">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>No se encontraron estudiantes que coincidan con los filtros aplicados.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR ESTUDIANTE */}
      {modalCrearAbierto && (
        <div className="admin-usuarios-modal-backdrop" onClick={cerrarModalCrear}>
          <div className="admin-usuarios-modal" onClick={(e) => e.stopPropagation()}>
            <header className="admin-usuarios-modal-header">
              <h2>Agregar estudiante</h2>
            </header>

            <form onSubmit={handleCrearEstudiante} className="admin-usuarios-form">
              <div className="admin-usuarios-avatar-section">
                <div className="admin-usuarios-avatar-large">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                  </svg>
                </div>
              </div>

              <div className="admin-usuarios-form-group">
                <label>RUT</label>
                <input
                  type="text"
                  name="rut"
                  value={formData.rut}
                  onChange={handleInputChange}
                  placeholder="12.345.678-9"
                  className={errores.rut ? "error" : ""}
                  required
                />
                {errores.rut && (
                  <span className="admin-usuarios-error">{errores.rut}</span>
                )}
              </div>

              <div className="admin-usuarios-form-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Nombre del estudiante"
                  className={errores.nombre ? "error" : ""}
                  required
                  minLength={3}
                />
                {errores.nombre && (
                  <span className="admin-usuarios-error">{errores.nombre}</span>
                )}
              </div>

              <div className="admin-usuarios-form-row">
                <div className="admin-usuarios-form-group">
                  <label>Curso</label>
                  <input
                    type="text"
                    name="curso"
                    value={formData.curso}
                    onChange={handleInputChange}
                    placeholder="Ej: 3° Medio A"
                    className={errores.curso ? "error" : ""}
                    required
                  />
                  {errores.curso && (
                    <span className="admin-usuarios-error">{errores.curso}</span>
                  )}
                </div>
                <div className="admin-usuarios-form-group">
                  <label>Nivel</label>
                  <select
                    name="nivel"
                    value={formData.nivel}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Básico">Básico</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div className="admin-usuarios-form-group">
                <label>Estado</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
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

      {/* MODAL VER DETALLES */}
      {modalDetallesAbierto && estudianteSeleccionado && (
        <div className="admin-usuarios-modal-backdrop" onClick={cerrarModalDetalles}>
          <div className="admin-usuarios-modal gm-modal-detalles-estudiante" onClick={(e) => e.stopPropagation()}>
            <header className="admin-usuarios-modal-header">
              <h2>Detalles del estudiante</h2>
            </header>

            <div className="gm-detalles-content">
              <div className="admin-usuarios-avatar-section">
                <div className="admin-usuarios-avatar-large">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                  </svg>
                </div>
              </div>

              <div className="gm-detalles-info">
                <div className="gm-detalles-item">
                  <span className="gm-detalles-label">RUT:</span>
                  <span className="gm-detalles-value">{estudianteSeleccionado.rut}</span>
                </div>

                <div className="gm-detalles-item">
                  <span className="gm-detalles-label">Nombre completo:</span>
                  <span className="gm-detalles-value">{estudianteSeleccionado.nombre}</span>
                </div>

                <div className="gm-detalles-item">
                  <span className="gm-detalles-label">Curso:</span>
                  <span className="gm-detalles-value">{estudianteSeleccionado.curso}</span>
                </div>

                <div className="gm-detalles-item">
                  <span className="gm-detalles-label">Nivel:</span>
                  <span className="gm-detalles-value gm-nivel-badge">{estudianteSeleccionado.nivel}</span>
                </div>

                <div className="gm-detalles-item">
                  <span className="gm-detalles-label">Estado:</span>
                  <span className={`gm-estado-badge ${estudianteSeleccionado.estado === 'Activo' ? 'activo' : 'inactivo'}`}>
                    {estudianteSeleccionado.estado}
                  </span>
                </div>

                <div className="gm-detalles-item gm-detalles-misiones">
                  <span className="gm-detalles-label">Misiones activas:</span>
                  <span className="gm-detalles-misiones-count">
                    {misionesActivasPorEstudiante[estudianteSeleccionado.id] || 0}
                  </span>
                </div>
              </div>

              <footer className="admin-usuarios-modal-footer">
                <button
                  type="button"
                  className="admin-usuarios-btn-cancelar"
                  onClick={cerrarModalDetalles}
                >
                  Cerrar
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR ESTUDIANTE */}
      {modalEditarAbierto && estudianteSeleccionado && (
        <div className="admin-usuarios-modal-backdrop" onClick={cerrarModalEditar}>
          <div className="admin-usuarios-modal" onClick={(e) => e.stopPropagation()}>
            <header className="admin-usuarios-modal-header">
              <h2>Editar estudiante</h2>
            </header>

            {!mensajeExitoEdicion ? (
              <form onSubmit={handleGuardarEdicion} className="admin-usuarios-form">
                <div className="admin-usuarios-avatar-section">
                  <div className="admin-usuarios-avatar-large">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                    </svg>
                  </div>
                </div>

                <div className="admin-usuarios-form-group">
                  <label>RUT</label>
                  <input
                    type="text"
                    name="rut"
                    value={formDataEdicion.rut}
                    onChange={handleInputChangeEdicion}
                    placeholder="12.345.678-9"
                    required
                  />
                </div>

                <div className="admin-usuarios-form-group">
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formDataEdicion.nombre}
                    onChange={handleInputChangeEdicion}
                    placeholder="Nombre del estudiante"
                    required
                    minLength={3}
                  />
                </div>

                <div className="admin-usuarios-form-row">
                  <div className="admin-usuarios-form-group">
                    <label>Curso</label>
                    <input
                      type="text"
                      name="curso"
                      value={formDataEdicion.curso}
                      onChange={handleInputChangeEdicion}
                      placeholder="Ej: 3° Medio A"
                      required
                    />
                  </div>
                  <div className="admin-usuarios-form-group">
                    <label>Nivel</label>
                    <select
                      name="nivel"
                      value={formDataEdicion.nivel}
                      onChange={handleInputChangeEdicion}
                      required
                    >
                      <option value="Básico">Básico</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                  </div>
                </div>

                <div className="admin-usuarios-form-group">
                  <label>Estado</label>
                  <select
                    name="estado"
                    value={formDataEdicion.estado}
                    onChange={handleInputChangeEdicion}
                    required
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                <footer className="admin-usuarios-modal-footer">
                  <button
                    type="button"
                    className="admin-usuarios-btn-cancelar"
                    onClick={cerrarModalEditar}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="admin-usuarios-btn-guardar"
                  >
                    Guardar cambios
                  </button>
                </footer>
              </form>
            ) : (
              <div className="gm-asignar-exito">
                <div className="gm-asignar-exito-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="gm-asignar-exito-titulo">¡Cambios guardados exitosamente!</h3>
                <p className="gm-asignar-exito-texto">
                  Los datos del estudiante han sido actualizados correctamente.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GMEstudiantes;
