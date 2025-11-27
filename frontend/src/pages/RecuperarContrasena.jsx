// src/pages/RecuperarContrasena.jsx
// Pantalla para recuperar contraseña en Luminia.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../styles/registro.css";               // estilos compartidos (animaciones)
import "../styles/recuperarContrasena.css";   // estilos específicos
import OwlLogin from "../components/OwlLogin"; // <-- Importamos el búho animado

function RecuperarContrasena() {
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState("success");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);

    if (!email) {
      setTipoMensaje("error");
      setMensaje("Por favor ingrese su correo electrónico.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|cl)$/i;
    if (!emailRegex.test(email)) {
      setTipoMensaje("error");
      setMensaje("El correo debe terminar en .com o .cl");
      return;
    }

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setTipoMensaje("success");
      setMensaje(
        "Si el correo existe, enviaremos instrucciones para restablecer su contraseña."
      );
    } catch (error) {
      setTipoMensaje("error");
      setMensaje("Ocurrió un error. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recuperar-page min-h-screen text-white flex flex-col">
      
      {/* Fondo general */}
      <div className="recuperar-bg flex-1 flex flex-col">
        
        {/* Header */}
        <Header />

        {/* Contenido central */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Tarjeta */}
          <section className="recuperar-card w-full max-w-md bg-white rounded-[28px] shadow-2xl px-8 py-8 text-slate-900 my-auto animate-fade-in">

            {/* Búho animado */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center owl-animate cursor-pointer">
                <OwlLogin />
              </div>
            </div>

            {/* Título */}
            <h1 className="recuperar-title text-2xl text-center mb-2">
              Recuperar contraseña
            </h1>

            <p className="text-center text-sm text-slate-600 mb-6">
              Introduzca su dirección de correo electrónico para restablecer su contraseña
            </p>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Campo correo */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Correo electrónico
                </label>

                <div
                  className={`border rounded-lg px-3.5 py-2 transition-all duration-300 ${
                    emailFocused
                      ? "border-[#228BE6] bg-blue-50 shadow-md scale-[1.02] input-glow-focus"
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

              {/* Mensaje */}
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

              {/* Botón enviar */}
              <button
                type="submit"
                disabled={loading}
                className="btn-recuperar-primary w-full mt-3 py-2.5 rounded-lg shadow-md text-white disabled:opacity-70 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
              >
                {loading ? "Enviando..." : "Enviar"}
              </button>

              {/* Botón volver */}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-recuperar-secondary w-full py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 hover:shadow-md active:scale-95 transition-all duration-300"
              >
                Volver
              </button>

              {/* Link inferior */}
              <p className="text-xs text-center text-slate-600 mt-3">
                ¿Recuerda su contraseña?{" "}
                <Link
                  to="/login"
                  className="recuperar-link inline-block"
                >
                  Inicia sesión
                </Link>
              </p>
            </form>

          </section>
        </main>
      </div>
    </div>
  );
}

export default RecuperarContrasena;
