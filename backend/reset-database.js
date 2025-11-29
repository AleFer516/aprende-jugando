const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetDatabase() {
  console.log('🔄 Reiniciando base de datos...\n');

  let connection;

  try {
    // Conectar a MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log(`🗑️  Eliminando base de datos '${process.env.DB_NAME}' si existe...`);
    await connection.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);
    console.log('✅ Base de datos eliminada\n');

    console.log('✨ Base de datos reiniciada. Ahora ejecuta: npm run setup\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetDatabase();
