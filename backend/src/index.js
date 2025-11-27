const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Aprende Jugando funcionando ✅' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
