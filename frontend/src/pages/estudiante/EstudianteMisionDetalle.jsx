// src/pages/estudiante/EstudianteMisionDetalle.jsx
// Página de detalles de una misión específica

import { useParams, useNavigate } from "react-router-dom";
import "../../styles/estudianteMisionDetalle.css";

function EstudianteMisionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Datos de ejemplo de la misión
  const mision = {
    id: 1,
    nombre: "Resolver ecuaciones de primer grado",
    dificultad: "Baja",
    categoria: "Matemáticas",
    objetivo:
      "Que el estudiante sea capaz de resolver ecuaciones de primer grado con una incógnita, aplicando reglas básicas de equivalencia y manteniendo el equilibrio de la igualdad.",
    competencias: [
      "Aplicar propiedades básicas de igualdad",
      "Aislar términos en una ecuación",
      "Simplificar expresiones algebraicas",
      "Verificar soluciones reemplazando en la ecuación original",
    ],
    descripcion:
      "En esta misión, el estudiante se adentra en un desafío matemático donde deberá manipular ecuaciones paso a paso para encontrar el valor desconocido. A través de ejemplos guiados y ejercicios prácticos, comprenderá cómo funcionan las transformaciones permitidas y por qué mantener el equilibrio en ambos lados de la igualdad es esencial.",
    pistas: [
      "Recuerda: lo que haces en un lado de la ecuación, debes hacerlo en el otro.",
      "Agrupa términos semejantes para simplificar tu avance.",
      "Si tienes dudas, prueba reemplazar tu respuesta para verificar si cumple la igualdad.",
      "Identifica primero qué operación te permitirá aislar la incógnita más rápido.",
    ],
    retroalimentacion:
      "Al finalizar la misión, el sistema te mostrará si tus respuestas son correctas, incorrectas o parcialmente correctas. Además, recibirás comentarios personalizados que te indicarán qué paso fue aplicado correctamente, dónde cometiste errores y qué estrategia podrías mejorar para resolver ecuaciones similares en el futuro.",
  };

  const handleVolver = () => {
    navigate("/estudiante/misiones");
  };

  const handleIniciarActividad = () => {
    navigate(`/estudiante/misiones/${id}/actividad`);
  };

  return (
    <div className="mision-detalle-page">
      {/* Fondo fijo */}
      <div className="mision-detalle-bg"></div>

      {/* Overlay de contenido */}
      <div className="mision-detalle-overlay">
        {/* Header con nombre de la misión */}
        <div className="mision-detalle-header">
        <h1 className="mision-detalle-title">{mision.nombre}</h1>
        <div className="mision-detalle-badges">
          <span className="badge-dificultad badge-baja">
            Dificultad: {mision.dificultad}
          </span>
          <span className="badge-categoria">Categoría: {mision.categoria}</span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mision-detalle-contenido">
        {/* Objetivo de aprendizaje */}
        <div className="mision-detalle-seccion">
          <h2 className="seccion-titulo">Objetivo de aprendizaje</h2>
          <p className="seccion-texto">{mision.objetivo}</p>
        </div>

        {/* Competencias */}
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

        {/* Descripción */}
        <div className="mision-detalle-seccion">
          <h2 className="seccion-titulo">Descripción</h2>
          <p className="seccion-texto">{mision.descripcion}</p>
        </div>

        {/* Grid con Pistas y Retroalimentación */}
        <div className="mision-detalle-grid">
          {/* Pistas */}
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

          {/* Retroalimentación */}
          <div className="mision-detalle-card">
            <h2 className="card-titulo">Retroalimentación</h2>
            <p className="card-texto">{mision.retroalimentacion}</p>
          </div>
        </div>
      </div>

        {/* Footer con botones */}
        <div className="mision-detalle-footer">
          <button className="btn-iniciar" onClick={handleIniciarActividad}>
            Iniciar actividad
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
