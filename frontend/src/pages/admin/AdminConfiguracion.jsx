// src/pages/admin/AdminConfiguracion.jsx
// Página de configuración del panel admin.

import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/adminConfiguracion.css";

function AdminConfiguracion() {
  const { theme, setTheme } = useTheme();

  const [generalConfig, setGeneralConfig] = useState({
    nombreSistema: "Luminia",
    tiempoInactividad: "15",
    zonaHoraria: "GMT-3 Santiago",
  });

  const [rolesActivos, setRolesActivos] = useState({
    estudiante: true,
    gm: true,
    admin: true,
  });

  const [passwordPolicy, setPasswordPolicy] = useState({
    minChars: true,
    mayusculas: true,
    numeros: true,
    simbolos: true,
    expiracion: "90",
  });

  const [authConfig, setAuthConfig] = useState({
    twoFactor: true,
    maxIntentos: "5",
  });

  const [backupConfig, setBackupConfig] = useState({
    respaldoAutomatico: true,
    ultimaEjecucion: "Hace 2 días",
    tamanoActual: "175 MB",
  });

  const [guardandoGeneral, setGuardandoGeneral] = useState(false);
  const [ejecutandoDiagnostico, setEjecutandoDiagnostico] = useState(false);
  const [mensajeToast, setMensajeToast] = useState(null);
  const [tipoToast, setTipoToast] = useState("success");

  // Modal creación de rol
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [nuevoRol, setNuevoRol] = useState({
    nombre: "",
    descripcion: "",
    tipo: "Personalizado",
    permisos: {
      gestionarUsuarios: false,
      gestionarMisiones: true,
      verReportes: true,
    },
  });

  const mostrarToast = (mensaje, tipo = "success") => {
    setMensajeToast(mensaje);
    setTipoToast(tipo);
    setTimeout(() => setMensajeToast(null), 2500);
  };

  const handleChangeGeneral = (campo, valor) => {
    setGeneralConfig((prev) => ({ ...prev, [campo]: valor }));

    // Si el campo es tema, actualizar el contexto de tema
    if (campo === "tema") {
      setTheme(valor);
      mostrarToast(
        `Tema ${valor === "oscuro" ? "oscuro" : "claro"} aplicado correctamente.`
      );
    }
  };

  const toggleRol = (rol) => {
    setRolesActivos((prev) => ({ ...prev, [rol]: !prev[rol] }));
  };

  const togglePasswordPolicy = (campo) => {
    setPasswordPolicy((prev) => ({ ...prev, [campo]: !prev[campo] }));
  };

  const handlePasswordExpChange = (valor) => {
    setPasswordPolicy((prev) => ({ ...prev, expiracion: valor }));
  };

  const handleMaxIntentosChange = (valor) => {
    setAuthConfig((prev) => ({ ...prev, maxIntentos: valor }));
  };

  const toggleTwoFactor = () => {
    setAuthConfig((prev) => ({ ...prev, twoFactor: !prev.twoFactor }));
  };

  const toggleRespAuto = () => {
    setBackupConfig((prev) => ({
      ...prev,
      respaldoAutomatico: !prev.respaldoAutomatico,
    }));
  };

  const handleGuardarGeneral = () => {
    setGuardandoGeneral(true);
    setTimeout(() => {
      setGuardandoGeneral(false);
      mostrarToast("Configuración general guardada correctamente.");
    }, 1200);
  };

  const handleGenerarRespaldo = () => {
    mostrarToast("Generando respaldo de la base de datos...");
    setTimeout(() => {
      setBackupConfig((prev) => ({
        ...prev,
        ultimaEjecucion: "Hace unos segundos",
      }));
      mostrarToast("Respaldo generado correctamente.");
    }, 1200);
  };

  const handleDiagnostico = () => {
    setEjecutandoDiagnostico(true);
    mostrarToast("Ejecutando diagnóstico del sistema...");
    setTimeout(() => {
      setEjecutandoDiagnostico(false);
      mostrarToast(
        "Diagnóstico completado. No se encontraron problemas críticos."
      );
    }, 1600);
  };

  // --- Lógica modal de creación de rol ---

  const abrirModalRol = () => {
    setIsRoleModalOpen(true);
  };

  const cerrarModalRol = () => {
    setIsRoleModalOpen(false);
  };

  const handleChangeNuevoRol = (campo, valor) => {
    setNuevoRol((prev) => ({ ...prev, [campo]: valor }));
  };

  const togglePermisoRol = (permiso) => {
    setNuevoRol((prev) => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [permiso]: !prev.permisos[permiso],
      },
    }));
  };

  const handleCrearRol = (e) => {
    e.preventDefault();

    if (!nuevoRol.nombre.trim()) {
      mostrarToast("El nombre del rol es obligatorio.", "info");
      return;
    }

    // Aquí en un futuro podrías enviar al backend.
    mostrarToast(`Rol "${nuevoRol.nombre}" creado correctamente.`);

    // Reseteamos el formulario y cerramos modal
    setNuevoRol({
      nombre: "",
      descripcion: "",
      tipo: "Personalizado",
      permisos: {
        gestionarUsuarios: false,
        gestionarMisiones: true,
        verReportes: true,
      },
    });
    setIsRoleModalOpen(false);
  };

  return (
    <div className="admin-config">
      <h1 className="admin-config-title">Configuración</h1>

      {/* Fila superior: Configuración general + Roles */}
      <section className="admin-config-grid-top">
        {/* Configuración general */}
        <article className="admin-config-card admin-config-card-large">
          <header className="admin-config-card-header">
            <h2>Configuración General</h2>
          </header>

          <div className="admin-config-card-body">
            <div className="config-form-grid">
              {/* Nombre */}
              <div className="config-field">
                <label className="config-label">Nombre</label>
                <input
                  type="text"
                  className="config-input"
                  value={generalConfig.nombreSistema}
                  onChange={(e) =>
                    handleChangeGeneral("nombreSistema", e.target.value)
                  }
                  placeholder="Nombre del sistema"
                />
              </div>

              {/* Logo (simulado) */}
              <div className="config-field">
                <label className="config-label">Logo</label>
                <div className="config-upload">
                  <button
                    type="button"
                    className="config-btn-outline"
                    onClick={() =>
                      mostrarToast(
                        "Subida de logo aún no implementada.",
                        "info"
                      )
                    }
                  >
                    Subir
                  </button>
                  <span className="config-upload-hint">
                    PNG / SVG · máx. 2 MB
                  </span>
                </div>
              </div>

              {/* Tema */}
              <div className="config-field">
                <label className="config-label">Tema del sistema</label>
                <div className="config-radio-group">
                  <label className="config-radio-option">
                    <input
                      type="radio"
                      name="tema"
                      value="claro"
                      checked={theme === "claro"}
                      onChange={() => handleChangeGeneral("tema", "claro")}
                    />
                    <span className="config-radio-custom" />
                    <span>Claro</span>
                  </label>
                  <label className="config-radio-option">
                    <input
                      type="radio"
                      name="tema"
                      value="oscuro"
                      checked={theme === "oscuro"}
                      onChange={() => handleChangeGeneral("tema", "oscuro")}
                    />
                    <span className="config-radio-custom" />
                    <span>Oscuro</span>
                  </label>
                </div>
              </div>

              {/* Tiempo de inactividad */}
              <div className="config-field">
                <label className="config-label">Tiempo de inactividad</label>
                <select
                  className="config-select"
                  value={generalConfig.tiempoInactividad}
                  onChange={(e) =>
                    handleChangeGeneral("tiempoInactividad", e.target.value)
                  }
                >
                  <option value="5">5 min</option>
                  <option value="10">10 min</option>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">60 min</option>
                </select>
              </div>

              {/* Zona horaria */}
              <div className="config-field config-field-full">
                <label className="config-label">Zona horaria</label>
                <select
                  className="config-select"
                  value={generalConfig.zonaHoraria}
                  onChange={(e) =>
                    handleChangeGeneral("zonaHoraria", e.target.value)
                  }
                >
                  <option value="GMT-3 Santiago">GMT -3 Santiago</option>
                  <option value="GMT-5 Bogotá">GMT -5 Bogotá</option>
                  <option value="GMT-6 Ciudad de México">
                    GMT -6 Ciudad de México
                  </option>
                  <option value="GMT-3 Buenos Aires">
                    GMT -3 Buenos Aires
                  </option>
                </select>
              </div>
            </div>

            <div className="config-actions">
              <button
                type="button"
                className="config-btn-primary"
                onClick={handleGuardarGeneral}
                disabled={guardandoGeneral}
              >
                {guardandoGeneral ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </article>

        {/* Roles del sistema */}
        <article className="admin-config-card admin-config-card-roles">
          <header className="admin-config-card-header">
            <h2>Roles del sistema</h2>
          </header>

          <div className="admin-config-card-body admin-config-card-body-roles">
            <div className="config-role-row">
              <div>
                <p className="config-role-name">Rol estudiante</p>
                <p className="config-role-hint">
                  Acceso a misiones y progreso personal.
                </p>
              </div>
              <label className="config-switch">
                <input
                  type="checkbox"
                  checked={rolesActivos.estudiante}
                  onChange={() => toggleRol("estudiante")}
                />
                <span className="config-switch-slider" />
              </label>
            </div>

            <div className="config-role-row">
              <div>
                <p className="config-role-name">Rol GM</p>
                <p className="config-role-hint">
                  Gestiona misiones y grupos de estudiantes.
                </p>
              </div>
              <label className="config-switch">
                <input
                  type="checkbox"
                  checked={rolesActivos.gm}
                  onChange={() => toggleRol("gm")}
                />
                <span className="config-switch-slider" />
              </label>
            </div>

            <div className="config-role-row">
              <div>
                <p className="config-role-name">Rol Administrador</p>
                <p className="config-role-hint">
                  Control total del sistema y seguridad.
                </p>
              </div>
              <label className="config-switch">
                <input
                  type="checkbox"
                  checked={rolesActivos.admin}
                  onChange={() => toggleRol("admin")}
                />
                <span className="config-switch-slider" />
              </label>
            </div>

            <div className="config-roles-actions">
              <button
                type="button"
                className="config-btn-primary"
                onClick={abrirModalRol}
              >
                Crear
              </button>
            </div>
          </div>
        </article>
      </section>

      {/* Fila inferior */}
      <section className="admin-config-grid-bottom">
        {/* Políticas de contraseña + autenticación */}
        <article className="admin-config-card">
          <header className="admin-config-card-header">
            <h2>Políticas de Contraseña</h2>
          </header>

          <div className="admin-config-card-body admin-config-card-body-password">
            <div className="config-policy-grid">
              <div className="config-policy-item">
                <span className="config-policy-label">Min. 8 caracteres</span>
                <label className="config-switch">
                  <input
                    type="checkbox"
                    checked={passwordPolicy.minChars}
                    onChange={() => togglePasswordPolicy("minChars")}
                  />
                  <span className="config-switch-slider" />
                </label>
              </div>

              <div className="config-policy-item">
                <span className="config-policy-label">Mayúsculas</span>
                <label className="config-switch">
                  <input
                    type="checkbox"
                    checked={passwordPolicy.mayusculas}
                    onChange={() => togglePasswordPolicy("mayusculas")}
                  />
                  <span className="config-switch-slider" />
                </label>
              </div>

              <div className="config-policy-item">
                <span className="config-policy-label">Número</span>
                <label className="config-switch">
                  <input
                    type="checkbox"
                    checked={passwordPolicy.numeros}
                    onChange={() => togglePasswordPolicy("numeros")}
                  />
                  <span className="config-switch-slider" />
                </label>
              </div>

              <div className="config-policy-item">
                <span className="config-policy-label">Símbolo</span>
                <label className="config-switch">
                  <input
                    type="checkbox"
                    checked={passwordPolicy.simbolos}
                    onChange={() => togglePasswordPolicy("simbolos")}
                  />
                  <span className="config-switch-slider" />
                </label>
              </div>
            </div>

            <div className="config-policy-extra">
              <div className="config-policy-exp">
                <span className="config-policy-label">Expiración</span>
                <select
                  className="config-select small"
                  value={passwordPolicy.expiracion}
                  onChange={(e) => handlePasswordExpChange(e.target.value)}
                >
                  <option value="30">30 días</option>
                  <option value="60">60 días</option>
                  <option value="90">90 días</option>
                  <option value="180">180 días</option>
                </select>
              </div>

              <div className="config-auth-block">
                <h3>Autenticación</h3>
                <div className="config-policy-item">
                  <span className="config-policy-label">
                    Verificación de 2 pasos
                  </span>
                  <label className="config-switch">
                    <input
                      type="checkbox"
                      checked={authConfig.twoFactor}
                      onChange={toggleTwoFactor}
                    />
                    <span className="config-switch-slider" />
                  </label>
                </div>

                <div className="config-policy-item">
                  <span className="config-policy-label">
                    Número máx. intentos
                  </span>
                  <select
                    className="config-select small"
                    value={authConfig.maxIntentos}
                    onChange={(e) =>
                      handleMaxIntentosChange(e.target.value)
                    }
                  >
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="7">7</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Columna derecha: Base de datos + Mantenimiento */}
        <div className="admin-config-column-right">
          {/* Bases de datos */}
          <article className="admin-config-card admin-config-card-db">
            <header className="admin-config-card-header">
              <h2>Bases de datos</h2>
            </header>

            <div className="admin-config-card-body admin-config-card-body-db">
              <div className="config-db-actions">
                <button
                  type="button"
                  className="config-btn-primary"
                  onClick={handleGenerarRespaldo}
                >
                  Generar respaldo ahora
                </button>
                <button
                  type="button"
                  className={`config-btn-outline ${
                    backupConfig.respaldoAutomatico ? "active" : ""
                  }`}
                  onClick={toggleRespAuto}
                >
                  Respaldo automático
                </button>
              </div>

              <div className="config-db-info">
                <p>
                  <span className="config-db-label">Último respaldo:</span>{" "}
                  <span className="config-db-value">
                    {backupConfig.ultimaEjecucion}
                  </span>
                </p>
                <p>
                  <span className="config-db-label">Tamaño actual:</span>{" "}
                  <span className="config-db-value">
                    {backupConfig.tamanoActual}
                  </span>
                </p>
              </div>
            </div>
          </article>

          {/* Mantenimiento del sistema */}
          <article className="admin-config-card admin-config-card-maint">
            <header className="admin-config-card-header">
              <h2>Mantenimiento del sistema</h2>
            </header>

            <div className="admin-config-card-body admin-config-card-body-maint">
              <ul className="config-maint-list">
                <li>Borrar logs antiguos (&gt; 90 días)</li>
                <li>Borrar misiones inactivas (&gt; 1 año)</li>
                <li>Borrar cuentas sin uso (&gt; 6 meses)</li>
              </ul>

              <button
                type="button"
                className="config-btn-primary wide"
                onClick={handleDiagnostico}
                disabled={ejecutandoDiagnostico}
              >
                {ejecutandoDiagnostico
                  ? "Ejecutando diagnóstico..."
                  : "Ejecutar diagnóstico"}
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* Modal creación de rol */}
      {isRoleModalOpen && (
        <div className="config-modal-backdrop" onClick={cerrarModalRol}>
          <div
            className="config-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="config-modal-header">
              <h2>Crear nuevo rol</h2>
              <button
                type="button"
                className="config-modal-close"
                onClick={cerrarModalRol}
              >
                ✕
              </button>
            </div>

            <form className="config-modal-body" onSubmit={handleCrearRol}>
              <div className="config-field">
                <label className="config-label">Nombre del rol</label>
                <input
                  type="text"
                  className="config-input"
                  value={nuevoRol.nombre}
                  onChange={(e) =>
                    handleChangeNuevoRol("nombre", e.target.value)
                  }
                  placeholder="Ej: Coordinador académico"
                />
              </div>

              <div className="config-field">
                <label className="config-label">Descripción</label>
                <textarea
                  className="config-textarea"
                  value={nuevoRol.descripcion}
                  onChange={(e) =>
                    handleChangeNuevoRol("descripcion", e.target.value)
                  }
                  placeholder="Describe brevemente el alcance del rol."
                  rows={3}
                />
              </div>

              <div className="config-field">
                <label className="config-label">Tipo</label>
                <select
                  className="config-select"
                  value={nuevoRol.tipo}
                  onChange={(e) =>
                    handleChangeNuevoRol("tipo", e.target.value)
                  }
                >
                  <option value="Personalizado">Personalizado</option>
                  <option value="Lectura">Solo lectura</option>
                  <option value="Gestor">Gestor de misiones</option>
                </select>
              </div>

              <div className="config-modal-permisos">
                <p className="config-label">Permisos básicos</p>
                <label className="config-perm-item">
                  <input
                    type="checkbox"
                    checked={nuevoRol.permisos.gestionarUsuarios}
                    onChange={() =>
                      togglePermisoRol("gestionarUsuarios")
                    }
                  />
                  <span>Gestionar usuarios</span>
                </label>
                <label className="config-perm-item">
                  <input
                    type="checkbox"
                    checked={nuevoRol.permisos.gestionarMisiones}
                    onChange={() =>
                      togglePermisoRol("gestionarMisiones")
                    }
                  />
                  <span>Gestionar misiones</span>
                </label>
                <label className="config-perm-item">
                  <input
                    type="checkbox"
                    checked={nuevoRol.permisos.verReportes}
                    onChange={() => togglePermisoRol("verReportes")}
                  />
                  <span>Ver reportes y estadísticas</span>
                </label>
              </div>

              <div className="config-modal-actions">
                <button
                  type="button"
                  className="config-btn-outline"
                  onClick={cerrarModalRol}
                >
                  Cancelar
                </button>
                <button type="submit" className="config-btn-primary">
                  Crear rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast de feedback */}
      {mensajeToast && (
        <div className={`config-toast config-toast-${tipoToast}`}>
          {mensajeToast}
        </div>
      )}
    </div>
  );
}

export default AdminConfiguracion;
