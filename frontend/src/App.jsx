// src/App.jsx
// Definición de rutas principales de la aplicación.
// Aquí se manejan todas las rutas públicas y privadas (panel admin).

import { Routes, Route } from "react-router-dom";

// 🟦 Páginas públicas
import Login from "./pages/Login.jsx";
import SobreNosotros from "./pages/SobreNosotros.jsx";
import Contacto from "./pages/Contacto.jsx";
import Registro from "./pages/Registro.jsx";
import RecuperarContrasena from "./pages/RecuperarContrasena.jsx";

// 🟦 Panel Admin (rutas privadas / internas)
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsuarios from "./pages/admin/AdminUsuarios.jsx";
import AdminEstadisticas from "./pages/admin/AdminEstadisticas.jsx";
import AdminActividad from "./pages/admin/AdminActividad.jsx";
import AdminConfiguracion from "./pages/admin/AdminConfiguracion.jsx";
import AdminPerfil from "./pages/admin/AdminPerfil.jsx";

// 🟦 Panel GM (rutas privadas / internas)
import GMLayout from "./layouts/GMLayout.jsx";
import GMInicio from "./pages/gm/GMInicio.jsx";
import GMEstudiantes from "./pages/gm/GMEstudiantes.jsx";
import GMMisiones from "./pages/gm/GMMisiones.jsx";
import GMGestionarMision from "./pages/gm/GMGestionarMision.jsx";
import GMEvaluaciones from "./pages/gm/GMEvaluaciones.jsx";
import GMConfiguracion from "./pages/gm/GMConfiguracion.jsx";
import GMPerfil from "./pages/gm/GMPerfil.jsx";

function App() {
  return (
    <Routes>

      {/* --------------------------------------- */}
      {/* 🔵 RUTAS PÚBLICAS                      */}
      {/* --------------------------------------- */}

      {/* Ruta principal (Inicio → Login) */}
      <Route path="/" element={<Login />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Registro */}
      <Route path="/registro" element={<Registro />} />

      {/* Recuperar contraseña */}
      <Route path="/recuperar-contraseña" element={<RecuperarContrasena />} />

      {/* Sobre nosotros */}
      <Route path="/sobre-nosotros" element={<SobreNosotros />} />

      {/* Contacto */}
      <Route path="/contacto" element={<Contacto />} />


      {/* --------------------------------------- */}
      {/*     PANEL ADMIN (RUTAS PRIVADAS)        */}
      {/* --------------------------------------- */}
      {/* 
        AdminLayout es un layout que contiene:
        - Sidebar tipo hamburguesa
        - Topbar
        - Contenedor para las páginas internas (Outlet)
      */}
      <Route path="/admin" element={<AdminLayout />}>

        {/* Dashboard principal del admin */}
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* Gestión de usuarios */}
        <Route path="usuarios" element={<AdminUsuarios />} />

        {/* Estadísticas globales */}
        <Route path="estadisticas" element={<AdminEstadisticas />} />

        {/* Registro de actividad del sistema */}
        <Route path="actividad" element={<AdminActividad />} />

        {/* Configuración del panel */}
        <Route path="configuracion" element={<AdminConfiguracion />} />

        {/* Perfil del usuario */}
        <Route path="perfil" element={<AdminPerfil />} />

      </Route>


      {/* --------------------------------------- */}
      {/*      PANEL GM (RUTAS PRIVADAS)         */}
      {/* --------------------------------------- */}
      {/*
        GMLayout es un layout que contiene:
        - Sidebar tipo hamburguesa
        - Topbar
        - Contenedor para las páginas internas (Outlet)
      */}
      <Route path="/gm" element={<GMLayout />}>

        {/* Dashboard principal del GM */}
        <Route path="inicio" element={<GMInicio />} />

        {/* Gestión de estudiantes */}
        <Route path="estudiantes" element={<GMEstudiantes />} />

        {/* Gestión de misiones */}
        <Route path="misiones" element={<GMMisiones />} />

        {/* Gestión individual de una misión */}
        <Route path="misiones/:id" element={<GMGestionarMision />} />

        {/* Gestión de evaluaciones */}
        <Route path="evaluaciones" element={<GMEvaluaciones />} />

        {/* Configuración del panel */}
        <Route path="configuracion" element={<GMConfiguracion />} />

        {/* Perfil del usuario */}
        <Route path="perfil" element={<GMPerfil />} />

      </Route>

    </Routes>
  );
}

export default App;
