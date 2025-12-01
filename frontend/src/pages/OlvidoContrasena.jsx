import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/login.css";

const OlvidoContrasena = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    // Validación básica
    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|cl)$/i;
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un correo válido (.com o .cl)");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", { email });

      if (response.data.success) {
        setMensaje(response.data.message);
        setEmail(""); // Limpiar el campo
      } else {
        setError(response.data.message || "Error al enviar el correo");
      }
    } catch (err) {
      console.error("Error en solicitud:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al procesar la solicitud. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="logo-circle">
            <span className="logo-icon">🎮</span>
          </div>
          <h1>Recuperar Contraseña</h1>
          <p className="subtitle">
            Ingresa tu correo electrónico y te enviaremos instrucciones para
            restablecer tu contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className={`input-container ${emailFocused || email ? "focused" : ""}`}>
              <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                required
              />
              <label className={emailFocused || email ? "active" : ""}>
                Correo Electrónico
              </label>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {mensaje && (
            <div className="success-message">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>{mensaje}</span>
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              "Enviar Instrucciones"
            )}
          </button>

          <div className="register-section">
            <p>
              ¿Recordaste tu contraseña?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="link-button"
              >
                Volver al inicio de sesión
              </button>
            </p>
          </div>
        </form>
      </div>

      <div className="background-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </div>
  );
};

export default OlvidoContrasena;
