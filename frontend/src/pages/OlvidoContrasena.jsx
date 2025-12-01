import { useState } from "react";
import Header from "../components/Header";
import "../styles/login.css";
import OwlLogin from "../components/OwlLogin";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function OlvidoContrasena() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState("success");
  const [emailFocused, setEmailFocused] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);

    if (!email) {
      setTipoMensaje("error");
      setMensaje("Por favor ingresa tu correo electrónico.");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|cl)$/i;
    if (!emailRegex.test(email)) {
      setTipoMensaje("error");
      setMensaje("El correo debe terminar en .com o .cl");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/forgot-password", { email });

      if (response.data.success) {
        setTipoMensaje("success");
        setMensaje(response.data.message);
        setEmail(""); // Limpiar el campo
      } else {
        setTipoMensaje("error");
        setMensaje(response.data.message || "Error al enviar el correo");
      }
    } catch (error) {
      console.error("Error en solicitud:", error);
      setTipoMensaje("error");

      if (error.response?.data?.message) {
        setMensaje(error.response.data.message);
      } else if (error.message === "Network Error") {
        setMensaje(
          "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose."
        );
      } else {
        setMensaje("Error de conexión con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen text-white flex flex-col overflow-hidden"
      style={{
        fontFamily:
          '"Inter", "Roboto", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 139, 230, 0.3); }
          50% { box-shadow: 0 0 30px rgba(34, 139, 230, 0.6); }
        }

        .owl-animate:hover {
          animation: float 0.6s ease-in-out;
        }

        .input-glow-focus {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .link-underline {
          position: relative;
        }
        .link-underline::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background-color: currentColor;
          transition: width 0.3s ease;
        }
        .link-underline:hover::after {
          width: 100%;
        }
      `}</style>

      {/* Fondo general con la ilustración */}
      <div
        className="flex-1 flex flex-col"
        style={{
          backgroundImage: 'url("/images/fondo_login.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Header reutilizable */}
        <Header />

        {/* Contenido principal */}
        <main
          className="
            flex-1 flex w-full
            px-10 lg:px-0 xl:px-28
            items-center
            justify-start
            gap-12 xl:gap-10
            min-h-0
            lg:ml-[50px]
          "
        >
          {/* Lado izquierdo: tarjeta de recuperación */}
          <section className="w-[420px] lg:w-[460px] xl:w-[400px] bg-white rounded-[28px] shadow-2xl px-10 py-10 text-slate-900 flex-shrink-0 my-auto">
            {/* Icono búho */}
            <div className="flex justify-center mb-5">
              <div className="flex items-center justify-center owl-animate cursor-pointer">
                <OwlLogin />
              </div>
            </div>

            <h1
              className="text-2xl text-center mb-2 animate-fade-in"
              style={{
                fontFamily: '"Poppins", "Montserrat", sans-serif',
                fontWeight: 700,
              }}
            >
              Recuperar Contraseña
            </h1>

            <p
              className="text-center text-sm text-slate-600 mb-6"
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              Ingresa tu correo electrónico y te enviaremos instrucciones para
              restablecer tu contraseña
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo de Correo Electrónico */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className="w-full bg-transparent focus:outline-none text-slate-900"
                    style={{ fontFamily: '"Inter", sans-serif' }}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Mensaje de error/éxito */}
              {mensaje && (
                <div
                  className={`p-3 rounded-lg text-sm animate-slide-down ${
                    tipoMensaje === "success"
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                  style={{ fontFamily: '"Inter", sans-serif' }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">
                      {tipoMensaje === "success" ? "✅" : "❌"}
                    </span>
                    <span>{mensaje}</span>
                  </div>
                </div>
              )}

              {/* Botón de Enviar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, #228BE6 0%, #1c7ed6 50%, #1864ab 100%)",
                  boxShadow: loading
                    ? "none"
                    : "0 4px 15px rgba(34,139,230,0.4)",
                  fontFamily: '"Poppins", "Montserrat", sans-serif',
                }}
              >
                {loading ? "Enviando..." : "Enviar Instrucciones"}
              </button>

              {/* Botón de Volver */}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full py-3 rounded-lg font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  fontFamily: '"Poppins", "Montserrat", sans-serif',
                }}
              >
                Volver al inicio de sesión
              </button>
            </form>
          </section>

          {/* Lado derecho: texto de bienvenida (opcional) */}
          <aside className="hidden lg:flex flex-col justify-center text-white flex-1 max-w-md">
            <h2
              className="text-4xl xl:text-5xl font-bold mb-4 animate-fade-in"
              style={{
                fontFamily: '"Poppins", "Montserrat", sans-serif',
                textShadow: "0 2px 10px rgba(0,0,0,0.3)",
              }}
            >
              ¿Olvidaste tu contraseña?
            </h2>
            <p
              className="text-lg xl:text-xl text-slate-200 animate-fade-in-right"
              style={{
                fontFamily: '"Inter", sans-serif',
                textShadow: "0 1px 5px rgba(0,0,0,0.2)",
              }}
            >
              No te preocupes, te enviaremos un correo con las instrucciones
              para restablecer tu contraseña de forma segura.
            </p>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default OlvidoContrasena;
