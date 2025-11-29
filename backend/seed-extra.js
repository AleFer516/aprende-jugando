const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function seedExtraData() {
  console.log('🌱 Insertando datos adicionales...\n');

  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'aprende_jugando',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Conectado a MySQL\n');

    // Asignar misión al estudiante
    console.log('📝 Asignando misión al estudiante...');
    await connection.query(
      'INSERT INTO estudiante_misiones (estudiante_id, mision_id, estado, progreso, actividad_actual, xp_ganado) VALUES (1, 1, "Pendiente", 0, 1, 0)'
    );
    console.log('✅ Misión asignada\n');

    console.log('✨ Datos adicionales insertados exitosamente!\n');

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('ℹ️  Los datos ya existen en la base de datos\n');
    } else {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedExtraData();
