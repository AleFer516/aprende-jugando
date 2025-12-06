// src/pages/admin/AdminCursos.jsx
// Panel de gestión de cursos con filtros, búsqueda y acciones

import { useState, useEffect, useCallback } from "react";
import "../../styles/adminUsuarios.css";

// Servicio para las llamadas al backend
const adminCursosService = {
  async getCursos(filtros = {}) {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();

    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.estado) params.append('estado', filtros.estado);

    const response = await fetch(`http://localhost:4000/api/admin/cursos?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener cursos');
    return data;
  },

  async crearCurso(cursoData) {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:4000/api/admin/cursos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cursoData)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al crear curso');
    return data;
  },

  async actualizarCurso(id, cursoData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:4000/api/admin/cursos/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cursoData)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar curso');
    return data;
  },

  async eliminarCurso(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:4000/api/admin/cursos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar curso');
    return data;
  },

  async getGMs() {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:4000/api/admin/cursos/gms', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener GMs');
    return data;
  }
};

function AdminCursos() {
  const [cursos, setCursos] = useState([]);
  const [gms, setGMs] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [confirmarEditarAbierto, setConfirmarEditarAbierto] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    gm_rut: "",
    codigo_acceso: "",
    activo: true
  });
  const [errores, setErrores] = useState({});

  const cargarCursos = useCallback(async () => {
    try {
      setCargando(true);
      const response = await adminCursosService.getCursos({
        estado: filtroEstado,
        busqueda: busqueda
      });

      if (response.success) {
        setCursos(response.data);
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    } finally {
      setCargando(false);
    }
  }, [filtroEstado, busqueda]);

  const cargarGMs = async () => {
    try {
      const response = await adminCursosService.getGMs();
      if (response.success) {
        setGMs(response.data);
      }
    } catch (error) {
      console.error('Error al cargar GMs:', error);
    }
  };

  // Cargar cursos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    cargarCursos();
  }, [cargarCursos]);

  // Cargar GMs al montar
  useEffect(() => {
    cargarGMs();
  }, []);

  // Filtrar cursos (ahora solo para la UI, los datos vienen filtrados del backend)
  const cursosFiltrados = cursos;

  // Manejadores
  const abrirModalCrear = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      gm_rut: "",
      codigo_acceso: "",
      activo: true
    });
    setErrores({});
    setModalCrearAbierto(true);
  };

  const cerrarModalCrear = () => {
    setModalCrearAbierto(false);
    setFormData({
      nombre: "",
      descripcion: "",
      gm_rut: "",
      codigo_acceso: "",
      activo: true
    });
    setErrores({});
  };

  const abrirModalEditar = (curso) => {
    setCursoSeleccionado(curso);
    setFormData({
      nombre: curso.nombre,
      descripcion: curso.descripcion || "",
      gm_rut: curso.gm_rut,
      codigo_acceso: curso.codigo_acceso || "",
      activo: curso.activo
    });
    setErrores({});
    setModalEditarAbierto(true);
  };

  const cerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setCursoSeleccionado(null);
    setErrores({});
    setConfirmarEditarAbierto(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCrearCurso = async (e) => {
    e.preventDefault();
    console.log('🔵 handleCrearCurso ejecutado');
    console.log('📋 Datos del formulario:', formData);

    const nuevosErrores = {};

    // Validaciones básicas
    if (formData.nombre.length < 3) {
      nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres";
    }

    if (!formData.gm_rut) {
      nuevosErrores.gm_rut = "Debe seleccionar un GM";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      console.log('❌ Errores de validación:', nuevosErrores);
      setErrores(nuevosErrores);
      return;
    }

    console.log('✅ Validaciones pasadas, enviando al backend...');

    try {
      setCargando(true);
      const response = await adminCursosService.crearCurso({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        gm_rut: formData.gm_rut,
        codigo_acceso: formData.codigo_acceso || null,
        activo: formData.activo
      });

      console.log('📥 Respuesta del backend:', response);

      if (response.success) {
        console.log('✅ Curso creado exitosamente');
        cerrarModalCrear();
        await cargarCursos();
      } else {
        console.log('⚠️ Backend retornó success=false:', response);
        setErrores({ general: response.message || 'Error al crear curso' });
      }
    } catch (error) {
      console.error('❌ Error al crear curso:', error);
      if (error.message) {
        setErrores({ general: error.message });
      } else {
        setErrores({ general: 'Error desconocido al crear curso' });
      }
    } finally {
      setCargando(false);
    }
  };

  const handleSubmitEditar = (e) => {
    e.preventDefault();
    const nuevosErrores = {};

    if (formData.nombre.length < 3) {
      nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres";
    }

    if (!formData.gm_rut) {
      nuevosErrores.gm_rut = "Debe seleccionar un GM";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});
    setConfirmarEditarAbierto(true);
  };

  const handleEditarCurso = async () => {
    try {
      setCargando(true);
      const response = await adminCursosService.actualizarCurso(cursoSeleccionado.id, {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        gm_rut: formData.gm_rut,
        codigo_acceso: formData.codigo_acceso || null,
        activo: formData.activo
      });

      if (response.success) {
        setConfirmarEditarAbierto(false);
        cerrarModalEditar();
        await cargarCursos();
      }
    } catch (error) {
      console.error('Error al editar curso:', error);
      if (error.message) {
        setErrores({ general: error.message });
      }
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarCurso = async (id, nombre) => {
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar el curso "${nombre}"?\n\nEsta acción eliminará permanentemente:\n- Los datos del curso\n- Las misiones asociadas\n- El progreso de los estudiantes\n\nEsta acción NO se puede deshacer.`
    );

    if (!confirmar) return;

    try {
      setCargando(true);
      const response = await adminCursosService.eliminarCurso(id);

      if (response.success) {
        alert('Curso eliminado exitosamente');
        await cargarCursos();
      }
    } catch (error) {
      console.error('Error al eliminar curso:', error);
      alert(error.message || 'Error al eliminar curso');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="admin-usuarios">
      {/* Header */}
      <div className="admin-usuarios-header">
        <h1 className="admin-usuarios-title">Cursos</h1>
        <button className="admin-usuarios-btn-crear" onClick={abrirModalCrear}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Crear curso
        </button>
      </div>

      {/* Filtros */}
      <div className="admin-usuarios-filters">
        <div className="admin-usuarios-filter-group">
          <label>Estado:</label>
          <div className="admin-usuarios-select-wrapper">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="admin-usuarios-select"
            >
              <option value="Todos">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="admin-usuarios-search">
          <input
            type="text"
            placeholder="Buscar"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="admin-usuarios-search-input"
          />
          <svg className="admin-usuarios-search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Tabla */}
      <div className="admin-usuarios-table-container">
        <table className="admin-usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Código Acceso</th>
              <th>GM Asignado</th>
              <th>Estudiantes</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cursosFiltrados.map((curso, index) => (
              <tr key={curso.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <td>{curso.id}</td>
                <td>{curso.nombre}</td>
                <td>{curso.descripcion ? (curso.descripcion.length > 50 ? curso.descripcion.substring(0, 50) + '...' : curso.descripcion) : '-'}</td>
                <td>{curso.codigo_acceso || '-'}</td>
                <td>{curso.gm_nombre || '-'}</td>
                <td>{curso.total_estudiantes || 0}</td>
                <td>
                  <span className={`admin-usuarios-badge ${curso.activo ? 'activo' : 'inactivo'}`}>
                    {curso.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      className="admin-usuarios-btn-editar"
                      onClick={() => abrirModalEditar(curso)}
                    >
                      Editar
                    </button>
                    <button
                      className="admin-usuarios-btn-eliminar"
                      onClick={() => handleEliminarCurso(curso.id, curso.nombre)}
                      title="Eliminar curso"
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cursosFiltrados.length === 0 && (
          <div className="admin-usuarios-empty">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <p>No se encontraron cursos</p>
          </div>
        )}
      </div>

      {/* MODAL CREAR */}
      {modalCrearAbierto && (
        <div className="admin-usuarios-modal-backdrop" onClick={cerrarModalCrear}>
          <div className="admin-usuarios-modal" onClick={(e) => e.stopPropagation()}>
            <header className="admin-usuarios-modal-header">
              <h2>Crear curso</h2>
            </header>

            <form onSubmit={handleCrearCurso} className="admin-usuarios-form">
              <div className="admin-usuarios-form-group">
                <label>Nombre del curso *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={errores.nombre ? "error" : ""}
                  required
                  minLength={3}
                  placeholder="Ej: Matemáticas 1°"
                />
                {errores.nombre && (
                  <span className="admin-usuarios-error">{errores.nombre}</span>
                )}
              </div>

              <div className="admin-usuarios-form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Descripción del curso (opcional)"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    color: '#1f2937',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>

              <div className="admin-usuarios-form-group">
                <label>Asignar a GM *</label>
                <select
                  name="gm_rut"
                  value={formData.gm_rut}
                  onChange={handleInputChange}
                  className={errores.gm_rut ? "error" : ""}
                  required
                >
                  <option value="">Seleccionar GM</option>
                  {gms.map(gm => (
                    <option key={gm.rut} value={gm.rut}>
                      {gm.nombre} - {gm.rut}
                    </option>
                  ))}
                </select>
                {errores.gm_rut && (
                  <span className="admin-usuarios-error">{errores.gm_rut}</span>
                )}
              </div>

              <div className="admin-usuarios-form-group">
                <label>Código de acceso</label>
                <input
                  type="text"
                  name="codigo_acceso"
                  value={formData.codigo_acceso}
                  onChange={handleInputChange}
                  placeholder="Opcional - código único para el curso"
                  maxLength={20}
                />
              </div>

              <div className="admin-usuarios-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                  />
                  Curso activo
                </label>
              </div>

              {/* Mensaje de error general */}
              {errores.general && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fee',
                  border: '1px solid #fcc',
                  borderRadius: '4px',
                  color: '#c00',
                  marginTop: '16px'
                }}>
                  <strong>Error:</strong> {errores.general}
                </div>
              )}

              <footer className="admin-usuarios-modal-footer">
                <button
                  type="button"
                  className="admin-usuarios-btn-cancelar"
                  onClick={cerrarModalCrear}
                  disabled={cargando}
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="admin-usuarios-btn-guardar"
                  disabled={cargando}
                >
                  {cargando ? 'Guardando...' : 'Guardar'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {modalEditarAbierto && cursoSeleccionado && (
        <div className="admin-usuarios-modal-backdrop" onClick={cerrarModalEditar}>
          <div className="admin-usuarios-modal" onClick={(e) => e.stopPropagation()}>
            <header className="admin-usuarios-modal-header">
              <h2>Editar curso</h2>
            </header>

            <form onSubmit={handleSubmitEditar} className="admin-usuarios-form">
              <div className="admin-usuarios-form-group">
                <label>Nombre del curso *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={errores.nombre ? "error" : ""}
                  required
                  minLength={3}
                />
                {errores.nombre && (
                  <span className="admin-usuarios-error">{errores.nombre}</span>
                )}
              </div>

              <div className="admin-usuarios-form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Descripción del curso (opcional)"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    color: '#1f2937',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>

              <div className="admin-usuarios-form-group">
                <label>Asignar a GM *</label>
                <select
                  name="gm_rut"
                  value={formData.gm_rut}
                  onChange={handleInputChange}
                  className={errores.gm_rut ? "error" : ""}
                  required
                >
                  <option value="">Seleccionar GM</option>
                  {gms.map(gm => (
                    <option key={gm.rut} value={gm.rut}>
                      {gm.nombre} - {gm.rut}
                    </option>
                  ))}
                </select>
                {errores.gm_rut && (
                  <span className="admin-usuarios-error">{errores.gm_rut}</span>
                )}
              </div>

              <div className="admin-usuarios-form-group">
                <label>Código de acceso</label>
                <input
                  type="text"
                  name="codigo_acceso"
                  value={formData.codigo_acceso}
                  onChange={handleInputChange}
                  placeholder="Opcional"
                  maxLength={20}
                />
              </div>

              <div className="admin-usuarios-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                  />
                  Curso activo
                </label>
              </div>

              <footer className="admin-usuarios-modal-footer">
                <button
                  type="button"
                  className="admin-usuarios-btn-cancelar"
                  onClick={cerrarModalEditar}
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="admin-usuarios-btn-guardar"
                >
                  Guardar
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN EDITAR */}
      {confirmarEditarAbierto && (
        <div
          className="admin-usuarios-confirm-backdrop"
          onClick={() => setConfirmarEditarAbierto(false)}
        >
          <div
            className="admin-usuarios-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Confirmar cambios</h3>
            <p>
              ¿Estás segura de guardar los cambios realizados en este curso?
            </p>
            <div className="admin-usuarios-confirm-actions">
              <button
                type="button"
                className="admin-usuarios-btn-cancelar"
                onClick={() => setConfirmarEditarAbierto(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="admin-usuarios-btn-guardar"
                onClick={handleEditarCurso}
              >
                Sí, guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCursos;
