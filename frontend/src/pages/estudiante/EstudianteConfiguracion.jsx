// src/pages/estudiante/EstudianteConfiguracion.jsx
// Página de configuración del panel de estudiantes

import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import estudianteService from "../../services/estudianteService";
import "../../styles/estudianteConfiguracion.css";

function EstudianteConfiguracion() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);

  const [infoPersonal, setInfoPersonal] = useState({
    nombre: "",
    email: "",
    avatar: null,
  });

  const [preferencias, setPreferencias] = useState({
    tema: theme,
    notificaciones: true,
  });

  const [seguridad, setSeguridad] = useState({
    passwordActual: "",
    passwordNueva: "",
    passwordConfirmar: "",
  });

  const [mensajeToast, setMensajeToast] = useState("");
  const [tipoToast, setTipoToast] = useState("success");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [perfilResponse, configResponse] = await Promise.all([
          estudianteService.getPerfil(),
          estudianteService.getConfiguracion()
        ]);

        if (perfilResponse.success) {
          setInfoPersonal({
            nombre: perfilResponse.perfil.nombre,
            email: perfilResponse.perfil.email,
            avatar: perfilResponse.perfil.avatar
          });
        }

        if (configResponse.success) {
          setPreferencias({
            tema: theme,
            notificaciones: configResponse.configuracion.notificaciones
          });
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        mostrarToast("Error al cargar la configuración", "error");
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
    setTimeout(() => {
      setMensajeToast("");
    }, 2500);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const response = await estudianteService.actualizarPerfil({
            avatar: reader.result
          });

          if (response.success) {
            setInfoPersonal({ ...infoPersonal, avatar: reader.result });
            mostrarToast("Avatar actualizado correctamente");
            // Emitir evento para actualizar el layout
            window.dispatchEvent(new Event('perfilActualizado'));
          }
        } catch (error) {
          console.error("Error al actualizar avatar:", error);
          mostrarToast("Error al actualizar avatar", "error");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEliminarAvatar = async () => {
    try {
      const response = await estudianteService.actualizarPerfil({
        avatar: null
      });

      if (response.success) {
        setInfoPersonal({ ...infoPersonal, avatar: null });
        mostrarToast("Avatar eliminado correctamente");
        // Emitir evento para actualizar el layout
        window.dispatchEvent(new Event('perfilActualizado'));
      }
    } catch (error) {
      console.error("Error al eliminar avatar:", error);
      mostrarToast("Error al eliminar avatar", "error");
    }
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

  const handleGuardarPreferencias = async (e) => {
    e.preventDefault();
    try {
      const response = await estudianteService.actualizarConfiguracion({
        notificaciones: preferencias.notificaciones
      });

      if (response.success) {
        mostrarToast("Preferencias guardadas correctamente");
      }
    } catch (error) {
      console.error("Error al guardar preferencias:", error);
      mostrarToast("Error al guardar preferencias", "error");
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();

    const errores = validarPassword();

    if (errores.length > 0) {
      mostrarToast(errores[0], "error");
      return;
    }

    try {
      const response = await estudianteService.cambiarContrasena(
        seguridad.passwordActual,
        seguridad.passwordNueva
      );

      if (response.success) {
        mostrarToast("Contraseña cambiada correctamente");
        setSeguridad({
          passwordActual: "",
          passwordNueva: "",
          passwordConfirmar: "",
        });
      }
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      const mensaje = error.response?.data?.message || "Error al cambiar contraseña";
      mostrarToast(mensaje, "error");
    }
  };

  if (loading) {
    return (
      <div className="estudiante-config-perfil">
        <h1 className="estudiante-config-perfil-title">Configuración</h1>
        <p>Cargando...</p>
      </div>
    );
  }

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
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <label htmlFor="avatar-upload" className="config-avatar-btn">
                  {infoPersonal.avatar ? 'Cambiar avatar' : 'Subir avatar'}
                </label>
                {infoPersonal.avatar && (
                  <button
                    type="button"
                    onClick={handleEliminarAvatar}
                    className="config-avatar-btn"
                    style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                  >
                    Eliminar avatar
                  </button>
                )}
              </div>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </div>

            <div>
              <div className="config-form-group">
                <label htmlFor="nombre" className="config-label">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={infoPersonal.nombre}
                  className="config-input"
                  disabled
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
                <p className="config-help-text">
                  El nombre no puede ser modificado. Contacta al administrador.
                </p>
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
                  className="config-input"
                  disabled
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
                <p className="config-help-text">
                  El correo no puede ser modificado. Contacta al administrador.
                </p>
              </div>
            </div>
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
