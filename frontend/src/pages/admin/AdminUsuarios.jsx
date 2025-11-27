// src/pages/admin/AdminUsuarios.jsx
// Panel de gestión de usuarios con filtros, búsqueda y acciones

import { useState } from "react";
import "../../styles/adminUsuarios.css";

function AdminUsuarios() {
  // Datos de ejemplo de usuarios
  const usuariosData = [
    {
      id: 1,
      rut: "12.345.678-9",
      nombre: "Alejandra Fernandez",
      correo: "Correo1@gmail.com",
      rol: "Estudiante",
      estado: "Activo"
    },
    {
      id: 2,
      rut: "34.567.891-2",
      nombre: "Jeremias Cancino",
      correo: "Correo2@gmail.com",
      rol: "GM",
      estado: "Inactivo"
    },
    {
      id: 3,
      rut: "56.789.123-4",
      nombre: "Camila Santis",
      correo: "Correo3@gmail.com",
      rol: "Estudiante",
      estado: "Inactivo"
    },
    {
      id: 4,
      rut: "23.456.789-0",
      nombre: "Roberto Silva",
      correo: "Correo4@gmail.com",
      rol: "Profesor",
      estado: "Activo"
    },
    {
      id: 5,
      rut: "45.678.912-3",
      nombre: "María González",
      correo: "Correo5@gmail.com",
      rol: "Estudiante",
      estado: "Activo"
    }
  ];

  const [usuarios] = useState(usuariosData);
  const [filtroRol, setFiltroRol] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Activo");
  const [busqueda, setBusqueda] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [confirmarEditarAbierto, setConfirmarEditarAbierto] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    rol: "",
    estado: "Activo",
    institucion: "",
    password: "",
    confirmPassword: ""
  });
  const [errores, setErrores] = useState({});

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const cumpleRol = filtroRol === "Todos" || usuario.rol === filtroRol;
    const cumpleEstado = filtroEstado === "Todos" || usuario.estado === filtroEstado;
    const cumpleBusqueda =
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.rut.includes(busqueda) ||
      usuario.correo.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleRol && cumpleEstado && cumpleBusqueda;
  });

  // Validaciones
  const validarCorreo = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.(com|cl)$/i;
    return regex.test(correo);
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
      nombre: "",
      correo: "",
      rol: "Estudiante",
      estado: "Activo",
      institucion: "",
      password: "",
      confirmPassword: ""
    });
    setErrores({});
    setModalCrearAbierto(true);
  };

  const cerrarModalCrear = () => {
    setModalCrearAbierto(false);
    setFormData({
      nombre: "",
      correo: "",
      rol: "",
      estado: "Activo",
      institucion: "",
      password: "",
      confirmPassword: ""
    });
    setErrores({});
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormData({
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
      institucion: ""
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

  const handleCrearUsuario = (e) => {
    e.preventDefault();
    const nuevosErrores = {};

    if (!validarCorreo(formData.correo)) {
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
    }

    if (formData.password !== formData.confirmPassword) {
      nuevosErrores.confirmPassword = "Las contraseñas no coinciden";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    console.log("Crear usuario:", formData);
    cerrarModalCrear();
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
  const handleEditarUsuario = () => {
    console.log("Editar usuario:", formData);
    setConfirmarEditarAbierto(false);
    cerrarModalEditar();
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
              <th>Rut</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((usuario, index) => (
              <tr key={usuario.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <td>{usuario.rut}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.correo}</td>
                <td>{usuario.rol}</td>
                <td>
                  <span className={`admin-usuarios-badge ${usuario.estado.toLowerCase()}`}>
                    {usuario.estado}
                  </span>
                </td>
                <td>
                  <button
                    className="admin-usuarios-btn-editar"
                    onClick={() => abrirModalEditar(usuario)}
                  >
                    Editar
                  </button>
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
