require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'))

app.get('/api/key', (req, res) => {
  res.json({ apiKey: process.env.APIKEY}); 
});

// Rota principal para o index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/maps.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse localhost:${PORT}`);
});
  