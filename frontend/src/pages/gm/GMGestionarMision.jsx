// src/pages/gm/GMGestionarMision.jsx
// Página de gestión individual de una misión del Game Master.
// Muestra detalles completos de la misión con opciones de edición y asignación.

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import "../../styles/gmGestionarMision.css";
import "../../styles/adminUsuarios.css";
import "../../styles/themes.css";

function GMGestionarMision() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mision, setMision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalAsignarAbierto, setModalAsignarAbierto] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);
  const [modalProgresoAbierto, setModalProgresoAbierto] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [mensajeExitoEdicion, setMensajeExitoEdicion] = useState(false);
  const [formDataEdicion, setFormDataEdicion] = useState({
    titulo: "",
    dificultad: "",
    categoria: "",
    objetivoAprendizaje: "",
    competencias: [],
    pistas: [],
    descripcion: "",
    competenciasDescripcion: "",
    retroalimentacion: ""
  });

  const [cursos, setCursos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);

  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Cargar datos de la misión
  const cargarMision = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/gm/misiones/${id}`);

      if (response.data.success) {
        const misionData = response.data.mision;

        // Formatear datos para el frontend
        setMision({
          id: misionData.id,
          titulo: misionData.titulo,
          dificultad: capitalizeFirst(misionData.dificultad),
          categoria: capitalizeFirst(misionData.categoria),
          objetivoAprendizaje: misionData.objetivo_aprendizaje || 'Sin objetivo especificado',
          competencias: misionData.competencias || [],
          pistas: misionData.pistas || [],
          descripcion: misionData.descripcion || 'Sin descripción',
          competenciasDescripcion: 'Competencias asociadas a esta misión',
          retroalimentacion: misionData.retroalimentacion || 'Se proporcionará retroalimentación al completar la misión',
          xp_recompensa: misionData.puntos_experiencia || 100,
          curso_id: misionData.curso_id,
          curso_nombre: misionData.curso_nombre,
          estadisticas: misionData.estadisticas || {}
        });
      }
    } catch (err) {
      console.error('Error al cargar misión:', err);
      setError('Error al cargar la misión. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Cargar cursos disponibles
  const cargarCursos = useCallback(async () => {
    try {
      const response = await api.get('/gm/cursos');
      if (response.data.success) {
        setCursos(response.data.cursos);
      }
    } catch (err) {
      console.error('Error al cargar cursos:', err);
    }
  }, []);

  useEffect(() => {
    cargarMision();
    cargarCursos();
  }, [cargarMision, cargarCursos]);

  const handleVolver = () => {
    navigate("/gm/misiones");
  };

  const handleEditar = () => {
    // Cargar los datos actuales de la misión en el formulario
    setFormDataEdicion({
      titulo: mision.titulo,
      dificultad: mision.dificultad,
      categoria: mision.categoria,
      objetivoAprendizaje: mision.objetivoAprendizaje,
      competencias: [...mision.competencias],
      pistas: [...mision.pistas],
      descripcion: mision.descripcion,
      competenciasDescripcion: mision.competenciasDescripcion,
      retroalimentacion: mision.retroalimentacion
    });
    setModalEditarAbierto(true);
    setMensajeExitoEdicion(false);
  };

  const handleAsignar = () => {
    setModalAsignarAbierto(true);
  };

  const cerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setMensajeExitoEdicion(false);
  };

  const handleInputChangeEdicion = (e) => {
    const { name, value } = e.target;
    setFormDataEdicion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompetenciaChangeEdicion = (index, value) => {
    const nuevasCompetencias = [...formDataEdicion.competencias];
    nuevasCompetencias[index] = value;
    setFormDataEdicion(prev => ({
      ...prev,
      competencias: nuevasCompetencias
    }));
  };

  const handlePistaChangeEdicion = (index, value) => {
    const nuevasPistas = [...formDataEdicion.pistas];
    nuevasPistas[index] = value;
    setFormDataEdicion(prev => ({
      ...prev,
      pistas: nuevasPistas
    }));
  };

  const agregarCompetenciaEdicion = () => {
    setFormDataEdicion(prev => ({
      ...prev,
      competencias: [...prev.competencias, ""]
    }));
  };

  const eliminarCompetenciaEdicion = (index) => {
    setFormDataEdicion(prev => ({
      ...prev,
      competencias: prev.competencias.filter((_, i) => i !== index)
    }));
  };

  const agregarPistaEdicion = () => {
    setFormDataEdicion(prev => ({
      ...prev,
      pistas: [...prev.pistas, ""]
    }));
  };

  const eliminarPistaEdicion = (index) => {
    setFormDataEdicion(prev => ({
      ...prev,
      pistas: prev.pistas.filter((_, i) => i !== index)
    }));
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();

    try {
      // Preparar los datos para enviar al backend
      const datosActualizacion = {
        titulo: formDataEdicion.titulo,
        descripcion: formDataEdicion.descripcion,
        objetivo_aprendizaje: formDataEdicion.objetivoAprendizaje,
        retroalimentacion: formDataEdicion.retroalimentacion,
        dificultad: formDataEdicion.dificultad.toLowerCase(),
        categoria: formDataEdicion.categoria.toLowerCase(),
        xp_recompensa: mision.xp_recompensa || 100,
        estado: 'activa',
        competencias: formDataEdicion.competencias.filter(c => c && c.trim().length > 0),
        pistas: formDataEdicion.pistas.filter(p => p && p.trim().length > 0)
      };

      const response = await api.put(`/gm/misiones/${id}`, datosActualizacion);

      if (response.data.success) {
        setMensajeExitoEdicion(true);

        // Recargar los datos de la misión
        await cargarMision();

        // Cerrar el modal después de 2 segundos
        setTimeout(() => {
          cerrarModalEditar();
        }, 2000);
      }
    } catch (err) {
      console.error('Error al actualizar misión:', err);
      alert('Error al actualizar la misión. Por favor intente nuevamente.');
    }
  };

  const handleVerProgreso = () => {
    setModalProgresoAbierto(true);
    setCursoSeleccionado(null);
  };

  const cerrarModalAsignar = () => {
    setModalAsignarAbierto(false);
    setMensajeExito(false);
  };

  const cerrarModalProgreso = () => {
    setModalProgresoAbierto(false);
    setCursoSeleccionado(null);
  };

  const handleAsignarACurso = async (curso) => {
    try {
      const response = await api.post(`/gm/misiones/${id}/asignar/${curso.id}`);

      if (response.data.success) {
        setMensajeExito(true);

        // Recargar los datos de la misión
        await cargarMision();

        // Cerrar el modal después de 2 segundos
        setTimeout(() => {
          cerrarModalAsignar();
        }, 2000);
      }
    } catch (err) {
      console.error('Error al asignar misión:', err);
      // Mostrar mensaje de error
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert('Error al asignar la misión. Por favor intente nuevamente.');
      }
    }
  };

  const handleEliminarAsignacion = async (curso) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la asignación de esta misión del curso "${curso.nombre}"? Se eliminará el progreso de todos los estudiantes.`)) {
      return;
    }

    try {
      const response = await api.delete(`/gm/misiones/${id}/asignar/${curso.id}`);

      if (response.data.success) {
        alert('Asignación eliminada exitosamente');

        // Recargar los datos de la misión
        await cargarMision();
      }
    } catch (err) {
      console.error('Error al eliminar asignación:', err);
      // Mostrar mensaje de error
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert('Error al eliminar la asignación. Por favor intente nuevamente.');
      }
    }
  };

  const handleVerProgresoCurso = async (curso) => {
    setCursoSeleccionado(curso);

    // Cargar estudiantes del curso con progreso en esta misión
    try {
      const response = await api.get(`/gm/misiones/${id}/progreso/${curso.id}`);
      if (response.data.success) {
        setEstudiantes(response.data.estudiantes || []);
      }
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
      setEstudiantes([]);
    }
  };

  const handleVolverACursos = () => {
    setCursoSeleccionado(null);
  };

  if (loading) {
    return (
      <div className="gm-gestionar-mision">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Cargando datos de la misión...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gm-gestionar-mision">
        <div style={{ padding: '2rem', backgroundColor: '#fee', color: '#c00', borderRadius: '8px', margin: '1rem' }}>
          {error}
        </div>
        <button className="gm-gestion-btn gm-btn-volver" onClick={handleVolver}>
          Volver a Misiones
        </button>
      </div>
    );
  }

  if (!mision) {
    return (
      <div className="gm-gestionar-mision">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>No se encontró la misión</p>
        </div>
        <button className="gm-gestion-btn gm-btn-volver" onClick={handleVolver}>
          Volver a Misiones
        </button>
      </div>
    );
  }

  return (
    <div className="gm-gestionar-mision">
      {/* Header con título y badges */}
      <div className="gm-gestion-header">
        <div className="gm-gestion-header-top">
          <h1 className="gm-gestion-title">{mision.titulo}</h1>
          <div className="gm-gestion-badges">
            <span className={`gm-badge-dificultad ${mision.dificultad.toLowerCase()}`}>
              {mision.dificultad}
            </span>
            <span className="gm-badge-categoria">
              {mision.categoria}
            </span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="gm-gestion-actions">
        <button className="gm-gestion-btn gm-btn-editar" onClick={handleEditar}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Editar
        </button>
        <button className="gm-gestion-btn gm-btn-asignar" onClick={handleAsignar}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
          </svg>
          Asignar
        </button>
        <button className="gm-gestion-btn gm-btn-progreso" onClick={handleVerProgreso}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
          </svg>
          Ver progreso
        </button>
        <button className="gm-gestion-btn gm-btn-volver" onClick={handleVolver}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver
        </button>
      </div>

      {/* Contenido principal en dos columnas */}
      <div className="gm-gestion-content">
        {/* Columna izquierda */}
        <div className="gm-gestion-left">
          {/* Objetivo de aprendizaje */}
          <div className="gm-gestion-card">
            <h2 className="gm-gestion-card-title">Objetivo de aprendizaje</h2>
            <p className="gm-gestion-card-text">{mision.objetivoAprendizaje}</p>
          </div>

          {/* Competencias */}
          <div className="gm-gestion-card">
            <h2 className="gm-gestion-card-title">Competencias</h2>
            {mision.competencias && mision.competencias.length > 0 ? (
              <ul className="gm-gestion-list">
                {mision.competencias.map((competencia, index) => (
                  <li key={index} className="gm-gestion-list-item">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {competencia}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="gm-gestion-card-text">No se han definido competencias para esta misión.</p>
            )}
          </div>

          {/* Descripción */}
          <div className="gm-gestion-card">
            <h2 className="gm-gestion-card-title">Descripción</h2>
            <p className="gm-gestion-card-text">{mision.descripcion}</p>
          </div>

          {/* Competencias adicionales */}
          <div className="gm-gestion-card">
            <h2 className="gm-gestion-card-title">Competencias</h2>
            <p className="gm-gestion-card-text">{mision.competenciasDescripcion}</p>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="gm-gestion-right">
          {/* Pistas */}
          <div className="gm-gestion-card gm-card-pistas">
            <h2 className="gm-gestion-card-title">Pistas</h2>
            {mision.pistas && mision.pistas.length > 0 ? (
              <ul className="gm-gestion-pistas-list">
                {mision.pistas.map((pista, index) => (
                  <li key={index} className="gm-gestion-pista-item">
                    <div className="gm-pista-icon">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="gm-pista-text">{pista}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="gm-gestion-card-text">No se han definido pistas para esta misión.</p>
            )}
          </div>

          {/* Retroalimentación */}
          <div className="gm-gestion-card gm-card-retro">
            <h2 className="gm-gestion-card-title">Retroalimentación</h2>
            <p className="gm-gestion-card-text">{mision.retroalimentacion}</p>
          </div>
        </div>
      </div>

      {/* MODAL ASIGNAR MISIÓN */}
      {modalAsignarAbierto && (
        <div className="admin-usuarios-modal-backdrop" onClick={cerrarModalAsignar}>
          <div className="admin-usuarios-modal gm-modal-asignar" onClick={(e) => e.stopPropagation()}>
            <header className="admin-usuarios-modal-header">
              <h2>Asignar misión</h2>
            </header>

            {!mensajeExito ? (
              <div className="gm-asignar-content">
                <p className="gm-asignar-descripcion">
                  Selecciona el curso al que deseas asignar la misión: <strong>{mision.titulo}</strong>
                </p>

                {/* Tabla de cursos */}
                <div className="gm-asignar-table-container">
                  <table className="gm-asignar-table">
                    <thead>
                      <tr>
                        <th>Curso</th>
                        <th>Código</th>
                        <th>Categoría</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cursos.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                            No hay cursos disponibles
                          </td>
                        </tr>
                      ) : (
                        cursos.map((curso) => {
                          const estaAsignado = mision.curso_id && curso.id === mision.curso_id;
                          return (
                            <tr key={curso.id}>
                              <td className="gm-asignar-curso-nombre">{curso.nombre}</td>
                              <td className="gm-asignar-curso-codigo">{curso.id}</td>
                              <td className="gm-asignar-curso-categoria">{curso.nombre}</td>
                              <td>
                                {estaAsignado ? (
                                  <span style={{ color: '#10b981', fontWeight: '500' }}>✓ Asignada</span>
                                ) : (
                                  <span style={{ color: '#6b7280' }}>No asignada</span>
                                )}
                              </td>
                              <td>
                                {!estaAsignado ? (
                                  <button
                                    className="gm-asignar-btn-curso"
                                    onClick={() => handleAsignarACurso(curso)}
                                  >
                                    Asignar
                                  </button>
                                ) : (
                                  <button
                                    className="gm-asignar-btn-curso"
                                    onClick={() => handleEliminarAsignacion(curso)}
                                    style={{
                                      backgroundColor: '#ef4444',
                                      borderColor: '#ef4444'
                                    }}
                                  >
                                    Eliminar asignación
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <footer className="admin-usuarios-modal-footer">
                  <button
                    type="button"
                    className="admin-usuarios-btn-cancelar"
                    onClick={cerrarModalAsignar}
                  >
                    Volver
                  </button>
                </footer>
              </div>
            ) : (
              <div className="gm-asignar-exito">
                <div className="gm-asignar-exito-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="gm-asignar-exito-titulo">¡Misión asignada exitosamente!</h3>
                <p className="gm-asignar-exito-texto">
                  La misión ha sido asignada a todos los estudiantes del curso seleccionado.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL VER PROGRESO */}
      {modalProgresoAbierto && (
        <div className="admin-usuarios-modal-backdrop" onClick={cerrarModalProgreso}>
          <div className="admin-usuarios-modal gm-modal-progreso" onClick={(e) => e.stopPropagation()}>
            <header className="admin-usuarios-modal-header">
              <h2>Ver progreso</h2>
            </header>

            {!cursoSeleccionado ? (
              <div className="gm-progreso-content">
                <p className="gm-progreso-descripcion">
                  Selecciona el curso del que deseas ver el progreso de la misión: <strong>{mision.titulo}</strong>
                </p>

                {/* Tabla de cursos */}
                <div className="gm-progreso-table-container">
                  <table className="gm-progreso-table">
                    <thead>
                      <tr>
                        <th>Curso</th>
                        <th>Código</th>
                        <th>Categoría</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cursos.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                            No hay cursos disponibles
                          </td>
                        </tr>
                      ) : (
                        cursos.map((curso) => (
                          <tr key={curso.id}>
                            <td className="gm-progreso-curso-nombre">{curso.nombre}</td>
                            <td className="gm-progreso-curso-codigo">{curso.id}</td>
                            <td className="gm-progreso-curso-categoria">{curso.nombre}</td>
                            <td>
                              <button
                                className="gm-progreso-btn-curso"
                                onClick={() => handleVerProgresoCurso(curso)}
                              >
                                Ver progreso
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <footer className="admin-usuarios-modal-footer">
                  <button
                    type="button"
                    className="admin-usuarios-btn-cancelar"
                    onClick={cerrarModalProgreso}
                  >
                    Volver
                  </button>
                </footer>
              </div>
            ) : (
              <div className="gm-progreso-estudiantes-content">
                <div className="gm-progreso-estudiantes-header">
                  <h3 className="gm-progreso-estudiantes-titulo">
                    Progreso del {cursoSeleccionado.nombre} - {cursoSeleccionado.categoria}
                  </h3>
                </div>

                {/* Tabla de estudiantes con progreso */}
                <div className="gm-progreso-estudiantes-table-container">
                  <table className="gm-progreso-estudiantes-table">
                    <thead>
                      <tr>
                        <th>Rut</th>
                        <th>Nombre</th>
                        <th>Nivel</th>
                        <th>Progreso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantes.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                            No hay estudiantes en este curso
                          </td>
                        </tr>
                      ) : (
                        estudiantes.map((estudiante) => (
                          <tr key={estudiante.rut}>
                            <td className="gm-progreso-estudiante-rut">{estudiante.rut}</td>
                            <td className="gm-progreso-estudiante-nombre">{estudiante.nombre}</td>
                            <td className="gm-progreso-estudiante-nivel">{estudiante.nivel || 'N/A'}</td>
                            <td>
                              <div className="gm-progreso-bar-container">
                                <div className="gm-progreso-bar-wrapper">
                                  <div
                                    className="gm-progreso-bar-fill"
                                    style={{ width: `${estudiante.progreso || 0}%` }}
                                  ></div>
                                </div>
                                <span className="gm-progreso-bar-text">{estudiante.progreso || 0}%</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <footer className="admin-usuarios-modal-footer">
                  <button
                    type="button"
                    className="admin-usuarios-btn-cancelar"
                    onClick={handleVolverACursos}
                  >
                    Volver a cursos
                  </button>
                  <button
                    type="button"
                    className="admin-usuarios-btn-cancelar"
                    onClick={cerrarModalProgreso}
                  >
                    Cerrar
                  </button>
                </footer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL EDITAR MISIÓN */}
      {modalEditarAbierto && (
        <div className="admin-usuarios-modal-backdrop" onClick={cerrarModalEditar}>
          <div className="admin-usuarios-modal gm-modal-editar-mision" onClick={(e) => e.stopPropagation()}>
            <header className="admin-usuarios-modal-header">
              <h2>Editar misión</h2>
            </header>

            {!mensajeExitoEdicion ? (
              <form onSubmit={handleGuardarEdicion} className="admin-usuarios-form">
                {/* Título, Dificultad y Categoría en una fila */}
                <div className="gm-mision-form-row-triple">
                  <div className="admin-usuarios-form-group">
                    <label>Título</label>
                    <input
                      type="text"
                      name="titulo"
                      value={formDataEdicion.titulo}
                      onChange={handleInputChangeEdicion}
                      placeholder="Título de la misión"
                      required
                    />
                  </div>

                  <div className="admin-usuarios-form-group">
                    <label>Dificultad</label>
                    <select
                      name="dificultad"
                      value={formDataEdicion.dificultad}
                      onChange={handleInputChangeEdicion}
                      required
                    >
                      <option value="Baja">Baja</option>
                      <option value="Media">Media</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>

                  <div className="admin-usuarios-form-group">
                    <label>Categoría</label>
                    <input
                      type="text"
                      name="categoria"
                      value={formDataEdicion.categoria}
                      onChange={handleInputChangeEdicion}
                      placeholder="Ej: Matemáticas"
                      required
                    />
                  </div>
                </div>

                {/* Objetivo de aprendizaje */}
                <div className="admin-usuarios-form-group">
                  <label>Objetivo de aprendizaje</label>
                  <textarea
                    name="objetivoAprendizaje"
                    value={formDataEdicion.objetivoAprendizaje}
                    onChange={handleInputChangeEdicion}
                    placeholder="Describe el objetivo principal de esta misión"
                    rows="3"
                    required
                  />
                </div>

                {/* Competencias y Pistas en dos columnas */}
                <div className="gm-mision-form-row-dual">
                  {/* Competencias */}
                  <div className="admin-usuarios-form-group">
                    <label>Competencias</label>
                    <div className="gm-mision-list-container">
                      {formDataEdicion.competencias.map((competencia, index) => (
                        <div key={index} className="gm-mision-list-item">
                          <input
                            type="text"
                            value={competencia}
                            onChange={(e) => handleCompetenciaChangeEdicion(index, e.target.value)}
                            placeholder={`Competencia ${index + 1}`}
                          />
                          {formDataEdicion.competencias.length > 1 && (
                            <button
                              type="button"
                              className="gm-mision-remove-btn"
                              onClick={() => eliminarCompetenciaEdicion(index)}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="gm-mision-add-btn"
                        onClick={agregarCompetenciaEdicion}
                      >
                        + Agregar otra
                      </button>
                    </div>
                  </div>

                  {/* Pistas */}
                  <div className="admin-usuarios-form-group">
                    <label>Pistas</label>
                    <div className="gm-mision-list-container">
                      {formDataEdicion.pistas.map((pista, index) => (
                        <div key={index} className="gm-mision-list-item">
                          <input
                            type="text"
                            value={pista}
                            onChange={(e) => handlePistaChangeEdicion(index, e.target.value)}
                            placeholder={`Pista ${index + 1}`}
                          />
                          {formDataEdicion.pistas.length > 1 && (
                            <button
                              type="button"
                              className="gm-mision-remove-btn"
                              onClick={() => eliminarPistaEdicion(index)}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="gm-mision-add-btn"
                        onClick={agregarPistaEdicion}
                      >
                        + Agregar otra
                      </button>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="admin-usuarios-form-group">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formDataEdicion.descripcion}
                    onChange={handleInputChangeEdicion}
                    placeholder="Describe en detalle la misión"
                    rows="4"
                    required
                  />
                </div>

                {/* Competencias (descripción) */}
                <div className="admin-usuarios-form-group">
                  <label>Competencias</label>
                  <textarea
                    name="competenciasDescripcion"
                    value={formDataEdicion.competenciasDescripcion}
                    onChange={handleInputChangeEdicion}
                    placeholder="Describe las competencias que se desarrollarán"
                    rows="3"
                    required
                  />
                </div>

                {/* Retroalimentación */}
                <div className="admin-usuarios-form-group">
                  <label>Retroalimentación</label>
                  <textarea
                    name="retroalimentacion"
                    value={formDataEdicion.retroalimentacion}
                    onChange={handleInputChangeEdicion}
                    placeholder="Describe la retroalimentación que recibirán los estudiantes"
                    rows="3"
                    required
                  />
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
                  La misión ha sido actualizada correctamente.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GMGestionarMision;
