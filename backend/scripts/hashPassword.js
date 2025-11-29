// Script para generar contraseñas hasheadas
// Uso: node scripts/hashPassword.js [contraseña]

const bcrypt = require('bcryptjs');

const password = process.argv[2] || '123456';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error al generar hash:', err);
    process.exit(1);
  }

  console.log('\n=================================');
  console.log('Contraseña:', password);
  console.log('Hash:', hash);
  console.log('=================================\n');

  console.log('Usa este hash en tu SQL:');
  console.log(`UPDATE usuarios SET password = '${hash}' WHERE email = 'tu_email@ejemplo.com';\n`);
});
