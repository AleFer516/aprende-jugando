// src/pages/admin/AdminPerfil.jsx
// Página de perfil del usuario administrador.

import { useState } from "react";
import "../../styles/adminPerfil.css";
import "../../styles/themes.css";

function AdminPerfil() {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [mensajeError, setMensajeError] = useState(null);

  const [datosUsuario, setDatosUsuario] = useState({
    nombre: "Jeremías Cansino",
    correo: "jeremias.cansino@ejemplo.cl",
    rol: "Administrador",
    telefono: "+56 9 1234 5678",
    biografia: "Administrador del sistema Luminia. Apasionado por la educación y la tecnología.",
    fechaRegistro: "15 de enero, 2024",
    ultimoAcceso: "Hoy a las 14:32"
  });

  const [formData, setFormData] = useState({ ...datosUsuario });

  const [passwordData, setPasswordData] = useState({
    actual: "",
    nueva: "",
    confirmar: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const activarModoEdicion = () => {
    setModoEdicion(true);
    setFormData({ ...datosUsuario });
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setFormData({ ...datosUsuario });
  };

  const guardarCambios = () => {
    setDatosUsuario({ ...formData });
    setModoEdicion(false);
    setMensajeExito("Perfil actualizado correctamente.");
    setTimeout(() => setMensajeExito(null), 3000);
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const abrirModalPassword = () => {
    setPasswordData({ actual: "", nueva: "", confirmar: "" });
    setModalPasswordOpen(true);
  };

  const cerrarModalPassword = () => {
    setModalPasswordOpen(false);
    setPasswordData({ actual: "", nueva: "", confirmar: "" });
    setMensajeError(null);
  };

  const validarPassword = () => {
    // Validar que todos los campos estén llenos
    if (!passwordData.actual || !passwordData.nueva || !passwordData.confirmar) {
      setMensajeError("Todos los campos son obligatorios.");
      return false;
    }

    // Validar que la nueva contraseña tenga al menos 8 caracteres
    if (passwordData.nueva.length < 8) {
      setMensajeError("La nueva contraseña debe tener al menos 8 caracteres.");
      return false;
    }

    // Validar que la nueva contraseña contenga al menos una letra mayúscula
    if (!/[A-Z]/.test(passwordData.nueva)) {
      setMensajeError("La nueva contraseña debe contener al menos una letra mayúscula.");
      return false;
    }

    // Validar que la nueva contraseña contenga al menos una letra minúscula
    if (!/[a-z]/.test(passwordData.nueva)) {
      setMensajeError("La nueva contraseña debe contener al menos una letra minúscula.");
      return false;
    }

    // Validar que la nueva contraseña contenga al menos un número
    if (!/[0-9]/.test(passwordData.nueva)) {
      setMensajeError("La nueva contraseña debe contener al menos un número.");
      return false;
    }

    // Validar que las contraseñas coincidan
    if (passwordData.nueva !== passwordData.confirmar) {
      setMensajeError("Las contraseñas no coinciden.");
      return false;
    }

    // Validar que la nueva contraseña sea diferente a la actual
    if (passwordData.actual === passwordData.nueva) {
      setMensajeError("La nueva contraseña debe ser diferente a la actual.");
      return false;
    }

    return true;
  };

  const cambiarPassword = () => {
    setMensajeError(null);

    if (!validarPassword()) {
      return;
    }

    // Aquí iría la lógica para cambiar la contraseña en el backend
    // Por ahora solo mostramos un mensaje de éxito
    setModalPasswordOpen(false);
    setPasswordData({ actual: "", nueva: "", confirmar: "" });
    setMensajeExito("Contraseña actualizada correctamente.");
    setTimeout(() => setMensajeExito(null), 3000);
  };

  return (
    <div className="admin-perfil">
      {/* Header */}
      <div className="admin-perfil-header">
        <h1 className="admin-perfil-title">Mi Perfil</h1>
        {!modoEdicion && (
          <button className="admin-perfil-btn-editar" onClick={activarModoEdicion}>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Editar perfil
          </button>
        )}
      </div>

      {/* Toast de éxito */}
      {mensajeExito && (
        <div className="admin-perfil-toast">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {mensajeExito}
        </div>
      )}

      {/* Contenido principal */}
      <div className="admin-perfil-contenido">
        {/* Tarjeta de información personal */}
        <div className="admin-perfil-card">
          <div className="admin-perfil-card-header">
            <h2>Información Personal</h2>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="admin-perfil-card-body">
            {/* Avatar */}
            <div className="admin-perfil-avatar-section">
              <div className="admin-perfil-avatar">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              {modoEdicion && (
                <button className="admin-perfil-btn-cambiar-foto">
                  Cambiar foto
                </button>
              )}
            </div>

            {/* Formulario */}
            <div className="admin-perfil-form">
              <div className="admin-perfil-form-row">
                <div className="admin-perfil-form-group">
                  <label>Nombre completo</label>
                  {modoEdicion ? (
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{datosUsuario.nombre}</p>
                  )}
                </div>

                <div className="admin-perfil-form-group">
                  <label>Correo electrónico</label>
                  {modoEdicion ? (
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{datosUsuario.correo}</p>
                  )}
                </div>
              </div>

              <div className="admin-perfil-form-row">
                <div className="admin-perfil-form-group">
                  <label>Rol</label>
                  <p className="admin-perfil-rol-badge">{datosUsuario.rol}</p>
                </div>

                <div className="admin-perfil-form-group">
                  <label>Teléfono</label>
                  {modoEdicion ? (
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{datosUsuario.telefono}</p>
                  )}
                </div>
              </div>

              <div className="admin-perfil-form-group">
                <label>Biografía</label>
                {modoEdicion ? (
                  <textarea
                    name="biografia"
                    value={formData.biografia}
                    onChange={handleInputChange}
                    rows="3"
                  />
                ) : (
                  <p>{datosUsuario.biografia}</p>
                )}
              </div>
            </div>

            {/* Botones de acción en modo edición */}
            {modoEdicion && (
              <div className="admin-perfil-form-actions">
                <button className="admin-perfil-btn-cancelar" onClick={cancelarEdicion}>
                  Cancelar
                </button>
                <button className="admin-perfil-btn-guardar" onClick={guardarCambios}>
                  Guardar cambios
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tarjeta de actividad */}
        <div className="admin-perfil-card">
          <div className="admin-perfil-card-header">
            <h2>Actividad Reciente</h2>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="admin-perfil-card-body">
            <div className="admin-perfil-info-grid">
              <div className="admin-perfil-info-item">
                <span className="admin-perfil-info-label">Fecha de registro</span>
                <span className="admin-perfil-info-value">{datosUsuario.fechaRegistro}</span>
              </div>

              <div className="admin-perfil-info-item">
                <span className="admin-perfil-info-label">Último acceso</span>
                <span className="admin-perfil-info-value">{datosUsuario.ultimoAcceso}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta de seguridad */}
        <div className="admin-perfil-card">
          <div className="admin-perfil-card-header">
            <h2>Seguridad</h2>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="admin-perfil-card-body">
            <button className="admin-perfil-btn-cambiar-password" onClick={abrirModalPassword}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Cambiar contraseña
            </button>
          </div>
        </div>
      </div>

      {/* MODAL CAMBIAR CONTRASEÑA */}
      {modalPasswordOpen && (
        <div className="admin-perfil-modal-backdrop" onClick={cerrarModalPassword}>
          <div className="admin-perfil-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <header className="admin-perfil-modal-header">
              <h2>Cambiar contraseña</h2>
              <button className="admin-perfil-modal-close" onClick={cerrarModalPassword} aria-label="Cerrar modal">
                ×
              </button>
            </header>

            <div className="admin-perfil-modal-body">
              {mensajeError && (
                <div className="admin-perfil-modal-error">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {mensajeError}
                </div>
              )}

              <div className="admin-perfil-modal-form">
                <div className="admin-perfil-modal-form-group">
                  <label htmlFor="password-actual">Contraseña actual</label>
                  <input
                    type="password"
                    id="password-actual"
                    name="actual"
                    value={passwordData.actual}
                    onChange={handlePasswordInputChange}
                    placeholder="Ingresa tu contraseña actual"
                  />
                </div>

                <div className="admin-perfil-modal-form-group">
                  <label htmlFor="password-nueva">Nueva contraseña</label>
                  <input
                    type="password"
                    id="password-nueva"
                    name="nueva"
                    value={passwordData.nueva}
                    onChange={handlePasswordInputChange}
                    placeholder="Ingresa tu nueva contraseña"
                  />
                </div>

                <div className="admin-perfil-modal-form-group">
                  <label htmlFor="password-confirmar">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    id="password-confirmar"
                    name="confirmar"
                    value={passwordData.confirmar}
                    onChange={handlePasswordInputChange}
                    placeholder="Confirma tu nueva contraseña"
                  />
                </div>

                <div className="admin-perfil-modal-requisitos">
                  <p className="admin-perfil-modal-requisitos-title">La contraseña debe cumplir con:</p>
                  <ul className="admin-perfil-modal-requisitos-list">
                    <li className={passwordData.nueva.length >= 8 ? "valido" : ""}>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Mínimo 8 caracteres
                    </li>
                    <li className={/[A-Z]/.test(passwordData.nueva) ? "valido" : ""}>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Al menos una letra mayúscula
                    </li>
                    <li className={/[a-z]/.test(passwordData.nueva) ? "valido" : ""}>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Al menos una letra minúscula
                    </li>
                    <li className={/[0-9]/.test(passwordData.nueva) ? "valido" : ""}>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Al menos un número
                    </li>
                    <li className={passwordData.nueva && passwordData.confirmar && passwordData.nueva === passwordData.confirmar ? "valido" : ""}>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Las contraseñas coinciden
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <footer className="admin-perfil-modal-footer">
              <button
                type="button"
                className="admin-perfil-modal-btn-cancelar"
                onClick={cerrarModalPassword}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="admin-perfil-modal-btn-guardar"
                onClick={cambiarPassword}
              >
                Cambiar contraseña
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPerfil;
