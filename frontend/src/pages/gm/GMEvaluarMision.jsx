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
        <div className="gm-evaluar-avatar">
          {entrega.estudiante.nombre.charAt(0)}
        </div>
        <div className="gm-evaluar-info">
          <h2>{entrega.estudiante.nombre}</h2>
          <p>{entrega.estudiante.curso}</p>
        </div>
      </div>

      <div className="gm-evaluar-container">
        {/* Columna izquierda - Detalles de la misión y entrega */}
        <div className="gm-evaluar-left">
          {/* Información de la misión */}
          <div className="gm-evaluar-mision-info">
            <h3>{entrega.mision.titulo}</h3>

            <div className="gm-evaluar-badges">
              <span className="gm-evaluar-badge categoria">
                📚 {entrega.mision.categoria}
              </span>
              <span className="gm-evaluar-badge dificultad">
                ⚡ {entrega.mision.dificultad}
              </span>
              <span className="gm-evaluar-badge xp">
                ⭐ +{entrega.mision.xp} XP
              </span>
              <span className="gm-evaluar-badge estado">
                ⏰ {entrega.estado}
              </span>
            </div>

            <p className="gm-evaluar-fecha">
              Entregado el {entrega.mision.fechaEntrega}
            </p>
          </div>

          {/* Entrega del estudiante */}
          <div className="gm-evaluar-respuesta">
            <h3>Entrega del estudiante</h3>
            <div className="gm-evaluar-respuesta-content">
              {entrega.respuesta}
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
            <div className="gm-evaluar-calificacion">
              <button
                type="button"
                className={`gm-evaluar-btn-calificacion aprobar ${calificacionSeleccionada === 'aprobar' ? 'selected' : ''}`}
                onClick={() => handleCalificar('aprobar')}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Aprobar misión
              </button>
              <button
                type="button"
                className={`gm-evaluar-btn-calificacion rechazar ${calificacionSeleccionada === 'rechazar' ? 'selected' : ''}`}
                onClick={() => handleCalificar('rechazar')}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
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
              className="gm-evaluar-btn volver"
              onClick={handleVolver}
            >
              Volver
            </button>
            <button
              type="submit"
              className="gm-evaluar-btn submit"
              onClick={handleSubmit}
            >
              Enviar calificación
            </button>
          </div>
        </div>

        {/* Columna derecha - Historial del estudiante */}
        <div className="gm-evaluar-right">
          {/* Stats del estudiante */}
          <div className="gm-evaluar-stats">
            <h3>Estadísticas</h3>

            <div className="gm-evaluar-stat-item">
              <span className="gm-evaluar-stat-label">Ranking</span>
              <div className="gm-evaluar-ranking">
                🏆 #{entrega.ranking}
              </div>
            </div>

            <div className="gm-evaluar-stat-item">
              <span className="gm-evaluar-stat-label">Nivel</span>
              <div className="gm-evaluar-nivel-info">
                <span className="gm-evaluar-nivel">Nivel {entrega.nivelActual}</span>
                <span className="gm-evaluar-xp">{entrega.xpActual} / {entrega.xpTotal} XP</span>
              </div>
              <div className="gm-evaluar-xp-bar">
                <div
                  className="gm-evaluar-xp-fill"
                  style={{ width: `${(entrega.xpActual / entrega.xpTotal) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Logros recientes */}
          <div className="gm-evaluar-logros">
            <h3>Logros recientes</h3>
            {entrega.logrosRecientes.map((logro, index) => (
              <div key={index} className="gm-evaluar-logro-item">
                <span className="gm-evaluar-logro-icon">🏅</span>
                <span className="gm-evaluar-logro-text">{logro.nombre}</span>
              </div>
            ))}
          </div>

          {/* Misiones pendientes */}
          <div className="gm-evaluar-pendientes">
            <h3>Misiones Pendientes</h3>
            {entrega.misionesPendientes.map((mision, index) => (
              <div key={index} className="gm-evaluar-pendiente-item">
                <div className="gm-evaluar-pendiente-titulo">{mision}</div>
                <div className="gm-evaluar-pendiente-categoria">Matemáticas</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GMEvaluarMision;
