import { useState } from "react";
import Header from "../components/Header";
import "../styles/login.css";
import OwlLogin from "../components/OwlLogin"
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState("success");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [rol, setRol] = useState("admin"); // Temporal: admin o gm

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    

    e.preventDefault();
    setMensaje(null);

    if (!email || !password) {
      setTipoMensaje("error");
      setMensaje("Por favor completa tu correo y contraseña.");
      return;
    }

    try {
      setLoading(true);
      // Simulación de login (por ahora)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setTipoMensaje("success");
      setMensaje("Inicio de sesión exitoso. ¡Bienvenido/a!");
      setPassword("");

      // Temporal: navegar según el rol seleccionado
      if (rol === "gm") {
        navigate("/gm/inicio");
      } else {
        navigate("/admin/dashboard");
      }

    } catch (error) {
      console.error(error);
      setTipoMensaje("error");
      setMensaje("Error de conexión con el servidor.");
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
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 10px rgba(255,255,255,0.3); }
          50% { text-shadow: 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(34,139,230,0.3); }
        }
        
        .owl-animate:hover {
          animation: float 0.6s ease-in-out;
        }
        
        .btn-shimmer {
          position: relative;
          overflow: hidden;
        }
        .btn-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        .btn-shimmer:hover::before {
          left: 100%;
        }
        
        .text-animate {
          animation: text-glow 3s ease-in-out infinite;
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
        
        .input-glow-focus {
          animation: pulse-glow 2s ease-in-out infinite;
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
        <main className="
        flex-1 flex w-full
        px-10 lg:px-0 xl:px-28
        items-center
        justify-start
        gap-12 xl:gap-10
        min-h-0
        lg:ml-[50px]
        ">

          {/* Lado izquierdo: tarjeta de login */}
          <section className="w-[420px] lg:w-[460px] xl:w-[400px] bg-white rounded-[28px] shadow-2xl px-10 py-10 text-slate-900 flex-shrink-0 my-auto">
            {/* Icono usuario */}
            <div className="flex justify-center mb-5">
                <div className="flex items-center justify-center owl-animate cursor-pointer">
                <OwlLogin />
                </div>

            </div>

            <h1
              className="text-2xl text-center mb-5 animate-fade-in"
              style={{
                fontFamily: '"Poppins", "Montserrat", sans-serif',
                fontWeight: 700,
              }}
            >
              Inicia sesión
            </h1>

            <div className="space-y-3.5">
              {/* Correo */}
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
                    className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Contraseña
                </label>
                <div
                  className={`border rounded-lg px-3.5 py-2 transition-all duration-300 ${
                    passwordFocused
                      ? "border-[#228BE6] bg-blue-50 shadow-md scale-[1.02] input-glow-focus"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <input
                    type="password"
                    className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                </div>
              </div>

              {/* Selector de rol (temporal) */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Rol (Temporal - Solo para desarrollo)
                </label>
                <div className="border border-slate-200 rounded-lg px-3.5 py-2 bg-slate-50">
                  <select
                    className="w-full bg-transparent outline-none text-sm text-slate-800"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                  >
                    <option value="admin">Administrador</option>
                    <option value="gm">Game Master (Profesor)</option>
                  </select>
                </div>
              </div>

              {/* Recordar / Olvidaste */}
              <div className="flex justify-between items-center text-xs mt-1">
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-slate-900 transition-colors group">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className="group-hover:scale-105 inline-block transition-transform">Recordar</span>
                </label>
                <Link
                  to="/recuperar-contraseña"
                  className="text-[#228BE6] hover:text-[#4E84C1] font-medium hover:scale-105 transition-all link-underline"
                  style={{
                    fontFamily: '"Poppins", "Montserrat", sans-serif',
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Mensaje de error / éxito */}
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

              {/* Botón Ingresar */}
              <button
                type="button"
                onClick={handleSubmit}
                
                disabled={loading}
                className="w-full mt-2.5 py-2.5 rounded-lg shadow-md text-white disabled:opacity-70 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 btn-shimmer"
                style={{
                  backgroundColor: "#228BE6",
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
                    Ingresando...
                  </span>
                ) : (
                  "Ingresar"
                )}
              </button>

              {/* Registrarse */}
              <p className="text-xs text-center text-slate-600 mt-2.5">
                ¿No tienes cuenta?{" "}
              <Link
                to="/registro"
                className="text-[#228BE6] hover:text-[#4E84C1] font-semibold hover:scale-105 inline-block transition-all link-underline"
                style={{
                  fontFamily: '"Poppins", "Montserrat", sans-serif',
                }}
              >
                Registrarse aquí
              </Link>
              </p>

              {/* Legal */}
              <div className="mt-4 text-[11px] text-slate-500 flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="hover:text-slate-700 hover:scale-105 transition-all link-underline"
                >
                  Política de Privacidad
                </button>
                <span>|</span>
                <button
                  type="button"
                  className="hover:text-slate-700 hover:scale-105 transition-all link-underline"
                >
                  Términos de Uso
                </button>
              </div>
            </div>
          </section>

        {/* Línea degradé (separador) */}
        <div className="hidden lg:flex justify-center flex-shrink-0">
        <div className="separator-line" />
        </div>


        {/* Lado derecho: texto ¡Bienvenido! */}
        <section className="flex-1 flex items-center justify-center pb-50 min-w-0">
        <div
            className="
            max-w-md           /* bloque angosto → más líneas de texto */
            text-center        /* como en la maqueta vertical */
            lg:ml-[450px]    /* también centrado en escritorio */
            animate-fade-in-right 
            "
        >
            <h2
            className="text-5xl lg:text-6xl xl:text-7xl mb-6 font-extrabold text-animate"
            style={{
                fontFamily: '"Poppins", "Montserrat", sans-serif',
                fontWeight: 800,
                animation: 'float 4s ease-in-out infinite',
            }}
            >
            ¡Bienvenido!
            </h2>

            <p className="text-base lg:text-lg leading-relaxed text-slate-100 hover:text-white hover:scale-105 transition-all duration-500 cursor-default">
            En un mundo donde la luz del conocimiento guía cada paso, los estudiantes
            se convierten en exploradores del saber. Aquí, cada desafío es una
            oportunidad para aprender, cada misión es un camino hacia el
            descubrimiento, y cada logro ilumina tu progreso personal.
            </p>
        </div>
        </section>


        </main>
      </div>
    </div>
  );
}

export default Login;