// src/pages/admin/AdminUsuarios.jsx
// Panel de gestión de usuarios con filtros, búsqueda y acciones

import { useState, useEffect, useCallback } from "react";
import "../../styles/adminUsuarios.css";
import adminService from "../../services/adminService";

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtroRol, setFiltroRol] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [confirmarEditarAbierto, setConfirmarEditarAbierto] = useState(false);
  const [formData, setFormData] = useState({
    rut: "",
    nombre: "",
    correo: "",
    rol: "",
    estado: "Activo",
    institucion: "",
    telefono: "",
    password: "",
    confirmPassword: ""
  });
  const [errores, setErrores] = useState({});

  const cargarUsuarios = useCallback(async () => {
    try {
      setCargando(true);
      const response = await adminService.getUsuarios({
        rol: filtroRol,
        estado: filtroEstado,
        busqueda: busqueda
      });

      if (response.success) {
        setUsuarios(response.data);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setCargando(false);
    }
  }, [filtroRol, filtroEstado, busqueda]);

  // Cargar usuarios al montar el componente y cuando cambien los filtros
  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  // Filtrar usuarios (ahora solo para la UI, los datos vienen filtrados del backend)
  const usuariosFiltrados = usuarios;

  // Validaciones
  const validarCorreo = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.(com|cl)$/i;
    return regex.test(correo);
  };

  const validarRut = (rut) => {
    const regex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
    return regex.test(rut);
  };

  const formatearRut = (value) => {
    const cleaned = value.replace(/[^0-9kK]/g, '');
    if (cleaned.length === 0) return '';
    const dv = cleaned.slice(-1);
    const numero = cleaned.slice(0, -1);
    let formateado = '';
    for (let i = numero.length - 1; i >= 0; i--) {
      formateado = numero[i] + formateado;
      if ((numero.length - i) % 3 === 0 && i !== 0) {
        formateado = '.' + formateado;
      }
    }
    return formateado + '-' + dv.toUpperCase();
  };

  const validarPassword = (password) => {
    return {
      tieneMinimo8: password.length >= 8,
      tieneMayuscula: /[A-Z]/.test(password),
      tieneNumero: /[0-9]/.test(password),
      tieneSimbolo: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const esFormularioValido = () => {
    const val = validarPassword(formData.password);
    return (
      validarRut(formData.rut) &&
      formData.nombre.length >= 3 &&
      validarCorreo(formData.correo) &&
      formData.rol &&
      val.tieneMinimo8 &&
      val.tieneMayuscula &&
      val.tieneNumero &&
      val.tieneSimbolo &&
      formData.password === formData.confirmPassword
    );
  };

  const esFormularioEditarValido = () => {
    return (
      formData.nombre.length >= 3 &&
      validarCorreo(formData.correo) &&
      formData.rol
    );
  };

  // Manejadores
  const abrirModalCrear = () => {
    setFormData({
      rut: "",
      nombre: "",
      correo: "",
      rol: "Estudiante",
      estado: "Activo",
      institucion: "",
      telefono: "",
      password: "",
      confirmPassword: ""
    });
    setErrores({});
    setModalCrearAbierto(true);
  };

  const cerrarModalCrear = () => {
    setModalCrearAbierto(false);
    setFormData({
      rut: "",
      nombre: "",
      correo: "",
      rol: "",
      estado: "Activo",
      institucion: "",
      telefono: "",
      password: "",
      confirmPassword: ""
    });
    setErrores({});
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormData({
      rut: usuario.rut,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
      institucion: usuario.institucion || "",
      telefono: usuario.telefono || ""
    });
    setErrores({});
    setModalEditarAbierto(true);
  };

  const cerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setUsuarioSeleccionado(null);
    setErrores({});
    setConfirmarEditarAbierto(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    console.log('🔵 handleCrearUsuario ejecutado');
    console.log('📋 Datos del formulario:', formData);

    const nuevosErrores = {};

    // Validar RUT
    if (!validarRut(formData.rut)) {
      console.log('❌ RUT inválido:', formData.rut);
      nuevosErrores.rut = "Formato de RUT inválido. Debe ser: XX.XXX.XXX-X";
    }

    if (!validarCorreo(formData.correo)) {
      console.log('❌ Correo inválido:', formData.correo);
      nuevosErrores.correo = "El correo debe tener @ y terminar en .com o .cl";
    }

    const val = validarPassword(formData.password);
    if (!val.tieneMinimo8 || !val.tieneMayuscula || !val.tieneNumero || !val.tieneSimbolo) {
      const requisitos = [];
      if (!val.tieneMinimo8) requisitos.push("mínimo 8 caracteres");
      if (!val.tieneMayuscula) requisitos.push("una mayúscula");
      if (!val.tieneNumero) requisitos.push("un número");
      if (!val.tieneSimbolo) requisitos.push("un símbolo");
      nuevosErrores.password = `Falta: ${requisitos.join(", ")}`;
      console.log('❌ Contraseña inválida:', requisitos);
    }

    if (formData.password !== formData.confirmPassword) {
      console.log('❌ Contraseñas no coinciden');
      nuevosErrores.confirmPassword = "Las contraseñas no coinciden";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      console.log('❌ Errores de validación:', nuevosErrores);
      setErrores(nuevosErrores);
      return;
    }

    console.log('✅ Validaciones pasadas, enviando al backend...');

    try {
      setCargando(true);
      console.log('📤 Enviando datos al backend:', {
        rut: formData.rut,
        nombre: formData.nombre,
        correo: formData.correo,
        rol: formData.rol,
        estado: formData.estado,
        institucion: formData.institucion,
        telefono: formData.telefono
      });

      const response = await adminService.crearUsuario({
        rut: formData.rut,
        nombre: formData.nombre,
        correo: formData.correo,
        rol: formData.rol,
        estado: formData.estado,
        institucion: formData.institucion,
        telefono: formData.telefono,
        password: formData.password
      });

      console.log('📥 Respuesta del backend:', response);

      if (response.success) {
        console.log('✅ Usuario creado exitosamente');
        cerrarModalCrear();
        // Recargar la lista de usuarios
        await cargarUsuarios();
      } else {
        console.log('⚠️ Backend retornó success=false:', response);
        setErrores({ general: response.message || 'Error al crear usuario' });
      }
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
      console.error('❌ Error completo:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.data?.message) {
        setErrores({ general: error.response.data.message });
      } else if (error.message) {
        setErrores({ general: `Error: ${error.message}` });
      } else {
        setErrores({ general: 'Error desconocido al crear usuario' });
      }
    } finally {
      setCargando(false);
      console.log('🔵 handleCrearUsuario finalizado');
    }
  };

  // ⚠ Nuevo: submit del formulario de editar → abre confirmación
  const handleSubmitEditar = (e) => {
    e.preventDefault();
    const nuevosErrores = {};

    if (!validarCorreo(formData.correo)) {
      nuevosErrores.correo = "El correo debe tener @ y terminar en .com o .cl";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});
    setConfirmarEditarAbierto(true);
  };

  // ⚠ Nuevo: acción final al confirmar "Sí, guardar"
  const handleEditarUsuario = async () => {
    try {
      setCargando(true);
      const response = await adminService.actualizarUsuario(usuarioSeleccionado.rut, {
        nombre: formData.nombre,
        correo: formData.correo,
        rol: formData.rol,
        estado: formData.estado,
        institucion: formData.institucion,
        telefono: formData.telefono
      });

      if (response.success) {
        setConfirmarEditarAbierto(false);
        cerrarModalEditar();
        // Recargar la lista de usuarios
        await cargarUsuarios();
      }
    } catch (error) {
      console.error('Error al editar usuario:', error);
      if (error.response?.data?.message) {
        setErrores({ general: error.response.data.message });
      }
    } finally {
      setCargando(false);
    }
  };

  // Eliminar usuario
  const handleEliminarUsuario = async (rut, nombre) => {
    // Confirmar eliminación
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar al usuario "${nombre}" (${rut})?\n\nEsta acción eliminará permanentemente:\n- Los datos del usuario\n- Su progreso en misiones\n- Sus logros y estadísticas\n\nEsta acción NO se puede deshacer.`
    );

    if (!confirmar) return;

    try {
      setCargando(true);
      const response = await adminService.eliminarUsuario(rut);

      if (response.success) {
        // Mostrar mensaje de éxito
        alert('Usuario eliminado exitosamente');
        // Recargar la lista de usuarios
        await cargarUsuarios();
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert(error.response?.data?.message || 'Error al eliminar usuario');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="admin-usuarios">
      {/* Header */}
      <div className="admin-usuarios-header">
        <h1 className="admin-usuarios-title">Evaluaciones</h1>
        <button className="admin-usuarios-btn-crear" onClick={abrirModalCrear}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Crear usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="admin-usuarios-filters">
        <div className="admin-usuarios-filter-group">
          <label>Rol:</label>
          <div className="admin-usuarios-select-wrapper">
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="admin-usuarios-select"
            >
              <option value="Todos">Todos</option>
              <option value="Estudiante">Estudiante</option>
              <option value="Profesor">Profesor</option>
              <option value="GM">GM</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

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
              <th>RUT</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Institución</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((usuario, index) => (
              <tr key={usuario.rut} style={{ animationDelay: `${index * 0.05}s` }}>
                <td>{usuario.rut}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.correo}</td>
                <td>{usuario.institucion || '-'}</td>
                <td>{usuario.telefono || '-'}</td>
                <td>{usuario.rol}</td>
                <td>
                  <span className={`admin-usuarios-badge ${usuario.estado.toLowerCase()}`}>
                    {usuario.estado}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      className="admin-usuarios-btn-editar"
                      onClick={() => abrirModalEditar(usuario)}
                    >
                      Editar
                    </button>
                    <button
                      className="admin-usuarios-btn-eliminar"
                      onClick={() => handleEliminarUsuario(usuario.rut, usuario.nombre)}
                      title="Eliminar usuario"
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

        {usuariosFiltrados.length === 0 && (
          <div className="admin-usuarios-empty">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <p>No se encontraron usuarios</p>
          </div>
        )}
      </div>

      {/* MODAL CREAR */}
      {modalCrearAbierto && (
        <div className="admin-usuarios-modal-backdrop" onClick={cerrarModalCrear}>
          <div className="admin-usuarios-modal" onClick={(e) => e.stopPropagation()}>
            <header className="admin-usuarios-modal-header">
              <h2>Crear usuario</h2>
            </header>

            <form onSubmit={handleCrearUsuario} className="admin-usuarios-form">
              <div className="admin-usuarios-avatar-section">
                <div className="admin-usuarios-avatar-large">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* CAMPO RUT */}
              <div className="admin-usuarios-form-group">
                <label>RUT *</label>
                <input
                  type="text"
                  name="rut"
                  value={formData.rut}
                  onChange={(e) => {
                    const formatted = formatearRut(e.target.value);
                    setFormData(prev => ({ ...prev, rut: formatted }));
                    if (errores.rut) {
                      setErrores(prev => ({ ...prev, rut: "" }));
                    }
                  }}
                  className={errores.rut ? "error" : ""}
                  placeholder="12.345.678-9"
                  required
                  maxLength={12}
                />
                {errores.rut && (
                  <span className="admin-usuarios-error">{errores.rut}</span>
                )}
                {formData.rut && (
                  <div className="admin-usuarios-password-hints">
                    <span className={validarRut(formData.rut) ? "valid" : ""}>
                      {validarRut(formData.rut) ? "✓ RUT válido" : "✗ Formato: XX.XXX.XXX-X"}
                    </span>
                  </div>
                )}
              </div>

              <div className="admin-usuarios-form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  minLength={3}
                />
              </div>

              <div className="admin-usuarios-form-group">
                <label>Correo electrónico</label>
                <input
                  type="text"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  className={errores.correo ? "error" : ""}
                  required
                />
                {errores.correo && (
                  <span className="admin-usuarios-error">{errores.correo}</span>
                )}
              </div>

              <div className="admin-usuarios-form-row">
                <div className="admin-usuarios-form-group">
                  <label>Rol</label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="Estudiante">Estudiante</option>
                    <option value="Profesor">Profesor</option>
                    <option value="GM">GM</option>
                    <option value="Admin">Admin</option>
                  </select>
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
              </div>

              {/* FILA INSTITUCIÓN Y TELÉFONO */}
              <div className="admin-usuarios-form-row">
                <div className="admin-usuarios-form-group">
                  <label>Institución</label>
                  <input
                    type="text"
                    name="institucion"
                    value={formData.institucion}
                    onChange={handleInputChange}
                    placeholder="Opcional"
                  />
                </div>
                <div className="admin-usuarios-form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </div>

              <div className="admin-usuarios-form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errores.password ? "error" : ""}
                  required
                  minLength={8}
                />
                {errores.password && (
                  <span className="admin-usuarios-error">{errores.password}</span>
                )}
                <div className="admin-usuarios-password-hints">
                  <span
                    className={
                      formData.password.length >= 8 ? "valid" : ""
                    }
                  >
                    ✓ Mínimo 8 caracteres
                  </span>
                  <span
                    className={
                      /[A-Z]/.test(formData.password) ? "valid" : ""
                    }
                  >
                    ✓ Una mayúscula
                  </span>
                  <span
                    className={
                      /[0-9]/.test(formData.password) ? "valid" : ""
                    }
                  >
                    ✓ Un número
                  </span>
                  <span
                    className={
                      /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                        ? "valid"
                        : ""
                    }
                  >
                    ✓ Un símbolo
                  </span>
                </div>
              </div>

              <div className="admin-usuarios-form-group">
                <label>Confirmar contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errores.confirmPassword ? "error" : ""}
                  required
                  minLength={8}
                />
                {errores.confirmPassword && (
                  <span className="admin-usuarios-error">
                    {errores.confirmPassword}
                  </span>
                )}
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
                  disabled={!esFormularioValido() || cargando}
                >
                  {cargando ? 'Guardando...' : 'Guardar'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {modalEditarAbierto && usuarioSeleccionado && (
        <div className="admin-usuarios-modal-backdrop" onClick={cerrarModalEditar}>
          <div className="admin-usuarios-modal" onClick={(e) => e.stopPropagation()}>
            <header className="admin-usuarios-modal-header">
              <h2>Editar usuario</h2>
            </header>

            {/* ⚠ Aquí cambiamos el onSubmit */}
            <form onSubmit={handleSubmitEditar} className="admin-usuarios-form">
              <div className="admin-usuarios-avatar-section">
                <div className="admin-usuarios-avatar-large">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* CAMPO RUT (NO EDITABLE) */}
              <div className="admin-usuarios-form-group">
                <label>RUT</label>
                <input
                  type="text"
                  name="rut"
                  value={formData.rut}
                  disabled
                  style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                />
              </div>

              <div className="admin-usuarios-form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  minLength={3}
                />
              </div>

              <div className="admin-usuarios-form-group">
                <label>Correo electrónico</label>
                <input
                  type="text"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  className={errores.correo ? "error" : ""}
                  required
                />
                {errores.correo && (
                  <span className="admin-usuarios-error">{errores.correo}</span>
                )}
              </div>

              <div className="admin-usuarios-form-row">
                <div className="admin-usuarios-form-group">
                  <label>Rol</label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Estudiante">Estudiante</option>
                    <option value="Profesor">Profesor</option>
                    <option value="GM">GM</option>
                    <option value="Admin">Admin</option>
                  </select>
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
              </div>

              {/* FILA INSTITUCIÓN Y TELÉFONO */}
              <div className="admin-usuarios-form-row">
                <div className="admin-usuarios-form-group">
                  <label>Institución</label>
                  <input
                    type="text"
                    name="institucion"
                    value={formData.institucion || ""}
                    onChange={handleInputChange}
                    placeholder="Opcional"
                  />
                </div>
                <div className="admin-usuarios-form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono || ""}
                    onChange={handleInputChange}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
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
                  disabled={!esFormularioEditarValido()}
                >
                  Guardar
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* ⚠ MODAL CONFIRMACIÓN EDITAR */}
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
              ¿Estás segura de guardar los cambios realizados en este usuario?
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
                onClick={handleEditarUsuario}
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

export default AdminUsuarios;
