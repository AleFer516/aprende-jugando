// src/pages/gm/GMConfiguracionPerfil.jsx
// Página de configuración de perfil del Game Master.
// Permite editar información personal, preferencias y seguridad.

import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import gmService from "../../services/gmService";
import authService from "../../services/authService";
import "../../styles/themes.css";
import "../../styles/gmConfiguracion.css";

function GMConfiguracionPerfil() {
  const { theme, setTheme } = useTheme();

  // Estado de información personal
  const [infoPersonal, setInfoPersonal] = useState({
    nombre: "",
    email: "",
    avatar: null,
  });

  const [loading, setLoading] = useState(true);

  // Estado de preferencias
  const [preferencias, setPreferencias] = useState({
    tema: theme,
  });

  // Estado de notificaciones
  const [notificaciones, setNotificaciones] = useState({
    email: true,
    sistema: true,
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

  // Cargar información personal y configuración al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        // Cargar información personal
        const infoResponse = await gmService.getInformacionPersonal();
        if (infoResponse.success) {
          setInfoPersonal({
            nombre: infoResponse.data.nombre || "",
            email: infoResponse.data.email || "",
            avatar: infoResponse.data.avatar || null
          });
        }

        // Cargar configuración de notificaciones
        const configResponse = await gmService.getConfiguracion();
        if (configResponse.success && configResponse.configuracion.notificaciones) {
          setNotificaciones({
            email: configResponse.configuracion.notificaciones.email !== undefined
              ? configResponse.configuracion.notificaciones.email
              : true,
            sistema: configResponse.configuracion.notificaciones.sistema !== undefined
              ? configResponse.configuracion.notificaciones.sistema
              : true,
          });
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        mostrarToast("Error al cargar información", "error");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const toggleNotificaciones = async (tipo) => {
    try {
      const nuevasNotificaciones = {
        ...notificaciones,
        [tipo]: !notificaciones[tipo]
      };

      // Actualizar en el backend
      const response = await gmService.actualizarConfiguracion(nuevasNotificaciones);

      if (response.success) {
        // Actualizar estado local
        setNotificaciones(nuevasNotificaciones);
        mostrarToast(
          `Notificaciones por ${tipo === 'email' ? 'email' : 'sistema'} ${nuevasNotificaciones[tipo] ? "activadas" : "desactivadas"}.`
        );
      }
    } catch (error) {
      console.error("Error al actualizar notificaciones:", error);
      mostrarToast(
        error.response?.data?.message || "Error al actualizar notificaciones",
        "error"
      );
    }
  };

  const handleCambiarAvatar = () => {
    // Crear input file temporal para seleccionar archivo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validar tamaño (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
          mostrarToast("El archivo es demasiado grande. Máximo 5MB.", "error");
          return;
        }

        try {
          const response = await gmService.subirAvatar(file);

          if (response.success) {
            // Actualizar avatar en el estado
            setInfoPersonal(prev => ({
              ...prev,
              avatar: response.avatarUrl
            }));

            // Actualizar avatar en authService para que se refleje en toda la app
            authService.updateUserAvatar(response.avatarUrl);

            mostrarToast("Avatar actualizado correctamente.");
          }
        } catch (error) {
          console.error("Error al subir avatar:", error);
          mostrarToast(
            error.response?.data?.message || "Error al subir el avatar",
            "error"
          );
        }
      }
    };
    input.click();
  };

  const handleEliminarAvatar = async () => {
    // Confirmar eliminación
    if (!window.confirm("¿Estás seguro de que deseas eliminar tu avatar?")) {
      return;
    }

    try {
      const response = await gmService.eliminarAvatar();

      if (response.success) {
        // Actualizar avatar en el estado
        setInfoPersonal(prev => ({
          ...prev,
          avatar: null
        }));

        // Actualizar avatar en authService para que se refleje en toda la app
        authService.updateUserAvatar(null);

        mostrarToast("Avatar eliminado correctamente.");
      }
    } catch (error) {
      console.error("Error al eliminar avatar:", error);
      mostrarToast(
        error.response?.data?.message || "Error al eliminar el avatar",
        "error"
      );
    }
  };

  const handleEditarInfo = async (e) => {
    e.preventDefault();

    try {
      const response = await gmService.actualizarInformacionPersonal(
        infoPersonal.nombre,
        infoPersonal.email
      );

      if (response.success) {
        // Actualizar nombre en authService para que se refleje en toda la app
        authService.updateUserName(response.data.nombre);

        mostrarToast("Información personal actualizada correctamente.");
      }
    } catch (error) {
      console.error("Error al actualizar información:", error);
      mostrarToast(
        error.response?.data?.message || "Error al actualizar la información",
        "error"
      );
    }
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

  const handleCambiarPassword = async (e) => {
    e.preventDefault();

    const errores = validarPassword();

    if (errores.length > 0) {
      setErroresPassword(errores);
      mostrarToast("Por favor, corrige los errores en el formulario", "error");
      return;
    }

    try {
      const response = await gmService.cambiarContrasena(
        seguridad.passwordActual,
        seguridad.passwordNueva,
        seguridad.passwordConfirmar
      );

      if (response.success) {
        setErroresPassword([]);
        mostrarToast("Contraseña actualizada correctamente.");
        setSeguridad({
          passwordActual: "",
          passwordNueva: "",
          passwordConfirmar: ""
        });
      }
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      const mensaje = error.response?.data?.message || "Error al cambiar la contraseña";
      setErroresPassword([mensaje]);
      mostrarToast(mensaje, "error");
    }
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
                  <img
                    src={`http://localhost:4000${infoPersonal.avatar}`}
                    alt="Avatar"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="config-avatar-placeholder">
                    {infoPersonal.nombre?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="config-btn-outline"
                  onClick={handleCambiarAvatar}
                >
                  Cambiar avatar
                </button>
                {infoPersonal.avatar && (
                  <button
                    type="button"
                    className="config-btn-outline"
                    onClick={handleEliminarAvatar}
                    style={{
                      borderColor: '#ef4444',
                      color: '#ef4444'
                    }}
                  >
                    Eliminar avatar
                  </button>
                )}
              </div>
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
                    checked={notificaciones.email}
                    onChange={() => toggleNotificaciones('email')}
                  />
                  <span className="config-switch-slider" />
                </label>
                <span className="config-switch-text">Notificaciones por email</span>
              </div>

              <div className="config-switch-row" style={{ marginTop: '0.75rem' }}>
                <label className="config-switch">
                  <input
                    type="checkbox"
                    checked={notificaciones.sistema}
                    onChange={() => toggleNotificaciones('sistema')}
                  />
                  <span className="config-switch-slider" />
                </label>
                <span className="config-switch-text">Notificaciones en el sistema</span>
              </div>
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
