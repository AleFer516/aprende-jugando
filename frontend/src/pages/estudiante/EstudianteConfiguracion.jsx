// src/pages/estudiante/EstudianteConfiguracion.jsx
// Página de configuración del panel de estudiantes

import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/estudianteConfiguracion.css";

function EstudianteConfiguracion() {
  const { theme, setTheme } = useTheme();

  const [infoPersonal, setInfoPersonal] = useState({
    nombre: "Estudiante",
    email: "estudiante@inacapmail.cl",
    avatar: null,
  });

  const [preferencias, setPreferencias] = useState({
    tema: theme,
    notificaciones: true,
    idioma: "Español",
  });

  const [seguridad, setSeguridad] = useState({
    passwordActual: "",
    passwordNueva: "",
    passwordConfirmar: "",
  });

  const [mensajeToast, setMensajeToast] = useState("");
  const [tipoToast, setTipoToast] = useState("success");

  const mostrarToast = (mensaje, tipo = "success") => {
    setMensajeToast(mensaje);
    setTipoToast(tipo);
    setTimeout(() => {
      setMensajeToast("");
    }, 2500);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInfoPersonal({ ...infoPersonal, avatar: reader.result });
        mostrarToast("Avatar actualizado correctamente");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInfoPersonalChange = (e) => {
    const { name, value } = e.target;
    setInfoPersonal({ ...infoPersonal, [name]: value });
  };

  const handlePreferenciasChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setPreferencias((prev) => ({ ...prev, [name]: newValue }));

    // Si se cambia el tema, actualizar el contexto
    if (name === "tema") {
      setTheme(value);
    }
  };

  const handleSeguridadChange = (e) => {
    const { name, value } = e.target;
    setSeguridad({ ...seguridad, [name]: value });
  };

  const validarPassword = () => {
    const errores = [];
    const { passwordActual, passwordNueva, passwordConfirmar } = seguridad;

    if (!passwordActual)
      errores.push("Debes ingresar tu contraseña actual");
    if (!passwordNueva)
      errores.push("Debes ingresar una nueva contraseña");
    if (!passwordConfirmar)
      errores.push("Debes confirmar tu nueva contraseña");

    if (errores.length > 0) {
      return errores;
    }

    if (passwordNueva.length < 8) {
      errores.push("La contraseña debe tener al menos 8 caracteres");
    }

    if (!/[A-Z]/.test(passwordNueva)) {
      errores.push(
        "La contraseña debe contener al menos una letra mayúscula"
      );
    }

    if (!/[0-9]/.test(passwordNueva)) {
      errores.push("La contraseña debe contener al menos un número");
    }

    // eslint-disable-next-line no-useless-escape
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordNueva)) {
      errores.push(
        "La contraseña debe contener al menos un símbolo especial"
      );
    }

    if (passwordNueva !== passwordConfirmar) {
      errores.push("Las contraseñas no coinciden");
    }

    return errores;
  };

  const handleGuardarInfoPersonal = (e) => {
    e.preventDefault();
    mostrarToast("Información personal actualizada correctamente");
  };

  const handleGuardarPreferencias = (e) => {
    e.preventDefault();
    mostrarToast("Preferencias guardadas correctamente");
  };

  const handleCambiarPassword = (e) => {
    e.preventDefault();

    const errores = validarPassword();

    if (errores.length > 0) {
      mostrarToast(errores[0], "error");
      return;
    }

    // Aquí iría la lógica para cambiar la contraseña
    mostrarToast("Contraseña cambiada correctamente");
    setSeguridad({
      passwordActual: "",
      passwordNueva: "",
      passwordConfirmar: "",
    });
  };

  return (
    <div className="estudiante-config-perfil">
      <h1 className="estudiante-config-perfil-title">Configuración</h1>
      <p className="estudiante-config-perfil-subtitle">
        Personaliza tus preferencias y configura tu cuenta
      </p>

      <div className="estudiante-config-perfil-grid">
        {/* Columna 1: Información Personal */}
        <article className="estudiante-config-perfil-card">
          <header className="estudiante-config-perfil-card-header">
            <h2>Información personal</h2>
          </header>
          <div className="estudiante-config-perfil-card-body">
            <div className="config-avatar-section">
              <div className="config-avatar">
                {infoPersonal.avatar ? (
                  <img
                    src={infoPersonal.avatar}
                    alt="Avatar"
                    className="config-avatar-img"
                  />
                ) : (
                  <div className="config-avatar-placeholder">
                    {infoPersonal.nombre.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label htmlFor="avatar-upload" className="config-avatar-btn">
                Cambiar avatar
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </div>

            <form onSubmit={handleGuardarInfoPersonal}>
              <div className="config-form-group">
                <label htmlFor="nombre" className="config-label">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={infoPersonal.nombre}
                  onChange={handleInfoPersonalChange}
                  className="config-input"
                />
              </div>

              <div className="config-form-group">
                <label htmlFor="email" className="config-label">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={infoPersonal.email}
                  onChange={handleInfoPersonalChange}
                  className="config-input"
                />
              </div>

              <button type="submit" className="config-btn config-btn-primary">
                Guardar cambios
              </button>
            </form>
          </div>
        </article>

        {/* Columna 2: Preferencias */}
        <article className="estudiante-config-perfil-card">
          <header className="estudiante-config-perfil-card-header">
            <h2>Preferencias</h2>
          </header>
          <div className="estudiante-config-perfil-card-body">
            <form onSubmit={handleGuardarPreferencias}>
              <div className="config-form-group">
                <label className="config-label">Tema</label>
                <div className="config-radio-group">
                  <label className="config-radio-option">
                    <input
                      type="radio"
                      name="tema"
                      value="claro"
                      checked={preferencias.tema === "claro"}
                      onChange={handlePreferenciasChange}
                    />
                    <span className="config-radio-custom"></span>
                    <span className="config-radio-label">Claro</span>
                  </label>
                  <label className="config-radio-option">
                    <input
                      type="radio"
                      name="tema"
                      value="oscuro"
                      checked={preferencias.tema === "oscuro"}
                      onChange={handlePreferenciasChange}
                    />
                    <span className="config-radio-custom"></span>
                    <span className="config-radio-label">Oscuro</span>
                  </label>
                </div>
              </div>

              <div className="config-form-group">
                <div className="config-toggle-row">
                  <div>
                    <label className="config-label">Notificaciones</label>
                    <p className="config-help-text">
                      Recibe alertas sobre tus misiones y logros
                    </p>
                  </div>
                  <label className="config-switch">
                    <input
                      type="checkbox"
                      name="notificaciones"
                      checked={preferencias.notificaciones}
                      onChange={handlePreferenciasChange}
                    />
                    <span className="config-switch-slider"></span>
                  </label>
                </div>
              </div>

              <div className="config-form-group">
                <label htmlFor="idioma" className="config-label">
                  Idioma
                </label>
                <select
                  id="idioma"
                  name="idioma"
                  value={preferencias.idioma}
                  onChange={handlePreferenciasChange}
                  className="config-select"
                >
                  <option value="Español">Español</option>
                  <option value="English">English</option>
                  <option value="Português">Português</option>
                </select>
              </div>

              <button type="submit" className="config-btn config-btn-primary">
                Guardar preferencias
              </button>
            </form>
          </div>
        </article>

        {/* Columna 3: Seguridad */}
        <article className="estudiante-config-perfil-card">
          <header className="estudiante-config-perfil-card-header">
            <h2>Seguridad</h2>
          </header>
          <div className="estudiante-config-perfil-card-body">
            <form onSubmit={handleCambiarPassword}>
              <div className="config-form-group">
                <label htmlFor="passwordActual" className="config-label">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  id="passwordActual"
                  name="passwordActual"
                  value={seguridad.passwordActual}
                  onChange={handleSeguridadChange}
                  className="config-input"
                  placeholder="Ingresa tu contraseña actual"
                />
              </div>

              <div className="config-form-group">
                <label htmlFor="passwordNueva" className="config-label">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  id="passwordNueva"
                  name="passwordNueva"
                  value={seguridad.passwordNueva}
                  onChange={handleSeguridadChange}
                  className="config-input"
                  placeholder="Ingresa tu nueva contraseña"
                />
                <p className="config-help-text">
                  Mínimo 8 caracteres, incluye mayúsculas, números y símbolos
                </p>
              </div>

              <div className="config-form-group">
                <label htmlFor="passwordConfirmar" className="config-label">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  id="passwordConfirmar"
                  name="passwordConfirmar"
                  value={seguridad.passwordConfirmar}
                  onChange={handleSeguridadChange}
                  className="config-input"
                  placeholder="Confirma tu nueva contraseña"
                />
              </div>

              <button type="submit" className="config-btn config-btn-primary">
                Cambiar contraseña
              </button>
            </form>
          </div>
        </article>
      </div>

      {/* Toast de notificación */}
      {mensajeToast && (
        <div className={`config-toast config-toast-${tipoToast}`}>
          {mensajeToast}
        </div>
      )}
    </div>
  );
}

export default EstudianteConfiguracion;
