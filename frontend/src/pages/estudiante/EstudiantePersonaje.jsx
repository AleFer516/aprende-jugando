// src/pages/estudiante/EstudiantePersonaje.jsx

import { useState, useEffect } from "react";
import estudianteService from "../../services/estudianteService";
import authService from "../../services/authService";
import "../../styles/estudiantePersonaje.css";

function EstudiantePersonaje() {
  const usuario = authService.getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [personalizaciones, setPersonalizaciones] = useState({
    apariencias: [],
    atuendos: [],
    accesorios: [],
    herramientas: []
  });
  const [estadisticas, setEstadisticas] = useState({ nivel: 1, misionesCompletadas: 0 });
  const [categoriaActiva, setCategoriaActiva] = useState("apariencia");
  const [aparienciaSeleccionada, setAparienciaSeleccionada] = useState(1);
  const [atuendoSeleccionado, setAtuendoSeleccionado] = useState(1);
  const [accesorioSeleccionado, setAccesorioSeleccionado] = useState(1);
  const [herramientaSeleccionada, setHerramientaSeleccionada] = useState(1);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarPersonalizaciones();
  }, []);

  const cargarPersonalizaciones = async () => {
    try {
      setLoading(true);
      const response = await estudianteService.getPersonaje();

      if (response.success) {
        setPersonalizaciones(response.personalizaciones);
        setAparienciaSeleccionada(response.activas.apariencia);
        setAtuendoSeleccionado(response.activas.atuendo);
        setAccesorioSeleccionado(response.activas.accesorio);
        setHerramientaSeleccionada(response.activas.herramienta);
        setEstadisticas(response.estadisticas);
      }
    } catch (error) {
      console.error("Error al cargar personalizaciones:", error);
      mostrarMensaje("Error al cargar personalizaciones");
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 3000);
  };

  const itemsActuales =
    categoriaActiva === "apariencia" ? personalizaciones.apariencias :
    categoriaActiva === "atuendo" ? personalizaciones.atuendos :
    categoriaActiva === "accesorio" ? personalizaciones.accesorios :
    personalizaciones.herramientas;

  const itemSeleccionado =
    categoriaActiva === "apariencia" ? aparienciaSeleccionada :
    categoriaActiva === "atuendo" ? atuendoSeleccionado :
    categoriaActiva === "accesorio" ? accesorioSeleccionado :
    herramientaSeleccionada;

  const handleSeleccion = (item) => {
    if (!item.desbloqueado) {
      mostrarMensaje(item.requisito || "Este aspecto aún está bloqueado.");
      return;
    }

    setMensaje("");

    if (categoriaActiva === "apariencia") {
      setAparienciaSeleccionada(item.id);
    } else if (categoriaActiva === "atuendo") {
      setAtuendoSeleccionado(item.id);
    } else if (categoriaActiva === "accesorio") {
      setAccesorioSeleccionado(item.id);
    } else {
      setHerramientaSeleccionada(item.id);
    }
  };

  const handleGuardarCambios = async () => {
    try {
      const response = await estudianteService.actualizarPersonaje({
        apariencia: aparienciaSeleccionada,
        atuendo: atuendoSeleccionado,
        accesorio: accesorioSeleccionado,
        herramienta: herramientaSeleccionada
      });

      if (response.success) {
        mostrarMensaje("Cambios guardados correctamente ✨");
      } else {
        mostrarMensaje(response.message || "Error al guardar");
      }
    } catch (error) {
      console.error("Error al guardar personalizaciones:", error);
      mostrarMensaje("Error al guardar personalizaciones");
    }
  };

  if (loading) {
    return (
      <div className="estudiante-personaje-page">
        <div className="personaje-bg"></div>
        <div className="personaje-overlay">
          <div className="personaje-header">
            <h1 className="personaje-title">Tu personaje</h1>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="estudiante-personaje-page">
      {/* 🔹 Fondo fijo */}
      <div className="personaje-bg"></div>

      {/* 🔹 Contenido encima del fondo */}
      <div className="personaje-overlay">
        {/* HEADER */}
        <div className="personaje-header">
          <h1 className="personaje-title">Tu personaje</h1>
          <p className="personaje-subtitle">
            Personaliza tu personaje y hazlo único para tu aventura educativa.
            <br />
            <span className="personaje-subtitle-strong">
              Desbloquea nuevas apariencias al completar misiones y subir de nivel.
              (Nivel {estadisticas.nivel} - {estadisticas.misionesCompletadas} misiones completadas)
            </span>
          </p>
        </div>

        {/* LAYOUT PRINCIPAL */}
        <div className="personaje-layout">
          {/* IZQUIERDA: PERSONAJE */}
          <div className="personaje-left">
            <div className="personaje-hero-card">
              <div className="personaje-hero-bg"></div>

              {/* 🔹 Personaje */}
              <div className="personaje-hero-layers">
                <img
                  src="/images/personaje.png"
                  alt="Tu personaje"
                  className="personaje-layer personaje-layer-unica"
                />
              </div>
            </div>

            <button className="personaje-nombre-btn">
              {usuario?.nombre || "Estudiante"}
            </button>
          </div>

          {/* DERECHA: PERSONALIZACIONES */}
          <div className="personaje-right">
            <div className="personaje-panel">
              <div className="personaje-panel-header-center">
                <div className="personaje-categoria-selector">
                  <button
                    className={`personaje-categoria-btn ${categoriaActiva === "apariencia" ? "activo" : ""}`}
                    type="button"
                    onClick={() => setCategoriaActiva("apariencia")}
                  >
                    Apariencia
                  </button>
                  <button
                    className={`personaje-categoria-btn ${categoriaActiva === "atuendo" ? "activo" : ""}`}
                    type="button"
                    onClick={() => setCategoriaActiva("atuendo")}
                  >
                    Atuendo
                  </button>
                  <button
                    className={`personaje-categoria-btn ${categoriaActiva === "accesorio" ? "activo" : ""}`}
                    type="button"
                    onClick={() => setCategoriaActiva("accesorio")}
                  >
                    Accesorio
                  </button>
                  <button
                    className={`personaje-categoria-btn ${categoriaActiva === "herramienta" ? "activo" : ""}`}
                    type="button"
                    onClick={() => setCategoriaActiva("herramienta")}
                  >
                    Herramienta
                  </button>
                </div>
              </div>

              <div className="personaje-avatar-grid">
                {itemsActuales.map((item) => {
                  const esSeleccionada = item.id === itemSeleccionado;
                  const clases = [
                    "personaje-avatar-card",
                    item.desbloqueado ? "avatar-desbloqueado" : "avatar-bloqueado",
                    esSeleccionada ? "avatar-seleccionado" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={clases}
                      onClick={() => handleSeleccion(item)}
                    >
                      <div className="personaje-avatar-inner">
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="personaje-avatar-img"
                        />

                        {!item.desbloqueado && (
                          <div className="personaje-avatar-lock">
                            <div className="lock-icon">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path
                                  d="M12 3a4 4 0 00-4 4v3H7a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-1V7a4 4 0 00-4-4z"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 14v3"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="0.75"
                                  fill="currentColor"
                                />
                              </svg>
                            </div>
                            {item.requisito && (
                              <span className="personaje-avatar-requisito">
                                {item.requisito}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="personaje-footer-center">
                <button
                  type="button"
                  className="personaje-guardar-btn"
                  onClick={handleGuardarCambios}
                >
                  Guardar cambios
                </button>
                {mensaje && (
                  <span className="personaje-mensaje-center">{mensaje}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EstudiantePersonaje;
