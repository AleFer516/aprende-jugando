// src/pages/admin/AdminConfiguracion.jsx
// Página de configuración del panel admin.

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/adminConfiguracion.css";
import adminService from "../../services/adminService";

function AdminConfiguracion() {
  const { theme, setTheme } = useTheme();

  const [generalConfig, setGeneralConfig] = useState({
    nombreSistema: "Luminia",
    tiempoInactividad: "15",
    zonaHoraria: "GMT-3 Santiago",
    logoUrl: null,
  });

  const [roles, setRoles] = useState([]);

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
    frecuenciaRespaldo: 'diaria',
    ultimaEjecucion: "Hace 2 días",
    tamanoActual: "175 MB",
  });

  const [guardandoGeneral, setGuardandoGeneral] = useState(false);
  const [ejecutandoDiagnostico, setEjecutandoDiagnostico] = useState(false);
  const [mensajeToast, setMensajeToast] = useState(null);
  const [tipoToast, setTipoToast] = useState("success");
  const [modalDiagnosticoAbierto, setModalDiagnosticoAbierto] = useState(false);
  const [resultadosDiagnostico, setResultadosDiagnostico] = useState(null);

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

  const cargarRoles = useCallback(async () => {
    try {
      const response = await adminService.getRoles();
      if (response.success) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error('Error al cargar roles:', error);
      mostrarToast('Error al cargar roles', 'error');
    }
  }, []);

  // Cargar configuración y roles al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar configuración
        const responseConfig = await adminService.getConfiguracion();
        if (responseConfig.success) {
          const config = responseConfig.data;

          setGeneralConfig({
            nombreSistema: config.nombreSistema || "Luminia",
            tiempoInactividad: config.tiempoInactividad?.toString() || "15",
            zonaHoraria: config.zonaHoraria || "GMT-3 Santiago",
            logoUrl: config.logoUrl || null,
          });

          setPasswordPolicy(config.politicasPassword || {
            minChars: true,
            mayusculas: true,
            numeros: true,
            simbolos: true,
            expiracion: "90",
          });

          setAuthConfig(config.autenticacion || {
            twoFactor: true,
            maxIntentos: "5",
          });

          setBackupConfig({
            respaldoAutomatico: config.respaldoAutomatico || true,
            frecuenciaRespaldo: config.frecuenciaRespaldo || 'diaria',
            ultimaEjecucion: config.ultimoRespaldo || "Nunca",
            tamanoActual: config.tamanoBackup || "0 MB",
          });
        }

        // Cargar roles
        await cargarRoles();
      } catch (error) {
        console.error('Error al cargar datos:', error);
        mostrarToast('Error al cargar la configuración', 'error');
      }
    };

    cargarDatos();
  }, [cargarRoles]);

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

  const toggleRol = async (nombre, activo) => {
    try {
      const response = await adminService.toggleRol(nombre, !activo);
      if (response.success) {
        mostrarToast(response.message);
        await cargarRoles();
      }
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      mostrarToast(error.response?.data?.message || 'Error al actualizar rol', 'error');
    }
  };

  const eliminarRol = async (id, nombre) => {
    // Confirmar eliminación
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar el rol "${nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    try {
      const response = await adminService.eliminarRol(id);
      if (response.success) {
        mostrarToast('Rol eliminado exitosamente');
        await cargarRoles();
      }
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      mostrarToast(error.response?.data?.message || 'Error al eliminar rol', 'error');
    }
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

  const toggleRespAuto = async () => {
    try {
      const nuevoEstado = !backupConfig.respaldoAutomatico;

      const response = await adminService.actualizarRespaldoAutomatico(nuevoEstado);

      if (response.success) {
        setBackupConfig((prev) => ({
          ...prev,
          respaldoAutomatico: nuevoEstado,
        }));
        mostrarToast(`Respaldo automático ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`);
      }
    } catch (error) {
      console.error('Error al actualizar respaldo automático:', error);
      mostrarToast(error.response?.data?.message || 'Error al actualizar respaldo automático', 'error');
    }
  };

  const handleCambiarFrecuencia = async (nuevaFrecuencia) => {
    try {
      const response = await adminService.actualizarRespaldoAutomatico(
        backupConfig.respaldoAutomatico,
        nuevaFrecuencia
      );

      if (response.success) {
        setBackupConfig((prev) => ({
          ...prev,
          frecuenciaRespaldo: nuevaFrecuencia,
        }));
        mostrarToast(`Frecuencia de respaldo actualizada a: ${nuevaFrecuencia}`);
      }
    } catch (error) {
      console.error('Error al actualizar frecuencia:', error);
      mostrarToast(error.response?.data?.message || 'Error al actualizar frecuencia', 'error');
    }
  };

  const handleGuardarGeneral = () => {
    setGuardandoGeneral(true);
    setTimeout(() => {
      setGuardandoGeneral(false);
      mostrarToast("Configuración general guardada correctamente.");
    }, 1200);
  };

  const handleGenerarRespaldo = async () => {
    try {
      mostrarToast("Generando respaldo de la base de datos...", "info");

      const response = await adminService.generarRespaldo();

      if (response.success) {
        setBackupConfig((prev) => ({
          ...prev,
          ultimaEjecucion: "Hace unos segundos",
          tamanoActual: response.tamano || prev.tamanoActual
        }));
        mostrarToast(`Respaldo generado correctamente: ${response.nombreArchivo} (${response.tamano})`);
      }
    } catch (error) {
      console.error('Error al generar respaldo:', error);
      mostrarToast(
        error.response?.data?.message || 'Error al generar respaldo. Verifica que MySQL esté instalado y configurado.',
        'error'
      );
    }
  };

  const handleDiagnostico = async () => {
    try {
      setEjecutandoDiagnostico(true);
      mostrarToast("Ejecutando diagnóstico del sistema...", "info");

      const response = await adminService.ejecutarDiagnostico();

      if (response.success) {
        setResultadosDiagnostico(response);
        setModalDiagnosticoAbierto(true);

        const mensajeEstado = response.estadoGeneral === 'ok'
          ? 'Diagnóstico completado: Sistema en buen estado'
          : response.estadoGeneral === 'warning'
          ? 'Diagnóstico completado: Se encontraron advertencias'
          : 'Diagnóstico completado: Se encontraron problemas';

        mostrarToast(mensajeEstado, response.estadoGeneral === 'ok' ? 'success' : 'warning');
      }
    } catch (error) {
      console.error('Error al ejecutar diagnóstico:', error);
      mostrarToast('Error al ejecutar diagnóstico del sistema', 'error');
    } finally {
      setEjecutandoDiagnostico(false);
    }
  };

  const cerrarModalDiagnostico = () => {
    setModalDiagnosticoAbierto(false);
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

  const handleCrearRol = async (e) => {
    e.preventDefault();

    if (!nuevoRol.nombre.trim()) {
      mostrarToast("El nombre del rol es obligatorio.", "info");
      return;
    }

    try {
      const response = await adminService.crearRol(nuevoRol);
      if (response.success) {
        mostrarToast(response.message);

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

        // Recargar roles
        await cargarRoles();
      }
    } catch (error) {
      console.error('Error al crear rol:', error);
      mostrarToast(error.response?.data?.message || 'Error al crear rol', 'error');
    }
  };

  const handleSubirLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      mostrarToast('Solo se permiten imágenes (JPEG, PNG, GIF, SVG)', 'error');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      mostrarToast('El archivo no debe superar los 5MB', 'error');
      return;
    }

    try {
      mostrarToast('Subiendo logo...', 'info');
      const response = await adminService.subirLogoSistema(file);

      if (response.success) {
        // Actualizar el logo en el estado
        setGeneralConfig(prev => ({
          ...prev,
          logoUrl: response.logoUrl
        }));

        mostrarToast('Logo actualizado exitosamente');

        // Recargar la página después de 1 segundo para que se vea el cambio en el layout
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error al subir logo:', error);
      mostrarToast(error.response?.data?.message || 'Error al subir logo', 'error');
    }
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

              {/* Logo */}
              <div className="config-field">
                <label className="config-label">Logo</label>
                <div className="config-upload">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml"
                    onChange={handleSubirLogo}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="config-btn-outline"
                    onClick={() => document.getElementById('logo-upload').click()}
                  >
                    Subir
                  </button>
                  <span className="config-upload-hint">
                    {generalConfig.logoUrl ? 'Logo actual configurado' : 'PNG / SVG / JPG · máx. 5 MB'}
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
            {roles.map((rol) => (
              <div key={rol.id} className="config-role-row">
                <div style={{ flex: 1 }}>
                  <p className="config-role-name">
                    Rol {rol.nombre}
                    {rol.tipo !== 'Sistema' && (
                      <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', color: '#9bb4ff' }}>
                        ({rol.tipo})
                      </span>
                    )}
                  </p>
                  <p className="config-role-hint">
                    {rol.descripcion}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label className="config-switch">
                    <input
                      type="checkbox"
                      checked={rol.activo}
                      onChange={() => toggleRol(rol.nombre, rol.activo)}
                      disabled={rol.tipo === 'Sistema'}
                    />
                    <span className="config-switch-slider" />
                  </label>
                  {rol.tipo !== 'Sistema' && (
                    <button
                      type="button"
                      className="config-btn-delete"
                      onClick={() => eliminarRol(rol.id, rol.nombre)}
                      title="Eliminar rol"
                      style={{
                        padding: '0.5rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}

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
                {backupConfig.respaldoAutomatico && (
                  <div style={{ marginTop: '1rem' }}>
                    <label className="config-db-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Frecuencia de respaldo:
                    </label>
                    <select
                      className="config-select small"
                      value={backupConfig.frecuenciaRespaldo}
                      onChange={(e) => handleCambiarFrecuencia(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="diaria">Diaria</option>
                      <option value="semanal">Semanal</option>
                      <option value="mensual">Mensual</option>
                    </select>
                  </div>
                )}
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

      {/* Modal de resultados del diagnóstico */}
      {modalDiagnosticoAbierto && resultadosDiagnostico && (
        <div className="config-modal-backdrop" onClick={cerrarModalDiagnostico}>
          <div
            className="config-modal config-modal-diagnostico"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="config-modal-header">
              <h2>
                Resultados del Diagnóstico
                <span className={`diagnostico-badge diagnostico-badge-${resultadosDiagnostico.estadoGeneral}`}>
                  {resultadosDiagnostico.estadoGeneral === 'ok' ? '✓ Todo bien' :
                   resultadosDiagnostico.estadoGeneral === 'warning' ? '⚠ Advertencias' :
                   '✗ Problemas'}
                </span>
              </h2>
              <button
                type="button"
                className="config-modal-close"
                onClick={cerrarModalDiagnostico}
              >
                ✕
              </button>
            </div>

            <div className="config-modal-body config-diagnostico-body">
              {/* Base de Datos */}
              <div className="diagnostico-seccion">
                <h3 className={`diagnostico-titulo diagnostico-titulo-${resultadosDiagnostico.resultados.baseDatos.estado}`}>
                  <span className="diagnostico-icono">💾</span>
                  Base de Datos
                  <span className="diagnostico-estado">{resultadosDiagnostico.resultados.baseDatos.mensaje}</span>
                </h3>
                <ul className="diagnostico-lista">
                  {resultadosDiagnostico.resultados.baseDatos.detalles.map((detalle, index) => (
                    <li key={index} className={`diagnostico-item diagnostico-item-${detalle.tipo}`}>
                      <span className="diagnostico-bullet">
                        {detalle.tipo === 'ok' ? '✓' : detalle.tipo === 'warning' ? '⚠' : '✗'}
                      </span>
                      {detalle.mensaje}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rendimiento */}
              <div className="diagnostico-seccion">
                <h3 className={`diagnostico-titulo diagnostico-titulo-${resultadosDiagnostico.resultados.rendimiento.estado}`}>
                  <span className="diagnostico-icono">⚡</span>
                  Rendimiento
                  <span className="diagnostico-estado">{resultadosDiagnostico.resultados.rendimiento.mensaje}</span>
                </h3>
                <ul className="diagnostico-lista">
                  {resultadosDiagnostico.resultados.rendimiento.detalles.map((detalle, index) => (
                    <li key={index} className={`diagnostico-item diagnostico-item-${detalle.tipo}`}>
                      <span className="diagnostico-bullet">
                        {detalle.tipo === 'ok' ? '✓' : detalle.tipo === 'warning' ? '⚠' : '✗'}
                      </span>
                      {detalle.mensaje}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mantenimiento */}
              <div className="diagnostico-seccion">
                <h3 className={`diagnostico-titulo diagnostico-titulo-${resultadosDiagnostico.resultados.mantenimiento.estado}`}>
                  <span className="diagnostico-icono">🔧</span>
                  Mantenimiento
                  <span className="diagnostico-estado">{resultadosDiagnostico.resultados.mantenimiento.mensaje}</span>
                </h3>
                <ul className="diagnostico-lista">
                  {resultadosDiagnostico.resultados.mantenimiento.detalles.map((detalle, index) => (
                    <li key={index} className={`diagnostico-item diagnostico-item-${detalle.tipo}`}>
                      <span className="diagnostico-bullet">
                        {detalle.tipo === 'ok' ? '✓' : detalle.tipo === 'warning' ? '⚠' : detalle.tipo === 'info' ? 'ℹ' : '✗'}
                      </span>
                      {detalle.mensaje}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Seguridad */}
              <div className="diagnostico-seccion">
                <h3 className={`diagnostico-titulo diagnostico-titulo-${resultadosDiagnostico.resultados.seguridad.estado}`}>
                  <span className="diagnostico-icono">🔒</span>
                  Seguridad y Respaldos
                  <span className="diagnostico-estado">{resultadosDiagnostico.resultados.seguridad.mensaje}</span>
                </h3>
                <ul className="diagnostico-lista">
                  {resultadosDiagnostico.resultados.seguridad.detalles.map((detalle, index) => (
                    <li key={index} className={`diagnostico-item diagnostico-item-${detalle.tipo}`}>
                      <span className="diagnostico-bullet">
                        {detalle.tipo === 'ok' ? '✓' : detalle.tipo === 'warning' ? '⚠' : '✗'}
                      </span>
                      {detalle.mensaje}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="config-modal-footer">
              <button
                type="button"
                className="config-btn-primary"
                onClick={cerrarModalDiagnostico}
              >
                Cerrar
              </button>
            </div>
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
