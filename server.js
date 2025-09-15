// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Charger les variables d'environnement depuis .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
// Active CORS pour toutes les requêtes (important pour Turbowarp)
// En production, tu voudrais peut-être restreindre cela à des origines spécifiques:
// app.use(cors({ origin: ['https://turbowarp.org', 'https://ton-site-web.com'] }));
app.use(cors());
// Parse les corps de requêtes au format JSON
app.use(express.json());

// --- BASE DE DONNÉES EN MÉMOIRE (ATTENTION: données non persistantes !) ---
// Cela simule une base de données. En production, utilise une vraie base de données.
const usersData = {
  "user123": {
    userId: "user123",
    username: "JoueurX",
    profile: {
      bio: "J'adore les jeux TurboWarp!",
      avatarUrl: "https://example.com/avatar/joueurx.png",
      customStatus: "En pleine partie !"
    },
    scoreFields: {
      mainScore: 12345,
      level: 10,
      coins: 500,
      bestTime: 60.5
    }
  },
  "user456": {
    userId: "user456",
    username: "BetaTester",
    profile: {
      bio: "Je teste tous les bugs !",
      avatarUrl: "https://example.com/avatar/betatester.png",
      customStatus: "Bientôt un nouveau record..."
    },
    scoreFields: {
      mainScore: 9876,
      level: 8,
      coins: 300,
      bestTime: 75.2
    }
  },
  "user789": {
    userId: "user789",
    username: "TheWinner",
    profile: {
      bio: "Toujours au top du classement.",
      avatarUrl: "https://example.com/avatar/thewinner.png",
      customStatus: "En route pour la gloire !"
    },
    scoreFields: {
      mainScore: 15000,
      level: 12,
      coins: 700,
      bestTime: 55.0
    }
  }
  // Ajoute d'autres utilisateurs de test ici si tu le souhaites
};

// --- ENDPOINTS EXISTANTS ---

// Endpoint principal : version + lien
app.get("/version.json", (req, res) => {
  res.json({
    version: process.env.VERSION || "inconnu",
    url: process.env.PROJECT_URL || null
  });
});

// Endpoint de test
app.get("/", (req, res) => {
  res.send("✅ Serveur actif - consultez /version.json pour voir la version et le lien");
});

// --- NOUVEAUX ENDPOINTS POUR LES BLOCS TURBOWARP ---

// 1. GET /api/leaderboard
// Renvoie la liste de tous les utilisateurs triés par 'mainScore' (simple pour l'exemple)
app.get("/api/leaderboard", (req, res) => {
  const leaderboard = Object.values(usersData)
    .sort((a, b) => (b.scoreFields.mainScore || 0) - (a.scoreFields.mainScore || 0)); // Tri descendant par mainScore
  res.json(leaderboard);
});

// 2. GET /api/users/:userId
// Vérifie l'existence d'un utilisateur et renvoie ses infos
app.get("/api/users/:userId", (req, res) => {
  const { userId } = req.params;
  if (usersData[userId]) {
    res.status(200).json(usersData[userId]);
  } else {
    res.status(404).send("Utilisateur non trouvé.");
  }
});

// NOUVEL ENDPOINT : 3. POST /api/users
// Ajoute un nouvel utilisateur
app.post("/api/users", (req, res) => {
  const { userId, username } = req.body;

  if (!userId || !username) {
    return res.status(400).send("ID utilisateur et pseudo sont requis.");
  }
  if (usersData[userId]) {
    return res.status(409).send("Un utilisateur avec cet ID existe déjà.");
  }

  usersData[userId] = {
    userId: userId,
    username: username,
    profile: {
      bio: "", // Bio vide par défaut
      avatarUrl: "", // URL avatar vide par défaut
      customStatus: "" // Statut vide par défaut
    },
    scoreFields: {
      mainScore: 0, // Scores à zéro par défaut
      level: 0
      // ... autres scores par défaut si nécessaire
    }
  };
  res.status(201).json({ message: `Utilisateur '${username}' (ID: ${userId}) ajouté avec succès.`, user: usersData[userId] });
});

// ANCIEN ENDPOINT SUPPRIMÉ: POST /api/users/:userId/profile (les blocs correspondants ont été retirés de l'extension)

// 4. GET /api/users/:userId/scores
// Renvoie toutes les données de score d'un utilisateur
app.get("/api/users/:userId/scores", (req, res) => {
  const { userId } = req.params;
  if (usersData[userId] && usersData[userId].scoreFields) {
    res.status(200).json(usersData[userId].scoreFields);
  } else if (usersData[userId]) {
    res.status(200).json({}); // L'utilisateur existe mais n'a pas encore de scores
  } else {
    res.status(404).send("Utilisateur non trouvé.");
  }
});

// 5. GET /api/users/:userId/scores/:fieldName
// Renvoie la valeur d'un champ de score spécifique pour un utilisateur
app.get("/api/users/:userId/scores/:fieldName", (req, res) => {
  const { userId, fieldName } = req.params;
  if (usersData[userId] && usersData[userId].scoreFields && usersData[userId].scoreFields.hasOwnProperty(fieldName)) {
    res.status(200).json(usersData[userId].scoreFields[fieldName]);
  } else {
    res.status(404).send(`Champ de score '${fieldName}' non trouvé pour l'utilisateur '${userId}'.`);
  }
});

// 6. POST /api/users/:userId/scores
// Crée ou met à jour un champ de score spécifique pour un utilisateur
app.post("/api/users/:userId/scores", (req, res) => {
  const { userId } = req.params;
  const { field, value } = req.body;

  if (!usersData[userId]) {
    return res.status(404).send("Utilisateur non trouvé.");
  }
  if (!field || typeof value === "undefined") {
    return res.status(400).send("Champ ou valeur manquante dans la requête.");
  }

  // Initialise l'objet scoreFields si absent
  if (!usersData[userId].scoreFields) {
    usersData[userId].scoreFields = {};
  }
  usersData[userId].scoreFields[field] = value;
  res.status(200).send(`Donnée de score '${field}' de l'utilisateur '${userId}' mise à jour à '${value}'.`);
});

// 7. POST /api/users/:userId/rename-score-field
// Renomme un champ de score pour un utilisateur
app.post("/api/users/:userId/rename-score-field", (req, res) => {
  const { userId } = req.params;
  const { oldField, newField } = req.body;

  if (!usersData[userId]) {
    return res.status(404).send("Utilisateur non trouvé.");
  }
  if (!oldField || !newField) {
    return res.status(400).send("Ancien ou nouveau nom de champ manquant.");
  }
  if (!usersData[userId].scoreFields || !usersData[userId].scoreFields.hasOwnProperty(oldField)) {
    return res.status(404).send(`Ancien champ de score '${oldField}' non trouvé pour l'utilisateur '${userId}'.`);
  }

  usersData[userId].scoreFields[newField] = usersData[userId].scoreFields[oldField];
  delete usersData[userId].scoreFields[oldField];
  res.status(200).send(`Champ de score '${oldField}' de l'utilisateur '${userId}' renommé en '${newField}'.`);
});


// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
