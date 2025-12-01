const nodemailer = require('nodemailer');

// Configurar el transportador de email con Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', // false para puerto 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verificar la conexión al servidor SMTP
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error al conectar con el servidor de email:', error.message);
    console.log('💡 Asegúrate de configurar las variables de email en el archivo .env');
  } else {
    console.log('✅ Servidor de email listo para enviar mensajes');
  }
});

// Función para enviar email de recuperación de contraseña
const enviarEmailRecuperacion = async (email, nombre, token) => {
  const resetUrl = `http://localhost:3000/restablecer-contrasena/${token}`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: email,
    subject: 'Recuperación de Contraseña - Aprende Jugando',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 10px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Recuperación de Contraseña</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${nombre}</strong>,</p>

              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Aprende Jugando</strong>.</p>

              <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>

              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
              </div>

              <p>O copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
                ${resetUrl}
              </p>

              <div class="warning">
                <p style="margin: 0;"><strong>⚠️ Importante:</strong></p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Este enlace es válido por <strong>1 hora</strong></li>
                  <li>Solo puedes usarlo <strong>una vez</strong></li>
                  <li>Si no solicitaste este cambio, ignora este correo</li>
                </ul>
              </div>

              <p>Si tienes algún problema, contacta al administrador del sistema.</p>

              <p>Saludos,<br>
              <strong>Equipo de Aprende Jugando</strong></p>
            </div>
            <div class="footer">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>&copy; ${new Date().getFullYear()} Aprende Jugando. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de recuperación enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw error;
  }
};

// Función para enviar email de bienvenida con contraseña temporal
const enviarEmailBienvenida = async (email, nombre, passwordTemporal) => {
  const loginUrl = `http://localhost:3000/login`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: email,
    subject: 'Bienvenido a Aprende Jugando - Credenciales de Acceso',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 10px;
            }
            .header {
              background: linear-gradient(135deg, #228BE6 0%, #1864ab 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .credentials-box {
              background-color: #f8f9fa;
              border: 2px solid #228BE6;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .credential-item {
              margin: 10px 0;
              padding: 10px;
              background-color: white;
              border-radius: 5px;
            }
            .credential-label {
              font-weight: bold;
              color: #495057;
              display: block;
              margin-bottom: 5px;
            }
            .credential-value {
              font-family: 'Courier New', monospace;
              font-size: 16px;
              color: #228BE6;
              font-weight: bold;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #228BE6 0%, #1864ab 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 ¡Bienvenido a Aprende Jugando!</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${nombre}</strong>,</p>

              <p>Tu cuenta ha sido creada exitosamente en <strong>Aprende Jugando</strong>. A continuación encontrarás tus credenciales de acceso:</p>

              <div class="credentials-box">
                <div class="credential-item">
                  <span class="credential-label">📧 Email:</span>
                  <span class="credential-value">${email}</span>
                </div>
                <div class="credential-item">
                  <span class="credential-label">🔑 Contraseña Temporal:</span>
                  <span class="credential-value">${passwordTemporal}</span>
                </div>
              </div>

              <div class="warning">
                <p style="margin: 0;"><strong>⚠️ Importante:</strong></p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Esta es una contraseña <strong>temporal</strong></li>
                  <li>Te recomendamos cambiarla después de iniciar sesión</li>
                  <li>Guarda esta información en un lugar seguro</li>
                  <li>No compartas tus credenciales con nadie</li>
                </ul>
              </div>

              <p>Para acceder a la plataforma, haz clic en el siguiente botón:</p>

              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Iniciar Sesión</a>
              </div>

              <p>O visita: <strong>${loginUrl}</strong></p>

              <p>Si tienes algún problema para acceder, contacta a tu profesor o al administrador del sistema.</p>

              <p>¡Disfruta aprendiendo!</p>

              <p>Saludos,<br>
              <strong>Equipo de Aprende Jugando</strong></p>
            </div>
            <div class="footer">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>&copy; ${new Date().getFullYear()} Aprende Jugando. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de bienvenida enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email de bienvenida:', error);
    throw error;
  }
};

module.exports = {
  transporter,
  enviarEmailRecuperacion,
  enviarEmailBienvenida
};
