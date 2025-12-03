// src/pages/estudiante/EstudiantePerfil.jsx
// Página de perfil del estudiante (solo visualización).
// Las ediciones se realizan desde la página de Configuración.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import estudianteService from "../../services/estudianteService";
import "../../styles/estudiantePerfil.css";

function EstudiantePerfil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const response = await estudianteService.getPerfil();
      if (response.success) {
        setPerfil(response.perfil);
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const obtenerIniciales = (nombre) => {
    if (!nombre) return "U";
    const palabras = nombre.trim().split(' ');
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  const irAConfiguracion = () => {
    navigate("/estudiante/configuracion");
  };

  if (loading) {
    return (
      <div className="estudiante-perfil">
        <h1 className="estudiante-perfil-title">Mi Perfil</h1>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="estudiante-perfil">
        <h1 className="estudiante-perfil-title">Mi Perfil</h1>
        <p>No se pudo cargar el perfil</p>
      </div>
    );
  }

  return (
    <div className="estudiante-perfil">
      {/* Header */}
      <div className="estudiante-perfil-header">
        <h1 className="estudiante-perfil-title">Mi Perfil</h1>
        <button className="estudiante-perfil-btn-editar" onClick={irAConfiguracion}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Ir a Configuración
        </button>
      </div>

      {/* Contenido principal */}
      <div className="estudiante-perfil-contenido">
        {/* Info personal */}
        <div className="estudiante-perfil-card">
          <div className="estudiante-perfil-card-header">
            <h2>Información Personal</h2>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="estudiante-perfil-card-body">
            {/* Avatar */}
            <div className="estudiante-perfil-avatar-section">
              <div className="estudiante-perfil-avatar">
                {perfil.avatar ? (
                  <img
                    src={perfil.avatar}
                    alt={perfil.nombre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    fontWeight: '700',
                    color: 'white'
                  }}>
                    {obtenerIniciales(perfil.nombre)}
                  </div>
                )}
              </div>
              <div className="estudiante-perfil-nivel-badge">
                Nivel {perfil.nivel || 1}
              </div>
            </div>

            {/* Información de solo lectura */}
            <div className="estudiante-perfil-form">
              <div className="estudiante-perfil-form-row">
                <div className="estudiante-perfil-form-group">
                  <label>Nombre completo</label>
                  <p>{perfil.nombre}</p>
                </div>

                <div className="estudiante-perfil-form-group">
                  <label>Correo electrónico</label>
                  <p>{perfil.email}</p>
                </div>
              </div>

              <div className="estudiante-perfil-form-row">
                <div className="estudiante-perfil-form-group">
                  <label>Rol</label>
                  <p className="estudiante-perfil-rol-badge">Estudiante</p>
                </div>

                <div className="estudiante-perfil-form-group">
                  <label>Experiencia</label>
                  <p>{perfil.experiencia || 0} XP</p>
                </div>
              </div>

              <div className="estudiante-perfil-form-group">
                <label>Cursos inscritos</label>
                {perfil.cursos && perfil.cursos.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {perfil.cursos.map((curso, index) => (
                      <p key={index} style={{ margin: 0 }}>{curso.nombre}</p>
                    ))}
                  </div>
                ) : (
                  <p>No estás inscrito en ningún curso</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="estudiante-perfil-card">
          <div className="estudiante-perfil-card-header">
            <h2>Mis Estadísticas</h2>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>

          <div className="estudiante-perfil-card-body">
            <div className="estudiante-perfil-stats-grid">
              <div className="estudiante-perfil-stat-item">
                <div className="estudiante-perfil-stat-icon estudiante-perfil-stat-icon-primary">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="estudiante-perfil-stat-content">
                  <span className="estudiante-perfil-stat-label">Misiones completadas</span>
                  <span className="estudiante-perfil-stat-value">
                    {perfil.estadisticas?.completadas || 0} / {perfil.estadisticas?.total_misiones || 0}
                  </span>
                </div>
              </div>

              <div className="estudiante-perfil-stat-item">
                <div className="estudiante-perfil-stat-icon estudiante-perfil-stat-icon-success">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="estudiante-perfil-stat-content">
                  <span className="estudiante-perfil-stat-label">Logros obtenidos</span>
                  <span className="estudiante-perfil-stat-value">
                    {perfil.logros?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Mostrar logros recientes */}
            {perfil.logros && perfil.logros.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', color: '#ffffff', marginBottom: '0.75rem' }}>
                  Logros recientes
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {perfil.logros.map((logro) => (
                    <div
                      key={logro.id}
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        borderLeft: '3px solid #00a7d5'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {logro.icono && <span style={{ fontSize: '1.5rem' }}>{logro.icono}</span>}
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: '600', color: '#ffffff' }}>
                            {logro.nombre}
                          </p>
                          {logro.descripcion && (
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                              {logro.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actividad */}
        <div className="estudiante-perfil-card">
          <div className="estudiante-perfil-card-header">
            <h2>Actividad Reciente</h2>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="estudiante-perfil-card-body">
            <div className="estudiante-perfil-info-grid">
              <div className="estudiante-perfil-info-item">
                <span className="estudiante-perfil-info-label">Fecha de registro</span>
                <span className="estudiante-perfil-info-value">
                  {formatearFecha(perfil.created_at)}
                </span>
              </div>

              <div className="estudiante-perfil-info-item">
                <span className="estudiante-perfil-info-label">Experiencia ganada</span>
                <span className="estudiante-perfil-info-value">
                  {perfil.estadisticas?.xp_ganado || 0} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Seguridad - Redirige a configuración */}
        <div className="estudiante-perfil-card">
          <div className="estudiante-perfil-card-header">
            <h2>Seguridad y Preferencias</h2>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="estudiante-perfil-card-body">
            <p className="estudiante-perfil-info-text">
              Para editar tu información personal, cambiar tu contraseña o modificar tus preferencias,
              dirígete a la página de configuración.
            </p>
            <button
              className="estudiante-perfil-btn-cambiar-password"
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

export default EstudiantePerfil;
