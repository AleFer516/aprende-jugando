// src/pages/gm/GMEvaluarMision.jsx
// Página de evaluación de misión individual del estudiante

import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../../styles/gmEvaluarMision.css";
import "../../styles/themes.css";

function GMEvaluarMision() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [retroalimentacion, setRetroalimentacion] = useState("");
  const [calificacionSeleccionada, setCalificacionSeleccionada] = useState(null);

  // Datos de ejemplo de la entrega del estudiante
  const [entrega] = useState({
    estudiante: {
      nombre: "Alejandra Fernandez",
      curso: "Curso A",
      avatar: null
    },
    mision: {
      titulo: "Resolver ecuaciones del primer grado",
      categoria: "Matemáticas",
      dificultad: "Baja",
      xp: 150,
      fechaEntrega: "15/07/2025"
    },
    ranking: 4,
    nivelActual: 5,
    xpActual: 1350,
    xpTotal: 1500,
    logrosRecientes: [
      { nombre: "Primer explorador", fecha: "23/04/2025" }
    ],
    misionesPendientes: [
      "Crear módulo de pares en impares en Java",
      "Crear diagrama de clases"
    ],
    respuesta: "Ha resuelto las siguientes ecuaciones:",
    estado: "A tiempo" // "A tiempo" | "Finalizado" | "Pendiente"
  });

  const handleVolver = () => {
    navigate("/gm/evaluaciones");
  };

  const handleCalificar = (tipo) => {
    setCalificacionSeleccionada(tipo);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!calificacionSeleccionada) {
      alert("Por favor, selecciona una calificación (Aprobar o Rechazar)");
      return;
    }

    console.log("Calificación:", calificacionSeleccionada);
    console.log("Retroalimentación:", retroalimentacion);

    alert(`Misión ${calificacionSeleccionada === 'aprobar' ? 'aprobada' : 'rechazada'} exitosamente`);
    handleVolver();
  };

  return (
    <div className="gm-evaluar-mision">
      {/* Header con información del estudiante */}
      <div className="gm-evaluar-header">
        <div className="gm-evaluar-estudiante-info">
          <div className="gm-evaluar-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="gm-evaluar-estudiante-datos">
            <h1 className="gm-evaluar-estudiante-nombre">{entrega.estudiante.nombre}</h1>
            <p className="gm-evaluar-estudiante-curso">{entrega.estudiante.curso}</p>
          </div>
        </div>
      </div>

      <div className="gm-evaluar-container">
        {/* Columna izquierda - Detalles de la misión y entrega */}
        <div className="gm-evaluar-left">
          {/* Información de la misión */}
          <div className="gm-evaluar-card gm-evaluar-mision-info">
            <h2 className="gm-evaluar-mision-titulo">{entrega.mision.titulo}</h2>

            <div className="gm-evaluar-mision-badges">
              <span className="gm-evaluar-badge gm-badge-categoria">
                {entrega.mision.categoria}
              </span>
              <span className={`gm-evaluar-badge gm-badge-dificultad ${entrega.mision.dificultad.toLowerCase()}`}>
                Dificultad: {entrega.mision.dificultad}
              </span>
              <span className="gm-evaluar-badge gm-badge-xp">
                +{entrega.mision.xp} XP
              </span>
            </div>

            <div className="gm-evaluar-mision-meta">
              <span>Entregado el {entrega.mision.fechaEntrega}</span>
              <span className={`gm-evaluar-estado ${entrega.estado.toLowerCase().replace(' ', '-')}`}>
                {entrega.estado}
              </span>
            </div>
          </div>

          {/* Entrega del estudiante */}
          <div className="gm-evaluar-card">
            <h3 className="gm-evaluar-card-title">Entrega del estudiante</h3>
            <div className="gm-evaluar-respuesta">
              <p>{entrega.respuesta}</p>
            </div>
          </div>

          {/* Retroalimentación */}
          <div className="gm-evaluar-card">
            <h3 className="gm-evaluar-card-title">Retroalimentación</h3>
            <p className="gm-evaluar-hint">
              Ingresa tus comentarios constructivos para que el estudiante pueda mejorar y reforzar los conceptos aprendidos...
            </p>
            <textarea
              className="gm-evaluar-textarea"
              value={retroalimentacion}
              onChange={(e) => setRetroalimentacion(e.target.value)}
              placeholder="Escribe aquí tu retroalimentación para el estudiante..."
              rows="6"
            />
          </div>

          {/* Calificación */}
          <div className="gm-evaluar-card">
            <h3 className="gm-evaluar-card-title">Calificación</h3>
            <div className="gm-evaluar-calificacion-btns">
              <button
                type="button"
                className={`gm-evaluar-btn gm-btn-aprobar ${calificacionSeleccionada === 'aprobar' ? 'selected' : ''}`}
                onClick={() => handleCalificar('aprobar')}
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Aprobar misión
              </button>
              <button
                type="button"
                className={`gm-evaluar-btn gm-btn-rechazar ${calificacionSeleccionada === 'rechazar' ? 'selected' : ''}`}
                onClick={() => handleCalificar('rechazar')}
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Rechazar misión
              </button>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="gm-evaluar-actions">
            <button
              type="button"
              className="gm-evaluar-btn gm-btn-volver"
              onClick={handleVolver}
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Volver
            </button>
            <button
              type="submit"
              className="gm-evaluar-btn gm-btn-enviar"
              onClick={handleSubmit}
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              Enviar calificación
            </button>
          </div>
        </div>

        {/* Columna derecha - Historial del estudiante */}
        <div className="gm-evaluar-right">
          <div className="gm-evaluar-card gm-evaluar-historial">
            <h3 className="gm-evaluar-card-title">Historial del estudiante</h3>

            {/* Ranking */}
            <div className="gm-evaluar-stat">
              <span className="gm-evaluar-stat-label">Ranking</span>
              <div className="gm-evaluar-stat-value">
                <span className="gm-evaluar-ranking">{entrega.ranking}</span>
                <div className="gm-evaluar-progress-mini"></div>
              </div>
            </div>

            {/* Nivel actual */}
            <div className="gm-evaluar-stat">
              <span className="gm-evaluar-stat-label">Nivel actual</span>
              <div className="gm-evaluar-stat-value">
                <span className="gm-evaluar-nivel">{entrega.nivelActual}</span>
                <div className="gm-evaluar-xp-bar">
                  <div
                    className="gm-evaluar-xp-fill"
                    style={{ width: `${(entrega.xpActual / entrega.xpTotal) * 100}%` }}
                  ></div>
                </div>
                <span className="gm-evaluar-xp-text">{entrega.xpActual} / {entrega.xpTotal} XP</span>
              </div>
            </div>

            {/* Logros recientes */}
            <div className="gm-evaluar-section">
              <h4 className="gm-evaluar-section-title">Logros recientes</h4>
              <ul className="gm-evaluar-logros-list">
                {entrega.logrosRecientes.map((logro, index) => (
                  <li key={index} className="gm-evaluar-logro-item">
                    <span className="gm-evaluar-logro-nombre">{logro.nombre}</span>
                    <span className="gm-evaluar-logro-fecha">{logro.fecha}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Misiones pendientes */}
            <div className="gm-evaluar-section">
              <h4 className="gm-evaluar-section-title">Misiones Pendientes</h4>
              <ul className="gm-evaluar-pendientes-list">
                {entrega.misionesPendientes.map((mision, index) => (
                  <li key={index} className="gm-evaluar-pendiente-item">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>{mision}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GMEvaluarMision;
