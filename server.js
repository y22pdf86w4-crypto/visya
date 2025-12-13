import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve os arquivos estáticos
app.use('/visya', express.static(path.join(__dirname, 'dist')));

// --- CORREÇÃO DEFINITIVA (Express 5) ---
// Em vez de "*" ou "(.*)", usamos "/*splat"
// "splat" é apenas um nome para o parâmetro coringa
app.get('/visya/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/', (req, res) => {
  res.redirect('/visya');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}/visya`);
});
