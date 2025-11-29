// src/pages/gm/GMPerfil.jsx
// Página de perfil del usuario Game Master (solo visualización).
// Las ediciones se realizan desde la página de Configuración.

import { useNavigate } from "react-router-dom";
import "../../styles/gmPerfil.css";
import "../../styles/themes.css";

function GMPerfil() {
  const navigate = useNavigate();

  const datosUsuario = {
    nombre: "Felipe",
    correo: "felipe.gm@luminia.cl",
    rol: "Game Master",
    telefono: "+56 9 9876 5432",
    biografia:
      "Profesor a cargo de las misiones del sistema Luminia. Motivado por hacer las matemáticas más entretenidas.",
    fechaRegistro: "10 de marzo, 2024",
    ultimoAcceso: "Hoy a las 09:15"
  };

  const irAConfiguracion = () => {
    navigate("/gm/configuracion");
  };

  return (
    <div className="gm-perfil">
      {/* Header */}
      <div className="gm-perfil-header">
        <h1 className="gm-perfil-title">Mi Perfil</h1>
        <button className="gm-perfil-btn-editar" onClick={irAConfiguracion}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Ir a Configuración
        </button>
      </div>

      {/* Contenido principal */}
      <div className="gm-perfil-contenido">
        {/* Info personal */}
        <div className="gm-perfil-card">
          <div className="gm-perfil-card-header">
            <h2>Información Personal</h2>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="gm-perfil-card-body">
            {/* Avatar */}
            <div className="gm-perfil-avatar-section">
              <div className="gm-perfil-avatar">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Información de solo lectura */}
            <div className="gm-perfil-form">
              <div className="gm-perfil-form-row">
                <div className="gm-perfil-form-group">
                  <label>Nombre completo</label>
                  <p>{datosUsuario.nombre}</p>
                </div>

                <div className="gm-perfil-form-group">
                  <label>Correo electrónico</label>
                  <p>{datosUsuario.correo}</p>
                </div>
              </div>

              <div className="gm-perfil-form-row">
                <div className="gm-perfil-form-group">
                  <label>Rol</label>
                  <p className="gm-perfil-rol-badge">{datosUsuario.rol}</p>
                </div>

                <div className="gm-perfil-form-group">
                  <label>Teléfono</label>
                  <p>{datosUsuario.telefono}</p>
                </div>
              </div>

              <div className="gm-perfil-form-group">
                <label>Biografía</label>
                <p>{datosUsuario.biografia}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actividad */}
        <div className="gm-perfil-card">
          <div className="gm-perfil-card-header">
            <h2>Actividad Reciente</h2>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="gm-perfil-card-body">
            <div className="gm-perfil-info-grid">
              <div className="gm-perfil-info-item">
                <span className="gm-perfil-info-label">Fecha de registro</span>
                <span className="gm-perfil-info-value">
                  {datosUsuario.fechaRegistro}
                </span>
              </div>

              <div className="gm-perfil-info-item">
                <span className="gm-perfil-info-label">Último acceso</span>
                <span className="gm-perfil-info-value">
                  {datosUsuario.ultimoAcceso}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Seguridad - Redirige a configuración */}
        <div className="gm-perfil-card">
          <div className="gm-perfil-card-header">
            <h2>Seguridad y Preferencias</h2>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="gm-perfil-card-body">
            <p className="gm-perfil-info-text">
              Para editar tu información personal, cambiar tu contraseña o modificar tus preferencias,
              dirígete a la página de configuración.
            </p>
            <button
              className="gm-perfil-btn-cambiar-password"
              onClick={irAConfiguracion}
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              Ir a Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GMPerfil;
