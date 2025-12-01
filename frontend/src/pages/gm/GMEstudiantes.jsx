// src/pages/gm/GMEstudiantes.jsx
// Página de gestión de estudiantes del Game Master.
// Muestra lista de estudiantes con búsqueda y filtros.

import { useState, useEffect } from "react";
import api from "../../services/api";
import "../../styles/gmEstudiantes.css";
import "../../styles/gmGestionarMision.css"; // Para usar los estilos de éxito
import "../../styles/adminUsuarios.css"; // Para usar los estilos del modal
import "../../styles/themes.css";

function GMEstudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroCurso, setFiltroCurso] = useState("Todos");
  const [filtroNivel, setFiltroNivel] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [detallesEstudiante, setDetallesEstudiante] = useState(null);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [mensajeExitoEdicion, setMensajeExitoEdicion] = useState(false);
  const [mensajeExitoCreacion, setMensajeExitoCreacion] = useState(false);
  const [loadingCreacion, setLoadingCreacion] = useState(false);
  const [formData, setFormData] = useState({
    rut: "",
    nombre: "",
    email: "",
    cursoId: ""
  });
  const [formDataEdicion, setFormDataEdicion] = useState({
    rut: "",
    nombre: "",
    curso: "",
    nivel: "Intermedio",
    estado: "Activo"
  });
  const [errores, setErrores] = useState({});

  // Cargar estudiantes y cursos desde el backend
  useEffect(() => {
    cargarEstudiantes();
    cargarCursos();
  }, []);

  const cargarEstudiantes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/gm/estudiantes');

      if (response.data.success) {
        // Mapear datos del backend al formato del frontend
        const estudiantesFormateados = response.data.estudiantes.map(est => ({
          id: est.rut, // Usamos el RUT como ID único
          rut: est.rut,
          nombre: est.nombre,
          email: est.email,
          curso: est.cursos || 'Sin curso asignado',
          nivel: obtenerNivelDesdeXP(est.nivel),
          experiencia: est.experiencia || 0,
          avatar_url: est.avatar_url,
          estado: est.estado || 'Activo',
          total_misiones: est.total_misiones || 0,
          misiones_completadas: est.misiones_completadas || 0,
          misiones_en_progreso: est.misiones_en_progreso || 0
        }));

        setEstudiantes(estudiantesFormateados);
      }
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
      setError('Error al cargar los estudiantes. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const cargarCursos = async () => {
    try {
      const response = await api.get('/gm/cursos');
      if (response.data.success) {
        setCursos(response.data.cursos || []);
      }
    } catch (err) {
      console.error('Error al cargar cursos:', err);
    }
  };

  // Convertir nivel numérico en texto
  const obtenerNivelDesdeXP = (nivelNumerico) => {
    if (nivelNumerico >= 10) return 'Avanzado';
    if (nivelNumerico >= 5) return 'Intermedio';
    return 'Básico';
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|cl)$/i;

    return (
      validarRut(formData.rut) &&
      formData.nombre.length >= 3 &&
      emailRegex.test(formData.email)
    );
  };

  // Manejadores de modal
  const abrirModalCrear = () => {
    setFormData({
      rut: "",
      nombre: "",
      email: "",
      cursoId: ""
    });
    setErrores({});
    setMensajeExitoCreacion(false);
    setModalCrearAbierto(true);
  };

  const cerrarModalCrear = () => {
    setModalCrearAbierto(false);
    setMensajeExitoCreacion(false);
    setFormData({
      rut: "",
      nombre: "",
      email: "",
      cursoId: ""
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

  const handleCrearEstudiante = async (e) => {
    e.preventDefault();

    const nuevosErrores = {};

    if (!validarRut(formData.rut)) {
      nuevosErrores.rut = "El RUT debe tener el formato XX.XXX.XXX-X";
    }

    if (formData.nombre.length < 3) {
      nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|cl)$/i;
    if (!emailRegex.test(formData.email)) {
      nuevosErrores.email = "El email debe terminar en .com o .cl";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    try {
      setLoadingCreacion(true);

      const response = await api.post('/gm/estudiantes', {
        rut: formData.rut,
        nombre: formData.nombre,
        email: formData.email,
        cursoId: formData.cursoId || null
      });

      if (response.data.success) {
        setMensajeExitoCreacion(true);

        // Recargar la lista de estudiantes
        await cargarEstudiantes();

        // Cerrar el modal después de 3 segundos
        setTimeout(() => {
          cerrarModalCrear();
        }, 3000);
      }
    } catch (error) {
      console.error('Error al crear estudiante:', error);

      if (error.response?.data?.message) {
        setErrores({ general: error.response.data.message });
      } else {
        setErrores({ general: 'Error al crear el estudiante. Por favor intenta de nuevo.' });
      }
    } finally {
      setLoadingCreacion(false);
    }
  };

  // Manejador para ver detalles del estudiante
  const handleVerDetalles = async (estudiante) => {
    try {
      setLoadingDetalles(true);
      setEstudianteSeleccionado(estudiante);
      setModalDetallesAbierto(true);

      // Cargar detalles completos del estudiante
      const response = await api.get(`/gm/estudiantes/${estudiante.rut}`);

      if (response.data.success) {
        setDetallesEstudiante(response.data.estudiante);
      }
    } catch (err) {
      console.error('Error al cargar detalles del estudiante:', err);
    } finally {
      setLoadingDetalles(false);
    }
  };

  const cerrarModalDetalles = () => {
    setModalDetallesAbierto(false);
    setEstudianteSeleccionado(null);
    setDetallesEstudiante(null);
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
      {!loading && !error && (
        <div className="gm-estudiantes-count">
          Mostrando {estudiantesFiltrados.length} de {estudiantes.length} estudiantes
        </div>
      )}

      {/* Tabla en panel */}
      <div className="gm-estudiantes-table-container">
        <div className="gm-estudiantes-table-wrapper">
          {loading ? (
            <div className="gm-no-results">
              <div className="gm-no-results-content">
                <svg className="animate-spin h-12 w-12 text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Cargando estudiantes...</p>
              </div>
            </div>
          ) : error ? (
            <div className="gm-no-results">
              <div className="gm-no-results-content">
                <svg viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p>{error}</p>
                <button
                  onClick={cargarEstudiantes}
                  className="gm-estudiantes-btn-crear"
                  style={{ marginTop: '1rem' }}
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>

      {/* MODAL CREAR ESTUDIANTE */}
      {modalCrearAbierto && (
        <div className="admin-usuarios-modal-backdrop" onClick={cerrarModalCrear}>
          <div className="admin-usuarios-modal" onClick={(e) => e.stopPropagation()}>
            <header className="admin-usuarios-modal-header">
              <h2>Agregar estudiante</h2>
            </header>

            {!mensajeExitoCreacion ? (
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

                <div className="admin-usuarios-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="estudiante@ejemplo.com"
                    className={errores.email ? "error" : ""}
                    required
                  />
                  {errores.email && (
                    <span className="admin-usuarios-error">{errores.email}</span>
                  )}
                </div>

                <div className="admin-usuarios-form-group">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Mínimo 8 caracteres"
                    className={errores.password ? "error" : ""}
                    required
                  />
                  {errores.password && (
                    <span className="admin-usuarios-error">{errores.password}</span>
                  )}
                  <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    Debe incluir mayúscula, número y símbolo especial
                  </small>
                </div>

                <div className="admin-usuarios-form-group">
                  <label>Curso (opcional)</label>
                  <select
                    name="cursoId"
                    value={formData.cursoId}
                    onChange={handleInputChange}
                  >
                    <option value="">Sin asignar</option>
                    {cursos.map((curso) => (
                      <option key={curso.id} value={curso.id}>
                        {curso.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {errores.general && (
                  <div className="admin-usuarios-error" style={{ marginTop: '1rem', padding: '0.75rem', background: '#fee', borderRadius: '0.5rem' }}>
                    {errores.general}
                  </div>
                )}

                <footer className="admin-usuarios-modal-footer">
                  <button
                    type="button"
                    className="admin-usuarios-btn-cancelar"
                    onClick={cerrarModalCrear}
                    disabled={loadingCreacion}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="admin-usuarios-btn-guardar"
                    disabled={!esFormularioValido() || loadingCreacion}
                  >
                    {loadingCreacion ? 'Creando...' : 'Crear estudiante'}
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
                <h3 className="gm-asignar-exito-titulo">¡Estudiante creado exitosamente!</h3>
                <p className="gm-asignar-exito-texto">
                  El estudiante ha sido registrado en el sistema.
                </p>
              </div>
            )}
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
              {loadingDetalles ? (
                <div className="gm-no-results">
                  <div className="gm-no-results-content">
                    <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p>Cargando detalles...</p>
                  </div>
                </div>
              ) : (
                <>
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
                      <span className="gm-detalles-label">Email:</span>
                      <span className="gm-detalles-value">{estudianteSeleccionado.email}</span>
                    </div>

                    <div className="gm-detalles-item">
                      <span className="gm-detalles-label">Curso(s):</span>
                      <span className="gm-detalles-value">{estudianteSeleccionado.curso}</span>
                    </div>

                    <div className="gm-detalles-item">
                      <span className="gm-detalles-label">Nivel:</span>
                      <span className="gm-detalles-value gm-nivel-badge">{estudianteSeleccionado.nivel}</span>
                    </div>

                    <div className="gm-detalles-item">
                      <span className="gm-detalles-label">Experiencia:</span>
                      <span className="gm-detalles-value">{estudianteSeleccionado.experiencia} XP</span>
                    </div>

                    <div className="gm-detalles-item">
                      <span className="gm-detalles-label">Estado:</span>
                      <span className={`gm-estado-badge ${estudianteSeleccionado.estado === 'Activo' ? 'activo' : 'inactivo'}`}>
                        {estudianteSeleccionado.estado}
                      </span>
                    </div>

                    <div className="gm-detalles-item gm-detalles-misiones">
                      <span className="gm-detalles-label">Misiones totales:</span>
                      <span className="gm-detalles-misiones-count">
                        {estudianteSeleccionado.total_misiones || 0}
                      </span>
                    </div>

                    <div className="gm-detalles-item gm-detalles-misiones">
                      <span className="gm-detalles-label">Misiones completadas:</span>
                      <span className="gm-detalles-misiones-count" style={{ color: '#10b981' }}>
                        {estudianteSeleccionado.misiones_completadas || 0}
                      </span>
                    </div>

                    <div className="gm-detalles-item gm-detalles-misiones">
                      <span className="gm-detalles-label">Misiones en progreso:</span>
                      <span className="gm-detalles-misiones-count" style={{ color: '#f59e0b' }}>
                        {estudianteSeleccionado.misiones_en_progreso || 0}
                      </span>
                    </div>

                    {detallesEstudiante && detallesEstudiante.cursos && (
                      <div className="gm-detalles-item" style={{ marginTop: '1rem', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span className="gm-detalles-label">Cursos inscritos:</span>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                          {detallesEstudiante.cursos.map((curso) => (
                            <li key={curso.id} style={{ marginBottom: '0.25rem' }}>
                              <strong>{curso.nombre}</strong>
                              {curso.descripcion && <span> - {curso.descripcion}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {detallesEstudiante && detallesEstudiante.logros && detallesEstudiante.logros.length > 0 && (
                      <div className="gm-detalles-item" style={{ marginTop: '1rem', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span className="gm-detalles-label">Logros obtenidos ({detallesEstudiante.logros.length}):</span>
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {detallesEstudiante.logros.slice(0, 5).map((logro) => (
                            <span
                              key={logro.id}
                              style={{
                                padding: '0.25rem 0.75rem',
                                background: '#f3f4f6',
                                borderRadius: '9999px',
                                fontSize: '0.875rem'
                              }}
                              title={logro.descripcion}
                            >
                              {logro.icono} {logro.nombre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
                </>
              )}
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
