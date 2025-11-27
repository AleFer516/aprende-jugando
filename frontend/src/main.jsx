// src/main.jsx
// Punto de entrada de la aplicación React.
// Aquí envolvemos la app con BrowserRouter para habilitar las rutas.

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* BrowserRouter permite usar rutas en toda la app */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
