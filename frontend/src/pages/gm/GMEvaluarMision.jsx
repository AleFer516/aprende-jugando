// src/pages/gm/GMEvaluarMision.jsx
// Página de evaluación de misión individual del estudiante

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";
import "../../styles/gmEvaluarMision.css";
import "../../styles/themes.css";

function GMEvaluarMision() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evaluacion, setEvaluacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retroalimentacion, setRetroalimentacion] = useState("");
  const [calificacionSeleccionada, setCalificacionSeleccionada] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Cargar datos de la evaluación
  useEffect(() => {
    cargarEvaluacion();
  }, [id]);

  const cargarEvaluacion = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/gm/evaluaciones/${id}`);

      if (response.data.success) {
        setEvaluacion(response.data.evaluacion);
      }
    } catch (err) {
      console.error('Error al cargar evaluación:', err);
      setError('Error al cargar la evaluación. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleVolver = () => {
    navigate("/gm/evaluaciones");
  };

  const handleCalificar = (tipo) => {
    setCalificacionSeleccionada(tipo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!calificacionSeleccionada) {
      alert("Por favor, selecciona una calificación (Aprobar, Rechazar o Revisar)");
      return;
    }

    try {
      setGuardando(true);

      const response = await api.put(`/gm/evaluaciones/${id}/evaluar`, {
        estado: calificacionSeleccionada,
        retroalimentacion
      });

      if (response.data.success) {
        alert(`Misión ${calificacionSeleccionada} exitosamente`);
        handleVolver();
      }
    } catch (err) {
      console.error('Error al guardar evaluación:', err);
      alert('Error al guardar la evaluación. Por favor intente nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="gm-evaluar-mision">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  if (error || !evaluacion) {
    return (
      <div className="gm-evaluar-mision">
        <div style={{ padding: '2rem', backgroundColor: '#fee', color: '#c00', borderRadius: '8px', margin: '1rem' }}>
          {error || 'No se encontró la evaluación'}
        </div>
        <button className="gm-evaluar-btn volver" onClick={handleVolver}>
          Volver a Evaluaciones
        </button>
      </div>
    );
  }

  return (
    <div className="gm-evaluar-mision">
      {/* Botón de volver arriba */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className="gm-evaluar-btn volver"
          onClick={handleVolver}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver a Evaluaciones
        </button>
      </div>

      {/* Header con información del estudiante */}
      <div className="gm-evaluar-header">
        <div className="gm-evaluar-avatar">
          {evaluacion.estudiante_nombre.charAt(0)}
        </div>
        <div className="gm-evaluar-info">
          <h2>{evaluacion.estudiante_nombre}</h2>
          <p>{evaluacion.curso_nombre || 'Sin curso asignado'}</p>
        </div>
      </div>

      <div className="gm-evaluar-container">
        {/* Columna izquierda - Detalles de la misión y entrega */}
        <div className="gm-evaluar-left">
          {/* Información de la misión */}
          <div className="gm-evaluar-mision-info">
            <h3>{evaluacion.mision_titulo}</h3>

            <div className="gm-evaluar-badges">
              <span className="gm-evaluar-badge categoria">
                📚 {capitalizeFirst(evaluacion.categoria)}
              </span>
              <span className="gm-evaluar-badge dificultad">
                ⚡ {capitalizeFirst(evaluacion.dificultad)}
              </span>
              <span className="gm-evaluar-badge xp">
                ⭐ +{evaluacion.xp_recompensa} XP
              </span>
              <span className="gm-evaluar-badge estado">
                ⏰ {capitalizeFirst(evaluacion.estado)}
              </span>
            </div>

            <p className="gm-evaluar-fecha">
              {evaluacion.fecha_completado
                ? `Completado el ${new Date(evaluacion.fecha_completado).toLocaleDateString('es-CL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}`
                : 'En progreso'
              }
            </p>

            <p className="gm-evaluar-descripcion" style={{ marginTop: '1rem', fontSize: '0.95rem', color: '#666' }}>
              {evaluacion.mision_descripcion}
            </p>
          </div>

          {/* Actividades y respuestas del estudiante */}
          <div className="gm-evaluar-respuesta">
            <h3>Respuestas del estudiante</h3>
            <div className="gm-evaluar-respuesta-content">
              {evaluacion.actividades && evaluacion.actividades.length > 0 ? (
                evaluacion.actividades.map((actividad, index) => (
                  <div key={actividad.id} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>
                      Actividad {index + 1}
                    </h4>
                    <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <strong>Pregunta:</strong> {actividad.pregunta}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                      <strong>Tipo:</strong> {capitalizeFirst(actividad.tipo.replace('_', ' '))}
                    </p>
                    {actividad.puntos && (
                      <p style={{ fontSize: '0.85rem', color: '#4a90e2', marginTop: '0.5rem' }}>
                        <strong>Puntos:</strong> {actividad.puntos}
                      </p>
                    )}
                    {actividad.explicacion && (
                      <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem', fontStyle: 'italic' }}>
                        <strong>Explicación:</strong> {actividad.explicacion}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: '#666' }}>No hay actividades registradas para esta misión.</p>
              )}

              {evaluacion.progreso !== undefined && (
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e8f4f8', borderRadius: '8px' }}>
                  <strong>Progreso:</strong> {evaluacion.progreso}%
                </div>
              )}
            </div>
          </div>

          {/* Formulario de retroalimentación */}
          <div className="gm-evaluar-form">
            <h3>Retroalimentación</h3>

            <textarea
              className="gm-evaluar-textarea"
              value={retroalimentacion}
              onChange={(e) => setRetroalimentacion(e.target.value)}
              placeholder="Escribe aquí tu retroalimentación para el estudiante..."
            />

            {/* Botones de calificación */}
            <div className="gm-evaluar-calificacion" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className={`gm-evaluar-btn-calificacion aprobar ${calificacionSeleccionada === 'aprobada' ? 'selected' : ''}`}
                onClick={() => handleCalificar('aprobada')}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Aprobar
              </button>
              <button
                type="button"
                className={`gm-evaluar-btn-calificacion rechazar ${calificacionSeleccionada === 'rechazada' ? 'selected' : ''}`}
                onClick={() => handleCalificar('rechazada')}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Rechazar
              </button>
              <button
                type="button"
                className={`gm-evaluar-btn-calificacion ${calificacionSeleccionada === 'revisada' ? 'selected' : ''}`}
                onClick={() => handleCalificar('revisada')}
                style={{
                  backgroundColor: calificacionSeleccionada === 'revisada' ? '#4a90e2' : '#6c757d',
                  borderColor: calificacionSeleccionada === 'revisada' ? '#357abd' : '#5a6268'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Revisar
              </button>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="gm-evaluar-actions">
            <button
              type="submit"
              className="gm-evaluar-btn submit"
              onClick={handleSubmit}
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Enviar calificación'}
            </button>
          </div>
        </div>

        {/* Columna derecha - Información del estudiante */}
        <div className="gm-evaluar-right">
          {/* Stats del estudiante */}
          <div className="gm-evaluar-stats">
            <h3>Información del Estudiante</h3>

            <div className="gm-evaluar-stat-item">
              <span className="gm-evaluar-stat-label">RUT</span>
              <div style={{ fontSize: '1rem', fontWeight: '500' }}>
                {evaluacion.estudiante_rut}
              </div>
            </div>

            <div className="gm-evaluar-stat-item">
              <span className="gm-evaluar-stat-label">Email</span>
              <div style={{ fontSize: '0.9rem' }}>
                {evaluacion.estudiante_email}
              </div>
            </div>

            <div className="gm-evaluar-stat-item">
              <span className="gm-evaluar-stat-label">Nivel</span>
              <div className="gm-evaluar-nivel-info">
                <span className="gm-evaluar-nivel">Nivel {evaluacion.estudiante_nivel || 1}</span>
                <span className="gm-evaluar-xp">{evaluacion.estudiante_experiencia || 0} XP</span>
              </div>
            </div>

            <div className="gm-evaluar-stat-item">
              <span className="gm-evaluar-stat-label">Monedas</span>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#f59e0b' }}>
                💰 {evaluacion.estudiante_monedas || 0}
              </div>
            </div>
          </div>

          {/* Estado de la misión */}
          <div className="gm-evaluar-logros">
            <h3>Estado de la Misión</h3>
            <div className="gm-evaluar-logro-item">
              <span className="gm-evaluar-logro-icon">📊</span>
              <div>
                <div className="gm-evaluar-logro-text">
                  Estado: <strong>{capitalizeFirst(evaluacion.estado)}</strong>
                </div>
                {evaluacion.puntuacion !== null && (
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                    Puntuación: {evaluacion.puntuacion}/100
                  </div>
                )}
              </div>
            </div>

            {evaluacion.fecha_inicio && (
              <div className="gm-evaluar-logro-item">
                <span className="gm-evaluar-logro-icon">🕐</span>
                <div className="gm-evaluar-logro-text">
                  Iniciada: {new Date(evaluacion.fecha_inicio).toLocaleDateString('es-CL')}
                </div>
              </div>
            )}

            {evaluacion.fecha_completado && (
              <div className="gm-evaluar-logro-item">
                <span className="gm-evaluar-logro-icon">✅</span>
                <div className="gm-evaluar-logro-text">
                  Completada: {new Date(evaluacion.fecha_completado).toLocaleDateString('es-CL')}
                </div>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="gm-evaluar-pendientes">
            <h3>Detalles Adicionales</h3>
            <div className="gm-evaluar-pendiente-item">
              <div className="gm-evaluar-pendiente-titulo">Progreso</div>
              <div className="gm-evaluar-pendiente-categoria">{evaluacion.progreso}%</div>
            </div>
            {evaluacion.curso_nombre && (
              <div className="gm-evaluar-pendiente-item">
                <div className="gm-evaluar-pendiente-titulo">Curso</div>
                <div className="gm-evaluar-pendiente-categoria">{evaluacion.curso_nombre}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GMEvaluarMision;
