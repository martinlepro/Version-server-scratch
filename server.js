// server_version_only.js (pour https://version-server-scratch.onrender.com)
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Charger les variables d'environnement depuis .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Endpoint pour la version et le lien du projet
app.get("/version.json", (req, res) => {
  console.log("Requête GET sur /version.json reçue."); // Pour voir dans les logs de Render
  res.json({
    version: process.env.VERSION || "inconnu",
    url: process.env.PROJECT_URL || null
  });
});

// Endpoint de test pour la racine (renvoie du texte, comme tu l'avais initialement)
app.get("/", (req, res) => {
  console.log("Requête GET sur / (racine) reçue."); // Pour voir dans les logs de Render
  res.send("✅ Serveur actif - consultez /version.json pour voir la version et le lien");
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur de version démarré sur http://localhost:${PORT}`);
});
