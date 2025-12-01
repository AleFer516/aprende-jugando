// src/pages/Login.jsx
import { useState, useEffect } from "react";
import Header from "../components/Header";
import "../styles/login.css";
import OwlLogin from "../components/OwlLogin";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState("success");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const navigate = useNavigate();

  // Cargar email recordado al montar el componente
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    }
  }, []);

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

      // Llamada real al backend
      const response = await authService.login(email, password);

      if (response.success) {
        // Guardar o eliminar email recordado según checkbox
        if (remember) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        setTipoMensaje("success");
        setMensaje(`¡Bienvenido/a ${response.usuario.nombre}!`);
        setPassword("");

        // Navegar según el rol del usuario
        setTimeout(() => {
          if (response.usuario.rol === "gm") {
            navigate("/gm/inicio");
          } else if (response.usuario.rol === "estudiante") {
            navigate("/estudiante/inicio");
          } else if (response.usuario.rol === "admin") {
            navigate("/admin/dashboard");
          }
        }, 800);
      } else {
        setTipoMensaje("error");
        setMensaje(response.message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setTipoMensaje("error");

      if (error.response?.data?.message) {
        setMensaje(error.response.data.message);
      } else if (error.message === "Network Error") {
        setMensaje("No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.");
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
                  className={`border rounded-lg px-3.5 py-2 transition-all duration-300 flex items-center gap-2 ${
                    passwordFocused
                      ? "border-[#228BE6] bg-blue-50 shadow-md scale-[1.02] input-glow-focus"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
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
                  <span className="group-hover:scale-105 inline-block transition-transform">
                    Recordar
                  </span>
                </label>
                <Link
                  to="/olvido-contrasena"
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
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:text-slate-700 hover:scale-105 transition-all link-underline"
                >
                  Política de Privacidad
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
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
                max-w-md
                text-center
                lg:ml-[450px]
                animate-fade-in-right 
              "
            >
              <h2
                className="text-5xl lg:text-6xl xl:text-7xl mb-6 font-extrabold text-animate"
                style={{
                  fontFamily: '"Poppins", "Montserrat", sans-serif',
                  fontWeight: 800,
                  animation: "float 4s ease-in-out infinite",
                }}
              >
                ¡Bienvenido!
              </h2>

              <p className="text-base lg:text-lg leading-relaxed text-slate-100 hover:text-white hover:scale-105 transition-all duration-500 cursor-default">
                En un mundo donde la luz del conocimiento guía cada paso, los
                estudiantes se convierten en exploradores del saber. Aquí, cada
                desafío es una oportunidad para aprender, cada misión es un
                camino hacia el descubrimiento, y cada logro ilumina tu progreso
                personal.
              </p>
            </div>
          </section>
        </main>
      </div>

      {/* Modal de Política de Privacidad */}
      {showPrivacyModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: '"Poppins", "Montserrat", sans-serif' }}>
                Política de Privacidad
              </h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-slate-700 space-y-4 text-sm leading-relaxed">
              <p className="text-slate-500 italic">Última actualización: {new Date().toLocaleDateString('es-CL')}</p>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">1. Información que Recopilamos</h3>
                <p>
                  En <strong>Aprende Jugando</strong>, recopilamos la siguiente información personal cuando te registras:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Nombre completo</li>
                  <li>RUT (Rol Único Tributario)</li>
                  <li>Correo electrónico</li>
                  <li>Institución educativa</li>
                  <li>Fecha de nacimiento</li>
                  <li>Contraseña encriptada</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">2. Uso de la Información</h3>
                <p>Utilizamos tu información personal para:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Crear y gestionar tu cuenta de usuario</li>
                  <li>Proporcionar acceso a contenidos educativos gamificados</li>
                  <li>Realizar seguimiento de tu progreso académico</li>
                  <li>Enviar notificaciones sobre misiones y logros</li>
                  <li>Mejorar la experiencia de aprendizaje</li>
                  <li>Comunicarnos contigo sobre actualizaciones del sistema</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">3. Protección de Datos</h3>
                <p>
                  Nos comprometemos a proteger tu información personal mediante:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Encriptación de contraseñas con algoritmo bcrypt</li>
                  <li>Uso de conexiones seguras (HTTPS)</li>
                  <li>Acceso restringido solo a personal autorizado</li>
                  <li>Cumplimiento de la Ley N° 19.628 sobre Protección de Datos de Carácter Personal de Chile</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">4. Compartir Información</h3>
                <p>
                  No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Cuando sea requerido por ley o autoridad competente</li>
                  <li>Con tu institución educativa (solo información académica relevante)</li>
                  <li>Para proteger los derechos y seguridad de nuestros usuarios</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">5. Tus Derechos</h3>
                <p>Tienes derecho a:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Acceder a tu información personal almacenada</li>
                  <li>Solicitar corrección de datos incorrectos</li>
                  <li>Solicitar eliminación de tu cuenta y datos asociados</li>
                  <li>Retirar tu consentimiento en cualquier momento</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">6. Cookies y Tecnologías Similares</h3>
                <p>
                  Utilizamos cookies y almacenamiento local del navegador para mantener tu sesión activa
                  y mejorar tu experiencia de usuario. Puedes desactivar las cookies en tu navegador,
                  pero esto puede afectar la funcionalidad de la plataforma.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">7. Contacto</h3>
                <p>
                  Si tienes preguntas sobre esta política de privacidad o deseas ejercer tus derechos,
                  contáctanos a través de tu institución educativa o los canales de soporte de la plataforma.
                </p>
              </section>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-6 py-2 bg-[#228BE6] text-white rounded-lg hover:bg-[#1c6fb8] transition-colors font-semibold"
                style={{ fontFamily: '"Poppins", "Montserrat", sans-serif' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Términos de Uso */}
      {showTermsModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: '"Poppins", "Montserrat", sans-serif' }}>
                Términos de Uso
              </h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-slate-700 space-y-4 text-sm leading-relaxed">
              <p className="text-slate-500 italic">Última actualización: {new Date().toLocaleDateString('es-CL')}</p>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">1. Aceptación de Términos</h3>
                <p>
                  Al acceder y utilizar <strong>Aprende Jugando</strong>, aceptas cumplir con estos Términos de Uso.
                  Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar la plataforma.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">2. Descripción del Servicio</h3>
                <p>
                  Aprende Jugando es una plataforma educativa gamificada que proporciona:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Sistema de misiones y desafíos educativos</li>
                  <li>Seguimiento de progreso académico</li>
                  <li>Sistema de niveles, experiencia y logros</li>
                  <li>Herramientas para Game Masters (profesores)</li>
                  <li>Panel de administración del sistema</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">3. Registro y Cuenta de Usuario</h3>
                <p>Para utilizar la plataforma debes:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Proporcionar información verdadera y actualizada</li>
                  <li>Ser mayor de 13 años (menores requieren autorización de tutor)</li>
                  <li>Mantener la confidencialidad de tu contraseña</li>
                  <li>Notificar inmediatamente cualquier uso no autorizado de tu cuenta</li>
                  <li>Usar solo UNA cuenta por estudiante (el RUT es único)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">4. Conducta del Usuario</h3>
                <p>Te comprometes a NO:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Hacer trampa o manipular el sistema de puntos/logros</li>
                  <li>Compartir o vender tu cuenta a otros usuarios</li>
                  <li>Usar lenguaje ofensivo, discriminatorio o inapropiado</li>
                  <li>Interferir con el funcionamiento normal de la plataforma</li>
                  <li>Intentar acceder a cuentas de otros usuarios</li>
                  <li>Copiar o plagiar el trabajo de otros estudiantes</li>
                  <li>Publicar contenido que viole derechos de autor</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">5. Contenido y Propiedad Intelectual</h3>
                <p>
                  Todo el contenido de la plataforma (textos, imágenes, logos, misiones, etc.) es propiedad
                  de Aprende Jugando y está protegido por leyes de propiedad intelectual. No puedes
                  reproducir, distribuir o modificar este contenido sin autorización expresa.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">6. Evaluaciones y Calificaciones</h3>
                <p>
                  Las evaluaciones realizadas en la plataforma son parte de tu proceso educativo.
                  Los resultados pueden ser compartidos con tus profesores e institución educativa.
                  Hacer trampa en evaluaciones puede resultar en:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Suspensión temporal de la cuenta</li>
                  <li>Pérdida de puntos y logros</li>
                  <li>Notificación a tu institución educativa</li>
                  <li>Cancelación permanente de la cuenta en casos graves</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">7. Suspensión y Terminación</h3>
                <p>
                  Nos reservamos el derecho de suspender o cancelar tu cuenta si:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Violas estos Términos de Uso</li>
                  <li>Proporcionas información falsa o fraudulenta</li>
                  <li>Tu conducta perjudica a otros usuarios o al sistema</li>
                  <li>No accedes a la plataforma durante más de 12 meses</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">8. Limitación de Responsabilidad</h3>
                <p>
                  Aprende Jugando se proporciona "tal cual" sin garantías de ningún tipo.
                  No nos hacemos responsables por:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Interrupciones del servicio o errores técnicos</li>
                  <li>Pérdida de datos o progreso (recomendamos respaldos regulares)</li>
                  <li>Decisiones académicas basadas exclusivamente en la plataforma</li>
                  <li>Contenido generado por usuarios (comentarios, respuestas, etc.)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">9. Modificaciones</h3>
                <p>
                  Nos reservamos el derecho de modificar estos términos en cualquier momento.
                  Los cambios significativos serán notificados a través de la plataforma.
                  El uso continuado después de las modificaciones constituye aceptación de los nuevos términos.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">10. Ley Aplicable</h3>
                <p>
                  Estos términos se rigen por las leyes de la República de Chile.
                  Cualquier disputa será sometida a los tribunales competentes de Chile.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">11. Contacto</h3>
                <p>
                  Para consultas sobre estos términos, contáctanos a través de los canales
                  de soporte disponibles en tu institución educativa.
                </p>
              </section>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2 bg-[#228BE6] text-white rounded-lg hover:bg-[#1c6fb8] transition-colors font-semibold"
                style={{ fontFamily: '"Poppins", "Montserrat", sans-serif' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
