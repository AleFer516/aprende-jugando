const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('🔧 Iniciando configuración de la base de datos...\n');

  let connection;

  try {
    // Conectar a MySQL sin especificar base de datos
    console.log('📡 Conectando a MySQL...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    console.log('✅ Conectado a MySQL\n');

    // Crear base de datos
    console.log(`🗄️  Creando base de datos '${process.env.DB_NAME}'...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ Base de datos creada\n');

    // Seleccionar la base de datos
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Leer y ejecutar schema.sql
    console.log('📋 Ejecutando schema.sql...');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSQL);
    console.log('✅ Tablas creadas exitosamente\n');

    // Leer y ejecutar seed_actividades.sql
    console.log('🌱 Insertando actividades de prueba...');
    const seedPath = path.join(__dirname, 'database', 'seed_actividades.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    await connection.query(seedSQL);
    console.log('✅ Actividades insertadas\n');

    // Verificar tablas creadas
    console.log('🔍 Verificando tablas creadas...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ ${tables.length} tablas creadas:\n`);
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    // Verificar usuarios de prueba
    console.log('\n👥 Usuarios de prueba:');
    const [usuarios] = await connection.query('SELECT id, nombre, email, rol FROM usuarios');
    usuarios.forEach(u => {
      console.log(`   - ${u.nombre} (${u.email}) - Rol: ${u.rol}`);
    });

    // Verificar misiones
    console.log('\n📚 Misiones de prueba:');
    const [misiones] = await connection.query('SELECT id, nombre, dificultad, xp_recompensa FROM misiones');
    misiones.forEach(m => {
      console.log(`   - ${m.nombre} (${m.dificultad}) - XP: ${m.xp_recompensa}`);
    });

    // Verificar actividades
    console.log('\n🎯 Actividades creadas:');
    const [actividades] = await connection.query('SELECT id, titulo FROM actividades');
    console.log(`   Total: ${actividades.length} actividades`);
    actividades.forEach(a => {
      console.log(`   - Actividad ${a.id}: ${a.titulo}`);
    });

    console.log('\n✨ ¡Base de datos configurada exitosamente!\n');
    console.log('📝 Credenciales de prueba:');
    console.log('   Estudiante: estudiante@test.com / password123');
    console.log('   Game Master: gm@test.com / password123');
    console.log('   Admin: admin@test.com / password123\n');
    console.log('🚀 Ya puedes iniciar el servidor con: npm start\n');

  } catch (error) {
    console.error('\n❌ Error al configurar la base de datos:');
    console.error(error.message);

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Solución: Verifica las credenciales de MySQL en el archivo .env');
      console.error(`   DB_USER: ${process.env.DB_USER}`);
      console.error(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '****' : '(vacío)'}`);
      console.error(`   DB_HOST: ${process.env.DB_HOST}`);
      console.error(`   DB_PORT: ${process.env.DB_PORT}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solución: Verifica que MySQL esté corriendo');
      console.error('   - Windows: Abre "Servicios" y verifica que MySQL esté iniciado');
      console.error('   - Mac/Linux: Ejecuta "sudo service mysql start"');
    } else if (error.errno === -4058 || error.code === 'ENOENT') {
      console.error('\n💡 Solución: No se encontró el archivo SQL');
      console.error('   Verifica que existan los archivos:');
      console.error('   - backend/database/schema.sql');
      console.error('   - backend/database/seed_actividades.sql');
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar setup
setupDatabase();
