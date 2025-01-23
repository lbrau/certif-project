import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const historyFile = join(__dirname, 'src', 'data', 'history', 'quiz-history.json');

// Lecture du fichier d'historique
async function readHistory() {
  try {
    const data = await fs.readFile(historyFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture de l\'historique:', error);
    return [];
  }
}

// Écriture dans le fichier d'historique
async function writeHistory(history) {
  try {
    await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Erreur lors de l\'écriture de l\'historique:', error);
    throw error;
  }
}

// Préfixe toutes les routes avec /api
const router = express.Router();

// GET /api/history - Récupérer l'historique
router.get('/history', async (req, res) => {
  try {
    const history = await readHistory();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
});

// POST /api/history - Ajouter un résultat
router.post('/history', async (req, res) => {
  try {
    const newResult = req.body;
    const history = await readHistory();
    history.unshift(newResult); // Ajoute le nouveau résultat au début
    await writeHistory(history);
    res.status(201).json(newResult);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde du résultat' });
  }
});

// Route de test pour vérifier que le serveur fonctionne
router.get('/', (req, res) => {
  res.json({ message: 'API Quiz fonctionnelle' });
});

// Utilise le router avec le préfixe /api
app.use('/api', router);

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});