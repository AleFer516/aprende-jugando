import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import api from "../services/api";
import "../styles/login.css";

const RestablecerContrasena = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar que existe el token en la URL
    if (!token) {
      setError("Token inválido. Por favor solicita un nuevo enlace de recuperación.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    // Validaciones
    if (!password.trim() || !confirmPassword.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Validar seguridad de contraseña
    const passwordSeguraRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}\[\]:;"'<>,.?/~`|\\]).{8,}$/;
    if (!passwordSeguraRegex.test(password)) {
      setError(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword: password,
      });

      if (response.data.success) {
        setMensaje(response.data.message);
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(response.data.message || "Error al restablecer la contraseña");
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
            <span className="logo-icon">🔐</span>
          </div>
          <h1>Nueva Contraseña</h1>
          <p className="subtitle">
            Ingresa tu nueva contraseña para restablecer tu acceso
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div
              className={`input-container ${
                passwordFocused || password ? "focused" : ""
              }`}
            >
              <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z"
                  fill="currentColor"
                />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
              />
              <label className={passwordFocused || password ? "active" : ""}>
                Nueva Contraseña
              </label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeSlashIcon className="eye-icon" />
                ) : (
                  <EyeIcon className="eye-icon" />
                )}
              </button>
            </div>
            <p className="password-hint">
              Mínimo 8 caracteres, una mayúscula, un número y un símbolo
            </p>
          </div>

          <div className="form-group">
            <div
              className={`input-container ${
                confirmPasswordFocused || confirmPassword ? "focused" : ""
              }`}
            >
              <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z"
                  fill="currentColor"
                />
              </svg>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
                required
              />
              <label
                className={
                  confirmPasswordFocused || confirmPassword ? "active" : ""
                }
              >
                Confirmar Contraseña
              </label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="eye-icon" />
                ) : (
                  <EyeIcon className="eye-icon" />
                )}
              </button>
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
              <p style={{ marginTop: "10px", fontSize: "14px" }}>
                Redirigiendo al inicio de sesión...
              </p>
            </div>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              "Restablecer Contraseña"
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

export default RestablecerContrasena;
