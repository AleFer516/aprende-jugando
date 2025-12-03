// src/pages/estudiante/EstudianteMisionDetalle.jsx
// Página de detalles de una misión específica

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import estudianteService from "../../services/estudianteService";
import "../../styles/estudianteMisionDetalle.css";

function EstudianteMisionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mision, setMision] = useState(null);

  useEffect(() => {
    cargarMisionDetalle();
  }, [id]);

  const cargarMisionDetalle = async () => {
    try {
      setLoading(true);
      const response = await estudianteService.getMisionDetalle(id);
      if (response.success) {
        setMision(response.mision);
      }
    } catch (error) {
      console.error("Error al cargar detalle de misión:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate("/estudiante/misiones");
  };

  const handleIniciarActividad = () => {
    navigate(`/estudiante/misiones/${id}/actividad`);
  };

  const capitalizarDificultad = (dificultad) => {
    if (!dificultad) return "";
    const dificultades = {
      'facil': 'Baja',
      'medio': 'Media',
      'dificil': 'Alta'
    };
    return dificultades[dificultad] || dificultad;
  };

  const getDificultadClass = (dificultad) => {
    if (!dificultad) return "badge-baja";
    const clases = {
      'facil': 'badge-baja',
      'medio': 'badge-media',
      'dificil': 'badge-alta'
    };
    return clases[dificultad] || "badge-baja";
  };

  const obtenerEstadoBoton = () => {
    if (!mision) return { texto: "Iniciar actividad", handler: handleIniciarActividad };

    if (mision.estado === 'completada') {
      return { texto: "Revisar actividad", handler: handleIniciarActividad };
    } else if (mision.estado === 'en_progreso') {
      return { texto: "Continuar actividad", handler: handleIniciarActividad };
    } else {
      return { texto: "Iniciar actividad", handler: handleIniciarActividad };
    }
  };

  if (loading) {
    return (
      <div className="mision-detalle-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Cargando detalles de la misión...</p>
      </div>
    );
  }

  if (!mision) {
    return (
      <div className="mision-detalle-page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px', gap: '1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No se pudo cargar la misión.</p>
        <button className="btn-volver" onClick={handleVolver}>
          Volver a misiones
        </button>
      </div>
    );
  }

  const estadoBoton = obtenerEstadoBoton();

  return (
    <div className="mision-detalle-page">
      {/* Fondo fijo */}
      <div className="mision-detalle-bg"></div>

      {/* Overlay de contenido */}
      <div className="mision-detalle-overlay">
        {/* Header con nombre de la misión */}
        <div className="mision-detalle-header">
        <h1 className="mision-detalle-title">{mision.titulo}</h1>
        <div className="mision-detalle-badges">
          <span className={`badge-dificultad ${getDificultadClass(mision.dificultad)}`}>
            Dificultad: {capitalizarDificultad(mision.dificultad)}
          </span>
          {mision.categoria && (
            <span className="badge-categoria">Categoría: {mision.categoria}</span>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mision-detalle-contenido">
        {/* Objetivo de aprendizaje */}
        {mision.objetivo_aprendizaje && (
          <div className="mision-detalle-seccion">
            <h2 className="seccion-titulo">Objetivo de aprendizaje</h2>
            <p className="seccion-texto">{mision.objetivo_aprendizaje}</p>
          </div>
        )}

        {/* Competencias */}
        {mision.competencias && mision.competencias.length > 0 && (
          <div className="mision-detalle-seccion">
            <h2 className="seccion-titulo">Competencias</h2>
            <ul className="competencias-lista">
              {mision.competencias.map((competencia, index) => (
                <li key={index} className="competencia-item">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {competencia}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Descripción */}
        {mision.descripcion && (
          <div className="mision-detalle-seccion">
            <h2 className="seccion-titulo">Descripción</h2>
            <p className="seccion-texto">{mision.descripcion}</p>
          </div>
        )}

        {/* Grid con Pistas y Retroalimentación */}
        {((mision.pistas && mision.pistas.length > 0) || mision.retroalimentacion) && (
          <div className="mision-detalle-grid">
            {/* Pistas */}
            {mision.pistas && mision.pistas.length > 0 && (
              <div className="mision-detalle-card">
                <h2 className="card-titulo">Pistas</h2>
                <ul className="pistas-lista">
                  {mision.pistas.map((pista, index) => (
                    <li key={index} className="pista-item">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {pista}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Retroalimentación */}
            {mision.retroalimentacion && (
              <div className="mision-detalle-card">
                <h2 className="card-titulo">Retroalimentación</h2>
                <p className="card-texto">{mision.retroalimentacion}</p>
              </div>
            )}
          </div>
        )}

        {/* Información de progreso si la misión está en progreso o completada */}
        {(mision.estado === 'en_progreso' || mision.estado === 'completada') && (
          <div className="mision-detalle-seccion">
            <h2 className="seccion-titulo">Tu progreso</h2>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-color)' }}>Progreso completado:</span>
                <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{mision.progreso}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${mision.progreso}%`,
                    height: '100%',
                    backgroundColor: 'var(--primary-color)',
                    transition: 'width 0.3s ease'
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

        {/* Footer con botones */}
        <div className="mision-detalle-footer">
          <button className="btn-iniciar" onClick={estadoBoton.handler}>
            {estadoBoton.texto}
          </button>
          <button className="btn-volver" onClick={handleVolver}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

export default EstudianteMisionDetalle;
