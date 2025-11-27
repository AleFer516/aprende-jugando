// src/pages/Contacto.jsx
// Página de contacto de Luminia.
// Formulario para que los usuarios puedan enviar consultas y comentarios.

import { useState } from "react";
import Header from "../components/Header";
import "../styles/contacto.css";

function Contacto() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [asunto, setAsunto] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState("success");
  const [nombreFocused, setNombreFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [asuntoFocused, setAsuntoFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    
    if (!nombre || !email || !asunto) {
      setTipoMensaje("error");
      setMensaje("Por favor completa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      // Simulación de envío
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setTipoMensaje("success");
      setMensaje("¡Mensaje enviado con éxito! Te responderemos pronto.");
      setNombre("");
      setEmail("");
      setAsunto("");
    } catch (error) {
      console.error(error);
      setTipoMensaje("error");
      setMensaje("Error al enviar el mensaje. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="contacto-page text-white flex flex-col overflow-hidden"
      style={{
        fontFamily:
          '"Inter", "Roboto", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Fondo general con imagen */}
      <div
        className="flex-1 flex flex-col"
        style={{
          backgroundImage: 'url("/images/fondo_nosotros.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Header reutilizable */}
        <Header />

        {/* Contenido principal */}
        <main
          className="
            relative
            flex-1
            w-full
            px-4 lg:px-10 xl:px-16
            flex
            items-center
            justify-center
          "
        >
          {/* Capa oscura de fondo */}
          <div className="bg-overlay"></div>

          {/* Contenedor del contenido */}
          <section
            className="
              contacto-contenido
              relative
              grid grid-cols-1 lg:grid-cols-2
              gap-8 xl:gap-12
              items-center
              w-full
              max-w-7xl
              mx-auto
            "
          >
            {/* Columna izquierda: Formulario */}
            <div className="animate-contacto-form lg:pr-0">
              <h1
                className="
                  text-5xl md:text-6xl lg:text-7xl xl:text-6xl
                  font-extrabold
                  mb-6
                  title-interactive
                  cursor-default
                "
                style={{
                  fontFamily: '"Poppins", "Montserrat", sans-serif',
                  fontWeight: 800,
                }}
              >
                Contacto
              </h1>

              <p className="text-lg md:text-xl leading-relaxed mb-8 description-interactive cursor-default">
                Si tienes alguna pregunta, comentario o sugerencia, no dudes
                en ponerte en contacto con nosotros. Estamos aquí para
                ayudarte en tu viaje de aprendizaje
              </p>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-200">
                    Nombre
                  </label>
                  <div
                    className={`border rounded-lg px-3.5 py-2 transition-all duration-300 ${
                      nombreFocused
                        ? "border-[#3b82f6] bg-blue-50 shadow-md scale-[1.02] input-glow-focus"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <input
                      type="text"
                      className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                      placeholder="Nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      onFocus={() => setNombreFocused(true)}
                      onBlur={() => setNombreFocused(false)}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-200">
                    Correo electrónico
                  </label>
                  <div
                    className={`border rounded-lg px-3.5 py-2 transition-all duration-300 ${
                      emailFocused
                        ? "border-[#3b82f6] bg-blue-50 shadow-md scale-[1.02] input-glow-focus"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <input
                      type="email"
                      className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                      placeholder="Correo electrónico"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                    />
                  </div>
                </div>

                {/* Asunto */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-200">
                    Asunto
                  </label>
                  <div
                    className={`border rounded-lg px-3.5 py-2 transition-all duration-300 ${
                      asuntoFocused
                        ? "border-[#3b82f6] bg-blue-50 shadow-md scale-[1.02] input-glow-focus"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <textarea
                      className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400 resize-vertical min-h-[120px]"
                      placeholder="Asunto"
                      value={asunto}
                      onChange={(e) => setAsunto(e.target.value)}
                      onFocus={() => setAsuntoFocused(true)}
                      onBlur={() => setAsuntoFocused(false)}
                      rows="5"
                    />
                  </div>
                </div>

                {/* Mensaje de error/éxito */}
                {mensaje && (
                  <div
                    className={`text-sm rounded-lg px-3 py-2 animate-slide-down ${
                      tipoMensaje === "error"
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {mensaje}
                  </div>
                )}

                {/* Botón Enviar */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2.5 py-2.5 rounded-lg shadow-md text-white disabled:opacity-70 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 btn-shimmer"
                  style={{
                    backgroundColor: "#3b82f6",
                    fontFamily: '"Poppins", "Montserrat", sans-serif',
                    fontWeight: 600,
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    "Enviar"
                  )}
                </button>
              </form>
            </div>

            {/* Columna derecha: Imagen del sobre */}
            <div className="flex justify-center lg:justify-end animate-contacto-image">
              <img
                src="/images/sobre_contacto.png"
                alt="Contacto"
                className="
                  w-full
                  max-w-md
                  md:max-w-lg
                  lg:max-w-5xl
                  xl:max-w-2xl
                  object-contain
                  drop-shadow-xl
                  image-interactive
                  cursor-pointer
                "
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Contacto;