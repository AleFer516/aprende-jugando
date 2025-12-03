// src/pages/estudiante/EstudiantePersonaje.jsx

import { useState } from "react";
import "../../styles/estudiantePersonaje.css";

function EstudiantePersonaje() {
  const estudiante = {
    nombre: "Alejandra",
  };

  // 🔹 Aqui defines cómo se verá cada apariencia
  // - imagen: personaje completo (versión simple)
  // - layers: opcional, por si luego quieres separar body / ropa / accesorio, etc.
  const apariencias = [
    {
      id: 1,
      nombre: "Apariencia 1",
      desbloqueado: true,
      requisito: "",
      imagen: "/images/personaje.png",
    },
    {
      id: 2,
      nombre: "Apariencia 2",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 3",
      imagen: "/images/personaje_2.png",
    },
    {
      id: 3,
      nombre: "Apariencia 3",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 5",
      imagen: "/images/personaje_3.png",
    },
    {
      id: 4,
      nombre: "Apariencia 4",
      desbloqueado: false,
      requisito: "Desbloquea completando 20 misiones",
      imagen: "/images/personaje_lock_1.png",
    },
    {
      id: 5,
      nombre: "Apariencia 5",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 8",
      imagen: "/images/personaje_5.png",
    },
    {
      id: 6,
      nombre: "Apariencia 6",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 10",
      imagen: "/images/personaje_lock_2.png",
    },
    {
      id: 7,
      nombre: "Apariencia 7",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 12",
      imagen: "/images/personaje_lock_3.png",
    },
    {
      id: 8,
      nombre: "Apariencia 8",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 15",
      imagen: "/images/personaje_lock_4.png",
    },
    {
      id: 9,
      nombre: "Apariencia 9",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 20",
      imagen: "/images/personaje_9.png",
    },
  ];

  // 🔹 Datos de atuendos
  const atuendos = [
    {
      id: 1,
      nombre: "Atuendo 1",
      desbloqueado: true,
      requisito: "",
      imagen: "/images/atuendo1.png",
    },
    {
      id: 2,
      nombre: "Atuendo 2",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 3",
      imagen: "/images/atuendo2.png",
    },
    {
      id: 3,
      nombre: "Atuendo 3",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 5",
      imagen: "/images/atuendo3.png",
    },
    {
      id: 4,
      nombre: "Atuendo 4",
      desbloqueado: false,
      requisito: "Desbloquea completando 20 misiones",
      imagen: "/images/atuendo4.png",
    },
    {
      id: 5,
      nombre: "Atuendo 5",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 8",
      imagen: "/images/atuendo5.png",
    },
    {
      id: 6,
      nombre: "Atuendo 6",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 10",
      imagen: "/images/atuendo6.png",
    },
    {
      id: 7,
      nombre: "Atuendo 7",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 12",
      imagen: "/images/atuendo7.png",
    },
    {
      id: 8,
      nombre: "Atuendo 8",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 15",
      imagen: "/images/atuendo8.png",
    },
    {
      id: 9,
      nombre: "Atuendo 9",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 20",
      imagen: "/images/atuendo9.png",
    },
  ];

  // 🔹 Datos de accesorios
  const accesorios = [
    {
      id: 1,
      nombre: "Accesorio 1",
      desbloqueado: true,
      requisito: "",
      imagen: "/images/accesorio1.png",
    },
    {
      id: 2,
      nombre: "Accesorio 2",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 3",
      imagen: "/images/accesorio2.png",
    },
    {
      id: 3,
      nombre: "Accesorio 3",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 5",
      imagen: "/images/accesorio3.png",
    },
    {
      id: 4,
      nombre: "Accesorio 4",
      desbloqueado: false,
      requisito: "Desbloquea completando 20 misiones",
      imagen: "/images/accesorio4.png",
    },
    {
      id: 5,
      nombre: "Accesorio 5",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 8",
      imagen: "/images/accesorio5.png",
    },
    {
      id: 6,
      nombre: "Accesorio 6",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 10",
      imagen: "/images/accesorio6.png",
    },
    {
      id: 7,
      nombre: "Accesorio 7",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 12",
      imagen: "/images/accesorio7.png",
    },
    {
      id: 8,
      nombre: "Accesorio 8",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 15",
      imagen: "/images/accesorio8.png",
    },
    {
      id: 9,
      nombre: "Accesorio 9",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 20",
      imagen: "/images/accesorio9.png",
    },
  ];

  // 🔹 Datos de herramientas
  const herramientas = [
    {
      id: 1,
      nombre: "Herramienta 1",
      desbloqueado: true,
      requisito: "",
      imagen: "/images/herramienta1.png",
    },
    {
      id: 2,
      nombre: "Herramienta 2",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 3",
      imagen: "/images/herramienta2.png",
    },
    {
      id: 3,
      nombre: "Herramienta 3",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 5",
      imagen: "/images/herramienta3.png",
    },
    {
      id: 4,
      nombre: "Herramienta 4",
      desbloqueado: false,
      requisito: "Desbloquea completando 20 misiones",
      imagen: "/images/herramienta4.png",
    },
    {
      id: 5,
      nombre: "Herramienta 5",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 8",
      imagen: "/images/herramienta5.png",
    },
    {
      id: 6,
      nombre: "Herramienta 6",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 10",
      imagen: "/images/herramienta6.png",
    },
    {
      id: 7,
      nombre: "Herramienta 7",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 12",
      imagen: "/images/herramienta7.png",
    },
    {
      id: 8,
      nombre: "Herramienta 8",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 15",
      imagen: "/images/herramienta8.png",
    },
    {
      id: 9,
      nombre: "Herramienta 9",
      desbloqueado: false,
      requisito: "Desbloquea en el nivel 20",
      imagen: "/images/herramienta9.png",
    },
  ];

  const [categoriaActiva, setCategoriaActiva] = useState("apariencia"); // "apariencia", "atuendo", "accesorio" o "herramienta"
  const [aparienciaSeleccionada, setAparienciaSeleccionada] = useState(1);
  const [atuendoSeleccionado, setAtuendoSeleccionado] = useState(1);
  const [accesorioSeleccionado, setAccesorioSeleccionado] = useState(1);
  const [herramientaSeleccionada, setHerramientaSeleccionada] = useState(1);
  const [mensaje, setMensaje] = useState("");

  const aparienciaActiva =
    apariencias.find((ap) => ap.id === aparienciaSeleccionada) || apariencias[0];

  const atuendoActivo =
    atuendos.find((at) => at.id === atuendoSeleccionado) || atuendos[0];

  const accesorioActivo =
    accesorios.find((ac) => ac.id === accesorioSeleccionado) || accesorios[0];

  const herramientaActiva =
    herramientas.find((her) => her.id === herramientaSeleccionada) || herramientas[0];

  const handleSeleccionApariencia = (ap) => {
    if (!ap.desbloqueado) {
      setMensaje(ap.requisito || "Este aspecto aún está bloqueado.");
      return;
    }
    setMensaje("");
    setAparienciaSeleccionada(ap.id);
  };

  const handleSeleccionAtuendo = (at) => {
    if (!at.desbloqueado) {
      setMensaje(at.requisito || "Este atuendo aún está bloqueado.");
      return;
    }
    setMensaje("");
    setAtuendoSeleccionado(at.id);
  };

  const handleSeleccionAccesorio = (ac) => {
    if (!ac.desbloqueado) {
      setMensaje(ac.requisito || "Este accesorio aún está bloqueado.");
      return;
    }
    setMensaje("");
    setAccesorioSeleccionado(ac.id);
  };

  const handleSeleccionHerramienta = (her) => {
    if (!her.desbloqueado) {
      setMensaje(her.requisito || "Esta herramienta aún está bloqueada.");
      return;
    }
    setMensaje("");
    setHerramientaSeleccionada(her.id);
  };

  const handleGuardarCambios = () => {
    // Aquí iría la llamada a la API real
    setMensaje("Cambios guardados correctamente ✨");
    setTimeout(() => setMensaje(""), 2500);
  };

  // Determinar qué mostrar según la categoría activa
  const itemsActuales =
    categoriaActiva === "apariencia" ? apariencias :
    categoriaActiva === "atuendo" ? atuendos :
    categoriaActiva === "accesorio" ? accesorios : herramientas;

  const itemSeleccionado =
    categoriaActiva === "apariencia" ? aparienciaSeleccionada :
    categoriaActiva === "atuendo" ? atuendoSeleccionado :
    categoriaActiva === "accesorio" ? accesorioSeleccionado : herramientaSeleccionada;

  const handleSeleccion =
    categoriaActiva === "apariencia" ? handleSeleccionApariencia :
    categoriaActiva === "atuendo" ? handleSeleccionAtuendo :
    categoriaActiva === "accesorio" ? handleSeleccionAccesorio : handleSeleccionHerramienta;

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
            Desbloquea nuevas apariencias al completar misiones y subir de
            nivel.
          </span>
        </p>
      </div>

      {/* LAYOUT PRINCIPAL */}
      <div className="personaje-layout">
        {/* IZQUIERDA: PERSONAJE */}
        <div className="personaje-left">
          <div className="personaje-hero-card">
            <div className="personaje-hero-bg"></div>

            {/* 🔹 Aquí es donde el personaje cambia según la apariencia */}
            <div className="personaje-hero-layers">
              {aparienciaActiva.layers ? (
                <>
                  {/* Modo por CAPAS (cuando ya tengas assets separados) */}
                  {aparienciaActiva.layers.base && (
                    <img
                      src={aparienciaActiva.layers.base}
                      alt="Base personaje"
                      className="personaje-layer layer-base"
                    />
                  )}
                  {aparienciaActiva.layers.ropa && (
                    <img
                      src={aparienciaActiva.layers.ropa}
                      alt="Ropa personaje"
                      className="personaje-layer layer-ropa"
                    />
                  )}
                  {aparienciaActiva.layers.accesorio && (
                    <img
                      src={aparienciaActiva.layers.accesorio}
                      alt="Accesorio personaje"
                      className="personaje-layer layer-accesorio"
                    />
                  )}
                </>
              ) : (
                /* Modo simple: una sola imagen por apariencia */
                <img
                  src={aparienciaActiva.imagen}
                  alt={aparienciaActiva.nombre}
                  className="personaje-layer personaje-layer-unica"
                />
              )}
            </div>
          </div>

          <button className="personaje-nombre-btn">
            {estudiante.nombre}
          </button>
        </div>

        {/* DERECHA: APARIENCIAS, ATUENDOS Y ACCESORIOS */}
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

                const imagenSrc =
                  categoriaActiva === "apariencia" ? `/images/apariencia${item.id}.png` :
                  categoriaActiva === "atuendo" ? `/images/atuendo${item.id}.png` :
                  categoriaActiva === "accesorio" ? `/images/accesorio${item.id}.png` :
                  `/images/herramienta${item.id}.png`;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={clases}
                    onClick={() => handleSeleccion(item)}
                  >
                    <div className="personaje-avatar-inner">
                      <img
                        src={imagenSrc}
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
