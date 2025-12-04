// src/pages/estudiante/EstudianteMisionActividad.jsx
// Página de actividad/ejercicio de una misión

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import estudianteService from "../../services/estudianteService";
import "../../styles/estudianteMisionActividad.css";

function EstudianteMisionActividad() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estado de la actividad
  const [loading, setLoading] = useState(true);
  const [mision, setMision] = useState(null);
  const [actividades, setActividades] = useState([]);
  const [pasoActual, setPasoActual] = useState(1);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [intentos, setIntentos] = useState([]);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(false);

  useEffect(() => {
    cargarMisionYActividades();
  }, [id]);

  const cargarMisionYActividades = async () => {
    try {
      setLoading(true);

      // Cargar datos de la misión
      const misionResponse = await estudianteService.getMisionDetalle(id);
      if (misionResponse.success) {
        setMision(misionResponse.mision);
      }

      // Cargar actividades de la misión
      const actividadesResponse = await estudianteService.getActividades(id);
      if (actividadesResponse.success) {
        setActividades(actividadesResponse.actividades);

        // Encontrar la primera actividad no respondida para continuar desde ahí
        const primeraNoRespondida = actividadesResponse.actividades.findIndex(
          act => !act.respondida
        );

        if (primeraNoRespondida !== -1) {
          setPasoActual(primeraNoRespondida + 1);
        } else {
          // Si todas están respondidas, ir a la última
          setPasoActual(actividadesResponse.actividades.length);
        }
      }
    } catch (error) {
      console.error("Error al cargar misión y actividades:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mision-actividad-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Cargando actividades...</p>
      </div>
    );
  }

  if (!mision || !actividades || actividades.length === 0) {
    return (
      <div className="mision-actividad-page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: '1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No se pudieron cargar las actividades.</p>
        <button className="btn-volver-actividad" onClick={() => navigate("/estudiante/misiones")}>
          Volver a misiones
        </button>
      </div>
    );
  }

  // Datos del paso actual (índice es pasoActual - 1)
  const pasoData = actividades[pasoActual - 1];

  // Encontrar la respuesta correcta de las opciones
  const opcionCorrecta = pasoData.opciones.find(op => op.es_correcta);
  const respuestaCorrectaId = opcionCorrecta ? opcionCorrecta.id : null;

  const handleSeleccionarOpcion = (opcionId) => {
    if (!respuestaCorrecta) {
      setRespuestaSeleccionada(opcionId);
    }
  };

  const handleEnviarRespuesta = async () => {
    if (respuestaSeleccionada === null) {
      alert("Por favor selecciona una opción");
      return;
    }

    try {
      // Enviar respuesta al backend
      const response = await estudianteService.responderActividad(
        pasoData.id,
        respuestaSeleccionada
      );

      if (response.success) {
        const esCorrecta = response.esCorrecta;

        const nuevoIntento = {
          numero: response.intentos,
          correcto: esCorrecta,
        };

        setIntentos([...intentos, nuevoIntento]);

        if (esCorrecta) {
          setRespuestaCorrecta(true);

          setTimeout(() => {
            // Avanzar al siguiente paso o finalizar
            if (pasoActual < actividades.length) {
              setPasoActual(pasoActual + 1);
              setRespuestaSeleccionada(null);
              setRespuestaCorrecta(false);
              setIntentos([]);
            } else {
              // Misión completada
              alert("¡Misión completada! Has terminado todas las actividades.");
              navigate("/estudiante/misiones");
            }
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error al enviar respuesta:", error);
      alert("Error al guardar la respuesta. Por favor intenta de nuevo.");
    }
  };

  const handleVolver = () => {
    navigate("/estudiante/misiones");
  };

  const capitalizarDificultad = (dificultad) => {
    if (!dificultad) return "Media";
    const dificultades = {
      'facil': 'Baja',
      'medio': 'Media',
      'dificil': 'Alta'
    };
    return dificultades[dificultad] || dificultad;
  };

  const nivelProgreso = ((pasoActual - 1) / actividades.length) * 100;

  return (
    <div className="mision-actividad-page">
      {/* Fondo fijo */}
      <div className="mision-actividad-bg"></div>

      {/* Overlay de contenido */}
      <div className="mision-actividad-overlay">
        {/* Header superior */}
        <div className="actividad-header">
          <div className="actividad-header-left">
            <h1 className="actividad-titulo">{mision.titulo}</h1>
            <div className="actividad-progreso-wrapper">
              <div className="actividad-progreso-bar-bg">
                <div
                  className="actividad-progreso-bar-fill"
                  style={{ width: `${nivelProgreso}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="actividad-header-right">
            <div className="actividad-badge-dificultad">
              Dificultad: {capitalizarDificultad(mision.dificultad)}
            </div>
            <div className="actividad-badge-paso">
              Paso {pasoActual} / {actividades.length}
            </div>
            <button className="btn-volver-actividad" onClick={handleVolver}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Volver
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="actividad-contenido">
          {/* Panel izquierdo - Ejercicio */}
          <div className="actividad-panel-ejercicio">
            {/* Fondo de biblioteca */}
            <div className="ejercicio-fondo-biblioteca"></div>

            {/* Contenido del ejercicio */}
            <div className="ejercicio-contenido">
              {/* Indicador si la actividad ya fue respondida */}
              {pasoData.respondida && (
                <div style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  color: '#22c55e',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  textAlign: 'center',
                  fontSize: '0.875rem'
                }}>
                  ✓ Ya completaste esta actividad
                </div>
              )}

              <div className="ejercicio-pregunta">
                <p>{pasoData.pregunta}</p>
              </div>

              {/* Estrellas decorativas */}
              <div className="estrellas-decorativas">
                <div className="estrella" style={{ top: "15%", left: "10%" }}>✦</div>
                <div className="estrella" style={{ top: "30%", right: "15%" }}>✦</div>
                <div className="estrella" style={{ bottom: "35%", left: "8%" }}>✦</div>
                <div className="estrella" style={{ bottom: "20%", right: "12%" }}>✦</div>
              </div>
            </div>

            {/* Opciones de respuesta */}
            <div className="ejercicio-opciones">
              {pasoData.opciones.map((opcion) => (
                <button
                  key={opcion.id}
                  className={`opcion-btn ${
                    respuestaSeleccionada === opcion.id ? "selected" : ""
                  } ${
                    respuestaCorrecta && opcion.es_correcta
                      ? "correcta"
                      : ""
                  } ${
                    respuestaCorrecta &&
                    respuestaSeleccionada === opcion.id &&
                    !opcion.es_correcta
                      ? "incorrecta"
                      : ""
                  }`}
                  onClick={() => handleSeleccionarOpcion(opcion.id)}
                  disabled={respuestaCorrecta}
                >
                  {opcion.texto}
                </button>
              ))}
            </div>

            <button
              className="btn-enviar-respuesta"
              onClick={handleEnviarRespuesta}
              disabled={respuestaCorrecta}
            >
              Enviar respuesta
            </button>
          </div>

          {/* Panel derecho - Info del estudiante */}
          <div className="actividad-panel-lateral">
            {/* Avatar y nivel */}
            <div className="lateral-avatar-section">
              <div className="lateral-avatar">
                <svg viewBox="0 0 200 200" className="avatar-placeholder">
                  <circle cx="100" cy="70" r="35" fill="#f97316" />
                  <ellipse cx="100" cy="150" rx="50" ry="60" fill="#f97316" />
                  <circle cx="88" cy="65" r="5" fill="#451a03" />
                  <circle cx="112" cy="65" r="5" fill="#451a03" />
                  <path d="M 85 80 Q 100 88 115 80" stroke="#451a03" strokeWidth="2" fill="none" />
                </svg>
              </div>

              <div className="lateral-nivel">
                <h3>Nivel {mision.nivel || 1}</h3>
                <p>Progreso: {mision.progreso || 0}%</p>
              </div>
            </div>

            {/* Consejo */}
            <div className="lateral-consejo">
              <h3>Explicación:</h3>
              <p>{pasoData.explicacion}</p>
            </div>

            {/* Intentos */}
            <div className="lateral-intentos">
              {intentos.map((intento) => (
                <div
                  key={intento.numero}
                  className={`intento-item ${intento.correcto ? "correcto" : "incorrecto"}`}
                >
                  <span className="intento-label">Intento {intento.numero}</span>
                  <span className="intento-resultado">
                    {intento.correcto ? "¡Correcto!" : "Incorrecto!"}
                  </span>
                  <span className="intento-accion">
                    {intento.correcto ? "" : "Intenta de nuevo"}
                  </span>
                </div>
              ))}

              {intentos.length === 0 && (
                <div className="intento-placeholder">
                  <span className="intento-label">Intento 1</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EstudianteMisionActividad;
