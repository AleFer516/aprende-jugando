// src/pages/gm/GMConfiguracionPerfil.jsx
// Página de configuración de perfil del Game Master.
// Permite editar información personal, preferencias y seguridad.

import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/gmConfiguracion.css";

function GMConfiguracionPerfil() {
  const { theme, setTheme } = useTheme();

  // Estado de información personal
  const [infoPersonal, setInfoPersonal] = useState({
    nombre: "Felipe",
    email: "correo@inacapmail.cl",
    avatar: null,
  });

  // Estado de preferencias
  const [preferencias, setPreferencias] = useState({
    tema: theme,
    notificaciones: true,
    idioma: "Español",
  });

  // Estado de seguridad
  const [seguridad, setSeguridad] = useState({
    passwordActual: "",
    passwordNueva: "",
    passwordConfirmar: "",
  });

  const [erroresPassword, setErroresPassword] = useState([]);

  const [mensajeToast, setMensajeToast] = useState(null);
  const [tipoToast, setTipoToast] = useState("success");

  const mostrarToast = (mensaje, tipo = "success") => {
    setMensajeToast(mensaje);
    setTipoToast(tipo);
    setTimeout(() => setMensajeToast(null), 2500);
  };

  const handleChangeInfoPersonal = (campo, valor) => {
    setInfoPersonal((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleChangeTema = (nuevoTema) => {
    setPreferencias((prev) => ({ ...prev, tema: nuevoTema }));
    setTheme(nuevoTema);
    mostrarToast(`Tema ${nuevoTema === "oscuro" ? "oscuro" : "claro"} aplicado correctamente.`);
  };

  const toggleNotificaciones = () => {
    setPreferencias((prev) => ({
      ...prev,
      notificaciones: !prev.notificaciones,
    }));
    mostrarToast(
      `Notificaciones ${!preferencias.notificaciones ? "activadas" : "desactivadas"}.`
    );
  };

  const handleChangeIdioma = (idioma) => {
    setPreferencias((prev) => ({ ...prev, idioma }));
    mostrarToast(`Idioma cambiado a ${idioma}.`);
  };

  const handleCambiarAvatar = () => {
    mostrarToast("Función de cambio de avatar en desarrollo.", "info");
  };

  const handleEditarInfo = (e) => {
    e.preventDefault();
    mostrarToast("Información personal actualizada correctamente.");
  };

  const validarPassword = () => {
    const errores = [];
    const { passwordActual, passwordNueva, passwordConfirmar } = seguridad;

    // Validar que todos los campos estén completos
    if (!passwordActual) {
      errores.push("Debes ingresar tu contraseña actual");
    }
    if (!passwordNueva) {
      errores.push("Debes ingresar una nueva contraseña");
    }
    if (!passwordConfirmar) {
      errores.push("Debes confirmar tu nueva contraseña");
    }

    // Si hay campos vacíos, retornar errores básicos
    if (errores.length > 0) {
      return errores;
    }

    // Validar longitud mínima
    if (passwordNueva.length < 8) {
      errores.push("La contraseña debe tener al menos 8 caracteres");
    }

    // Validar que contenga al menos una mayúscula
    if (!/[A-Z]/.test(passwordNueva)) {
      errores.push("La contraseña debe contener al menos una letra mayúscula");
    }

    // Validar que contenga al menos un número
    if (!/[0-9]/.test(passwordNueva)) {
      errores.push("La contraseña debe contener al menos un número");
    }

    // Validar que contenga al menos un símbolo
    // eslint-disable-next-line no-useless-escape
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordNueva)) {
      errores.push("La contraseña debe contener al menos un símbolo especial");
    }

    // Validar que las contraseñas coincidan
    if (passwordNueva !== passwordConfirmar) {
      errores.push("Las contraseñas no coinciden");
    }

    return errores;
  };

  const handleCambiarPassword = (e) => {
    e.preventDefault();

    const errores = validarPassword();

    if (errores.length > 0) {
      setErroresPassword(errores);
      mostrarToast("Por favor, corrige los errores en el formulario", "error");
      return;
    }

    // Si no hay errores, proceder con el cambio
    setErroresPassword([]);
    mostrarToast("Contraseña actualizada correctamente.");
    setSeguridad({
      passwordActual: "",
      passwordNueva: "",
      passwordConfirmar: ""
    });
  };

  const handleChangeSeguridad = (campo, valor) => {
    setSeguridad((prev) => ({ ...prev, [campo]: valor }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (erroresPassword.length > 0) {
      setErroresPassword([]);
    }
  };

  return (
    <div className="gm-config-perfil">
      <h1 className="gm-config-perfil-title">Configuración</h1>
      <p className="gm-config-perfil-subtitle">
        Personaliza tus preferencias y configura tu cuenta
      </p>

      <div className="gm-config-perfil-grid">
        {/* Columna 1: Información Personal */}
        <article className="gm-config-perfil-card">
          <header className="gm-config-perfil-card-header">
            <h2>Información personal</h2>
          </header>

          <div className="gm-config-perfil-card-body">
            {/* Avatar */}
            <div className="config-avatar-section">
              <div className="config-avatar">
                {infoPersonal.avatar ? (
                  <img src={infoPersonal.avatar} alt="Avatar" />
                ) : (
                  <div className="config-avatar-placeholder">
                    {infoPersonal.nombre.charAt(0)}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="config-btn-outline"
                onClick={handleCambiarAvatar}
              >
                Cambiar avatar
              </button>
            </div>

            {/* Formulario */}
            <form className="config-form" onSubmit={handleEditarInfo}>
              <div className="config-field">
                <label className="config-label">Nombre</label>
                <input
                  type="text"
                  className="config-input"
                  value={infoPersonal.nombre}
                  onChange={(e) =>
                    handleChangeInfoPersonal("nombre", e.target.value)
                  }
                  placeholder="Nombre"
                />
              </div>

              <div className="config-field">
                <label className="config-label">Correo electrónico</label>
                <input
                  type="email"
                  className="config-input"
                  value={infoPersonal.email}
                  onChange={(e) =>
                    handleChangeInfoPersonal("email", e.target.value)
                  }
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <button type="submit" className="config-btn-primary">
                Editar
              </button>
            </form>
          </div>
        </article>

        {/* Columna 2: Preferencias */}
        <article className="gm-config-perfil-card">
          <header className="gm-config-perfil-card-header">
            <h2>Preferencias</h2>
          </header>

          <div className="gm-config-perfil-card-body">
            {/* Tema */}
            <div className="config-section">
              <label className="config-section-label">Tema</label>
              <div className="config-radio-group">
                <label className="config-radio-option">
                  <input
                    type="radio"
                    name="tema"
                    value="claro"
                    checked={preferencias.tema === "claro"}
                    onChange={() => handleChangeTema("claro")}
                  />
                  <span className="config-radio-custom" />
                  <span>Claro</span>
                </label>
                <label className="config-radio-option">
                  <input
                    type="radio"
                    name="tema"
                    value="oscuro"
                    checked={preferencias.tema === "oscuro"}
                    onChange={() => handleChangeTema("oscuro")}
                  />
                  <span className="config-radio-custom" />
                  <span>Oscuro</span>
                </label>
              </div>
            </div>

            {/* Notificaciones */}
            <div className="config-section">
              <label className="config-section-label">Notificaciones</label>
              <div className="config-switch-row">
                <label className="config-switch">
                  <input
                    type="checkbox"
                    checked={preferencias.notificaciones}
                    onChange={toggleNotificaciones}
                  />
                  <span className="config-switch-slider" />
                </label>
                <span className="config-switch-text">Activar</span>
              </div>
            </div>

            {/* Idioma */}
            <div className="config-section">
              <label className="config-section-label">Idioma</label>
              <select
                className="config-select"
                value={preferencias.idioma}
                onChange={(e) => handleChangeIdioma(e.target.value)}
              >
                <option value="Español">Español</option>
                <option value="English">English</option>
                <option value="Português">Português</option>
                <option value="Français">Français</option>
              </select>
            </div>
          </div>
        </article>

        {/* Columna 3: Seguridad */}
        <article className="gm-config-perfil-card">
          <header className="gm-config-perfil-card-header">
            <h2>Seguridad</h2>
          </header>

          <div className="gm-config-perfil-card-body">
            <form className="config-form" onSubmit={handleCambiarPassword}>
              <div className="config-field">
                <label className="config-label">Contraseña actual</label>
                <input
                  type="password"
                  className="config-input"
                  value={seguridad.passwordActual}
                  onChange={(e) =>
                    handleChangeSeguridad("passwordActual", e.target.value)
                  }
                  placeholder="••••••••••"
                />
              </div>

              <div className="config-field">
                <label className="config-label">Nueva contraseña</label>
                <input
                  type="password"
                  className="config-input"
                  value={seguridad.passwordNueva}
                  onChange={(e) =>
                    handleChangeSeguridad("passwordNueva", e.target.value)
                  }
                  placeholder="••••••••••"
                />
              </div>

              <div className="config-field">
                <label className="config-label">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  className="config-input"
                  value={seguridad.passwordConfirmar}
                  onChange={(e) =>
                    handleChangeSeguridad("passwordConfirmar", e.target.value)
                  }
                  placeholder="••••••••••"
                />
              </div>

              {/* Mostrar errores de validación */}
              {erroresPassword.length > 0 && (
                <div className="config-errores-password">
                  <ul>
                    {erroresPassword.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button type="submit" className="config-btn-primary">
                Cambiar contraseña
              </button>
            </form>
          </div>
        </article>
      </div>

      {/* Toast de feedback */}
      {mensajeToast && (
        <div className={`config-toast config-toast-${tipoToast}`}>
          {mensajeToast}
        </div>
      )}
    </div>
  );
}

export default GMConfiguracionPerfil;
