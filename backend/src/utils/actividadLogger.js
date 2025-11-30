/**
 * Utilidad para registrar actividades en la base de datos
 * Centraliza el logging de todas las acciones del sistema
 */

const pool = require('../db');

/**
 * Registra una actividad en la tabla actividad_admin
 * @param {string} titulo - Descripción de la actividad
 * @param {string} usuario - Usuario que realizó la acción
 * @param {string} tipo - Tipo de actividad: 'usuario', 'sistema', 'configuracion', 'auditoria'
 */
async function registrarActividad(titulo, usuario = 'Sistema', tipo = 'sistema') {
  try {
    const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const hora = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

    await pool.query(
      `INSERT INTO actividad_admin (fecha, hora, titulo, usuario, tipo)
       VALUES (?, ?, ?, ?, ?)`,
      [fecha, hora, titulo, usuario, tipo]
    );

    console.log(`✅ Actividad registrada: ${titulo} - ${usuario}`);
  } catch (error) {
    console.error('❌ Error al registrar actividad:', error);
    // No lanzamos el error para que no afecte la operación principal
  }
}

module.exports = { registrarActividad };
