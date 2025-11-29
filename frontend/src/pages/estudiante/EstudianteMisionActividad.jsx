// src/pages/estudiante/EstudianteMisionActividad.jsx
// Página de actividad/ejercicio de una misión

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/estudianteMisionActividad.css";

function EstudianteMisionActividad() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estado de la actividad
  const [pasoActual, setPasoActual] = useState(1);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [intentos, setIntentos] = useState([]);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(false);

  // Datos de ejemplo de la misión
  const mision = {
    nombre: "Explorando la biblioteca perdida",
    dificultad: "Baja",
    pasosTotales: 5,
    xpActual: 1400,
    xpTotal: 1500,
  };

  // Datos de todos los pasos de la misión
  const pasosDatos = [
    {
      titulo: "Explorando la biblioteca perdida",
      enunciado:
        "Delante de ti se encuentran las puertas de la biblioteca perdida, un lugar lleno de secretos matemáticos. Para avanzar debes resolver el siguiente problema:",
      pregunta: "¿Cuánto es 12 × 14?",
      opciones: [
        { id: 1, valor: 144 },
        { id: 2, valor: 168 },
        { id: 3, valor: 100 },
        { id: 4, valor: 158 },
      ],
      respuestaCorrecta: 2,
      consejo:
        "Recuerda que la multiplicación es una suma repetida. Puedes descomponer 12 × 14 en (10 × 14) + (2 × 14).",
    },
    {
      titulo: "Explorando la biblioteca perdida",
      enunciado:
        "Has cruzado las puertas y ahora te encuentras en el gran salón de libros antiguos. En el centro hay un pedestal con una inscripción que dice: 'Resuelve para continuar'",
      pregunta: "Si tienes 3/4 de pizza y comes 1/2, ¿cuánta pizza te queda?",
      opciones: [
        { id: 1, valor: "1/4" },
        { id: 2, valor: "1/2" },
        { id: 3, valor: "2/4" },
        { id: 4, valor: "3/8" },
      ],
      respuestaCorrecta: 1,
      consejo:
        "Para restar fracciones, necesitas un denominador común. Convierte 1/2 a cuartos: 1/2 = 2/4. Luego resta: 3/4 - 2/4 = 1/4.",
    },
    {
      titulo: "Explorando la biblioteca perdida",
      enunciado:
        "Avanzas por un pasillo iluminado por velas flotantes. Al final encuentras una puerta cerrada con números tallados. La inscripción dice: 'El código es la respuesta'",
      pregunta: "¿Cuál es el resultado de 25 + 17 - 8?",
      opciones: [
        { id: 1, valor: 30 },
        { id: 2, valor: 34 },
        { id: 3, valor: 40 },
        { id: 4, valor: 32 },
      ],
      respuestaCorrecta: 2,
      consejo:
        "Resuelve de izquierda a derecha: primero suma 25 + 17 = 42, luego resta 8 a ese resultado: 42 - 8 = 34.",
    },
    {
      titulo: "Explorando la biblioteca perdida",
      enunciado:
        "La puerta se abre revelando una sala circular llena de símbolos matemáticos en las paredes. En el centro, un cristal brillante flota sobre un libro abierto con una pregunta:",
      pregunta: "¿Cuántos minutos hay en 2 horas y 45 minutos?",
      opciones: [
        { id: 1, valor: 145 },
        { id: 2, valor: 165 },
        { id: 3, valor: 155 },
        { id: 4, valor: 175 },
      ],
      respuestaCorrecta: 2,
      consejo:
        "Convierte las horas a minutos: 2 horas = 2 × 60 = 120 minutos. Luego suma los 45 minutos adicionales: 120 + 45 = 165 minutos.",
    },
    {
      titulo: "Explorando la biblioteca perdida",
      enunciado:
        "¡Último desafío! El cristal brilla intensamente y proyecta una última pregunta en el aire. Respóndela correctamente para desbloquear los secretos de la biblioteca perdida:",
      pregunta: "Si un libro cuesta $15 y tienes un descuento del 20%, ¿cuánto pagarás?",
      opciones: [
        { id: 1, valor: "$12" },
        { id: 2, valor: "$13" },
        { id: 3, valor: "$10" },
        { id: 4, valor: "$11" },
      ],
      respuestaCorrecta: 1,
      consejo:
        "El 20% de $15 es: 15 × 0.20 = $3. Resta el descuento al precio original: $15 - $3 = $12.",
    },
  ];

  // Datos del paso actual (índice es pasoActual - 1)
  const pasoData = pasosDatos[pasoActual - 1];

  const handleSeleccionarOpcion = (opcionId) => {
    if (!respuestaCorrecta) {
      setRespuestaSeleccionada(opcionId);
    }
  };

  const handleEnviarRespuesta = () => {
    if (respuestaSeleccionada === null) {
      alert("Por favor selecciona una opción");
      return;
    }

    const esCorrecta = respuestaSeleccionada === pasoData.respuestaCorrecta;

    const nuevoIntento = {
      numero: intentos.length + 1,
      correcto: esCorrecta,
    };

    setIntentos([...intentos, nuevoIntento]);

    if (esCorrecta) {
      setRespuestaCorrecta(true);
      // Aquí podrías mostrar un mensaje de éxito
      setTimeout(() => {
        // Avanzar al siguiente paso o finalizar
        if (pasoActual < mision.pasosTotales) {
          setPasoActual(pasoActual + 1);
          setRespuestaSeleccionada(null);
          setRespuestaCorrecta(false);
          setIntentos([]);
        } else {
          // Misión completada
          alert("¡Misión completada!");
          navigate("/estudiante/misiones");
        }
      }, 2000);
    }
  };

  const handleVolver = () => {
    navigate("/estudiante/misiones");
  };

  const nivelProgreso = ((pasoActual - 1) / mision.pasosTotales) * 100;
  const xpProgreso = (mision.xpActual / mision.xpTotal) * 100;

  return (
    <div className="mision-actividad-page">
      {/* Fondo fijo */}
      <div className="mision-actividad-bg"></div>

      {/* Overlay de contenido */}
      <div className="mision-actividad-overlay">
        {/* Header superior */}
        <div className="actividad-header">
          <div className="actividad-header-left">
            <h1 className="actividad-titulo">{pasoData.titulo}</h1>
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
              Dificultad: {mision.dificultad}
            </div>
            <div className="actividad-badge-paso">
              Paso {pasoActual} / {mision.pasosTotales}
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
              <div className="ejercicio-enunciado">
                <p>{pasoData.enunciado}</p>
              </div>

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
                    respuestaCorrecta && opcion.id === pasoData.respuestaCorrecta
                      ? "correcta"
                      : ""
                  } ${
                    respuestaCorrecta &&
                    respuestaSeleccionada === opcion.id &&
                    opcion.id !== pasoData.respuestaCorrecta
                      ? "incorrecta"
                      : ""
                  }`}
                  onClick={() => handleSeleccionarOpcion(opcion.id)}
                  disabled={respuestaCorrecta}
                >
                  {opcion.valor}
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
                <h3>Nivel 5</h3>
                <p>
                  {mision.xpActual} / {mision.xpTotal} XP
                </p>
              </div>
            </div>

            {/* Consejo */}
            <div className="lateral-consejo">
              <h3>Consejo:</h3>
              <p>{pasoData.consejo}</p>
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
