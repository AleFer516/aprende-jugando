// src/pages/Registro.jsx
// Página de registro de Luminia.
// Formulario para crear una nueva cuenta de estudiante.

import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import OwlLogin from "../components/OwlLogin";
import authService from "../services/authService";
import "../styles/registro.css";

function Registro() {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [año, setAño] = useState("");
  const [mes, setMes] = useState("");
  const [dia, setDia] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState("success");
  const [cuentaCreada, setCuentaCreada] = useState(false);

  // Estados de focus para cada input
  const [nombreFocused, setNombreFocused] = useState(false);
  const [rutFocused, setRutFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [institucionFocused, setInstitucionFocused] = useState(false);
  const [añoFocused, setAñoFocused] = useState(false);
  const [mesFocused, setMesFocused] = useState(false);
  const [diaFocused, setDiaFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setCuentaCreada(false); // por si reintenta

    // Validar campos vacíos
    if (
      !nombreCompleto ||
      !rut ||
      !email ||
      !institucion ||
      !año ||
      !mes ||
      !dia ||
      !password ||
      !confirmPassword
    ) {
      setTipoMensaje("error");
      setMensaje("Por favor completa todos los campos.");
      return;
    }

    // Validar formato de RUT
    const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
    if (!rutRegex.test(rut)) {
      setTipoMensaje("error");
      setMensaje("Formato de RUT inválido. Debe ser: XX.XXX.XXX-X");
      return;
    }

    // Validar formato de email (.com o .cl)
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|cl)$/i;
    if (!emailRegex.test(email)) {
      setTipoMensaje("error");
      setMensaje("El correo debe terminar en .com o .cl");
      return;
    }

    // Validar que año, mes y día sean números
    const añoNum = parseInt(año);
    const mesNum = parseInt(mes);
    const diaNum = parseInt(dia);

    if (isNaN(añoNum) || isNaN(mesNum) || isNaN(diaNum)) {
      setTipoMensaje("error");
      setMensaje("La fecha de nacimiento debe contener solo números.");
      return;
    }

    // Validar rangos de fecha
    const añoActual = new Date().getFullYear();
    if (añoNum < 1900 || añoNum > añoActual) {
      setTipoMensaje("error");
      setMensaje(`El año debe estar entre 1900 y ${añoActual}.`);
      return;
    }

    if (mesNum < 1 || mesNum > 12) {
      setTipoMensaje("error");
      setMensaje("El mes debe estar entre 1 y 12.");
      return;
    }

    if (diaNum < 1 || diaNum > 31) {
      setTipoMensaje("error");
      setMensaje("El día debe estar entre 1 y 31.");
      return;
    }

    // Validar fecha válida (ej: no 31 de febrero)
    const fecha = new Date(añoNum, mesNum - 1, diaNum);
    if (fecha.getMonth() !== mesNum - 1 || fecha.getDate() !== diaNum) {
      setTipoMensaje("error");
      setMensaje("La fecha ingresada no es válida.");
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setTipoMensaje("error");
      setMensaje("Las contraseñas no coinciden.");
      return;
    }

    // Validar seguridad de la contraseña
    // - mínimo 8 caracteres
    // - al menos 1 mayúscula
    // - al menos 1 número
    // - al menos 1 símbolo
    const passwordSeguraRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}\[\]:;"'<>,.?/~`|\\]).{8,}$/;

    if (!passwordSeguraRegex.test(password)) {
      setTipoMensaje("error");
      setMensaje(
        "La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, un número y un símbolo."
      );
      return;
    }

    try {
      setLoading(true);

      // Formatear fecha de nacimiento
      const fechaNacimiento = `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;

      // Llamar a la API de registro
      const response = await authService.register({
        nombre: nombreCompleto,
        rut,
        email,
        password,
        institucion,
        fechaNacimiento
      });

      if (response.success) {
        setTipoMensaje("success");
        setMensaje(response.message);
        setCuentaCreada(true);

        // Limpiar campos
        setTimeout(() => {
          setNombreCompleto("");
          setRut("");
          setEmail("");
          setInstitucion("");
          setAño("");
          setMes("");
          setDia("");
          setPassword("");
          setConfirmPassword("");
        }, 2000);
      } else {
        setTipoMensaje("error");
        setMensaje(response.message || "Error al crear la cuenta.");
      }
    } catch (error) {
      console.error(error);
      setTipoMensaje("error");
      setMensaje(error.response?.data?.message || "Error al crear la cuenta. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen text-white flex flex-col"
      style={{
        fontFamily:
          '"Inter", "Roboto", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
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
            items-center
            justify-center
            px-4 sm:px-6 lg:px-8
            py-8
          "
        >
          {/* Tarjeta de registro centrada */}
          <section className="w-full max-w-md bg-white rounded-[28px] shadow-2xl px-8 py-8 text-slate-900 my-auto animate-fade-in">
            {/* Icono búho */}
            <div className="flex justify-center mb-5">
              <div className="flex items-center justify-center owl-animate cursor-pointer">
                <OwlLogin />
              </div>
            </div>

            <h1
              className="text-2xl text-center mb-6"
              style={{
                fontFamily: '"Poppins", "Montserrat", sans-serif',
                fontWeight: 700,
              }}
            >
              Registrarse
            </h1>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Nombre completo */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  Nombre completo
                </label>
                <div
                  className={`border rounded-lg px-3.5 py-2 transition-all duration-300 ${
                    nombreFocused
                      ? "border-[#228BE6] bg-blue-50 shadow-md scale-[1.02] input-glow-focus"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <input
                    type="text"
                    className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                    placeholder="Nombre completo"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    onFocus={() => setNombreFocused(true)}
                    onBlur={() => setNombreFocused(false)}
                  />
                </div>
              </div>

              {/* RUT */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  RUT
                </label>
                <div
                  className={`border rounded-lg px-3.5 py-2 transition-all duration-300 ${
                    rutFocused
                      ? "border-[#228BE6] bg-blue-50 shadow-md scale-[1.02] input-glow-focus"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <input
                    type="text"
                    className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                    placeholder="12.345.678-9"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    onFocus={() => setRutFocused(true)}
                    onBlur={() => setRutFocused(false)}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Formato: XX.XXX.XXX-X
                </p>
              </div>

              {/* Correo electrónico */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
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

              {/* Institución */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01-.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Institución
                </label>
                <div
                  className={`border rounded-lg px-3.5 py-2 transition-all duration-300 ${
                    institucionFocused
                      ? "border-[#228BE6] bg-blue-50 shadow-md scale-[1.02] input-glow-focus"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <input
                    type="text"
                    className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                    placeholder="Institución"
                    value={institucion}
                    onChange={(e) => setInstitucion(e.target.value)}
                    onFocus={() => setInstitucionFocused(true)}
                    onBlur={() => setInstitucionFocused(false)}
                  />
                </div>
              </div>

              {/* Fecha de nacimiento */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Fecha de nacimiento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    className={`border rounded-lg px-3 py-2 transition-all duration-300 ${
                      añoFocused
                        ? "border-[#228BE6] bg-blue-50 shadow-md scale-[1.02] input-glow-focus"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <input
                      type="number"
                      className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400 text-center"
                      placeholder="Año"
                      value={año}
                      onChange={(e) => setAño(e.target.value)}
                      onFocus={() => setAñoFocused(true)}
                      onBlur={() => setAñoFocused(false)}
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div
                    className={`border rounded-lg px-3 py-2 transition-all duration-300 ${
                      mesFocused
                        ? "border-[#228BE6] bg-blue-50 shadow-md scale-[1.02] input-glow-focus"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <input
                      type="number"
                      className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400 text-center"
                      placeholder="Mes"
                      value={mes}
                      onChange={(e) => setMes(e.target.value)}
                      onFocus={() => setMesFocused(true)}
                      onBlur={() => setMesFocused(false)}
                      min="1"
                      max="12"
                    />
                  </div>
                  <div
                    className={`border rounded-lg px-3 py-2 transition-all duration-300 ${
                      diaFocused
                        ? "border-[#228BE6] bg-blue-50 shadow-md scale-[1.02] input-glow-focus"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <input
                      type="number"
                      className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400 text-center"
                      placeholder="Día"
                      value={dia}
                      onChange={(e) => setDia(e.target.value)}
                      onFocus={() => setDiaFocused(true)}
                      onBlur={() => setDiaFocused(false)}
                      min="1"
                      max="31"
                    />
                  </div>
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Mínimo 8 caracteres, con al menos una mayúscula, un número y un símbolo.
                </p>
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Confirmar contraseña
                </label>
                <div
                  className={`border rounded-lg px-3.5 py-2 transition-all duration-300 flex items-center gap-2 ${
                    confirmPasswordFocused
                      ? "border-[#228BE6] bg-blue-50 shadow-md scale-[1.02] input-glow-focus"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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

              {/* Botón Crear cuenta (se oculta si cuentaCreada es true) */}
              {!cuentaCreada && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-2.5 rounded-lg shadow-md text-white disabled:opacity-70 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 btn-shimmer"
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
                      Creando cuenta...
                    </span>
                  ) : (
                    "Crear cuenta"
                  )}
                </button>
              )}

              {/* Ya tiene cuenta */}
              <p className="text-xs text-center text-slate-600 mt-3">
                ¿Ya tiene cuenta?{" "}
                <Link
                  to="/login"
                  className="text-[#228BE6] hover:text-[#4E84C1] font-semibold hover:scale-105 inline-block transition-all link-underline"
                  style={{
                    fontFamily: '"Poppins", "Montserrat", sans-serif',
                  }}
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

export default Registro;
