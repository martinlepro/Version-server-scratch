// server.js
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint qui renvoie la version du serveur
app.get("/version.json", (req, res) => {
  res.json({ version: process.env.VERSION || "inconnu" });
});

// Test basique
app.get("/", (req, res) => {
  res.send("Serveur actif ✅");
});

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
