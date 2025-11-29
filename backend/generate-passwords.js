const bcrypt = require('bcryptjs');

async function generatePasswords() {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);

  console.log('Contraseña original:', password);
  console.log('Hash para la base de datos:');
  console.log(hash);
  console.log('\nSQL para actualizar usuarios:');
  console.log(`UPDATE usuarios SET password = '${hash}' WHERE email = 'estudiante@test.com';`);
  console.log(`UPDATE usuarios SET password = '${hash}' WHERE email = 'gm@test.com';`);
  console.log(`UPDATE usuarios SET password = '${hash}' WHERE email = 'admin@test.com';`);
}

generatePasswords();
