// server.js
import express from "express";
import dotenv from "dotenv";

// Charger les variables d'environnement depuis .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint principal : renvoie la version du serveur
app.get("/version.json", (req, res) => {
  res.json({ version: process.env.VERSION || "inconnu" });
});

// Endpoint de test
app.get("/", (req, res) => {
  res.send("✅ Serveur actif - allez sur /version.json pour voir la version");
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
