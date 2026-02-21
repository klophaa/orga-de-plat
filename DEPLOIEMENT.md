# 🚀 Guide de déploiement — Orga de plat v4
## Firebase + Vercel + PWA

---

## VUE D'ENSEMBLE

```
Ton téléphone  ──►  Vercel (héberge l'app React)
                         │
                         ▼
                  Firebase (base de données + auth)
                    ├── Firestore (données en temps réel)
                    └── Authentication (comptes sécurisés)
```

**Coût total : 0 €** (les deux sont gratuits pour un usage personnel)

---

## ÉTAPE 1 — Créer le projet Firebase

### 1.1 — Créer le projet

1. Va sur **https://console.firebase.google.com**
2. Clique **"Créer un projet"**
3. Nom du projet : `orga-de-plat`
4. Désactive Google Analytics (pas nécessaire)
5. Clique **"Créer le projet"**

### 1.2 — Activer Firestore (base de données)

1. Dans le menu gauche → **"Firestore Database"**
2. Clique **"Créer une base de données"**
3. Choisis **"Démarrer en mode production"**
4. Sélectionne la région : `europe-west1` (Belgique, la plus proche)
5. Clique **"Activer"**

### 1.3 — Configurer les règles de sécurité Firestore

1. Dans Firestore → onglet **"Règles"**
2. Remplace tout le contenu par le contenu du fichier `firestore.rules`
3. Clique **"Publier"**

⚠️ **Ces règles sont essentielles** : sans elles, n'importe qui pourrait lire/modifier vos données.

### 1.4 — Activer l'authentification

1. Dans le menu gauche → **"Authentication"**
2. Clique **"Commencer"**
3. Onglet **"Sign-in method"** → active **"E-mail/Mot de passe"**
4. Clique **"Enregistrer"**

### 1.5 — Créer les comptes de Théo et Elodie

1. Onglet **"Utilisateurs"** → **"Ajouter un utilisateur"**
2. Crée le compte **Théo** :
   - Email : `theo@orgadeplat.fr`
   - Mot de passe : (choisis un mot de passe fort, ex: `Th3oOrga2024!`)
3. Crée le compte **Elodie** :
   - Email : `elodie@orgadeplat.fr`
   - Mot de passe : (choisis un mot de passe fort, ex: `El0dieOrga2024!`)

> 💡 Vous pouvez changer les mots de passe depuis la console Firebase à tout moment.
> Les mots de passe sont hashés par Firebase — personne ne peut les voir, même toi.

### 1.6 — Récupérer la configuration Firebase

1. Dans Firebase → icône ⚙️ (paramètres) → **"Paramètres du projet"**
2. Descends jusqu'à **"Vos applications"** → clique **"</>** (Web)"
3. Nom de l'app : `orga-de-plat-web`
4. **Ne coche pas** Firebase Hosting (on utilise Vercel)
5. Clique **"Enregistrer l'application"**
6. Copie l'objet `firebaseConfig` affiché :

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "orga-de-plat.firebaseapp.com",
  projectId: "orga-de-plat",
  storageBucket: "orga-de-plat.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## ÉTAPE 2 — Préparer le code

### 2.1 — Coller ta configuration Firebase

Ouvre le fichier `src/App.jsx` et remplace le bloc `firebaseConfig` au début du fichier :

```js
// AVANT (lignes ~15-23)
const firebaseConfig = {
  apiKey:            "REMPLACE_MOI",
  authDomain:        "REMPLACE_MOI.firebaseapp.com",
  ...
};

// APRÈS — colle TES vraies valeurs
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "orga-de-plat.firebaseapp.com",
  projectId:         "orga-de-plat",
  storageBucket:     "orga-de-plat.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123",
};
```

### 2.2 — (Optionnel) Changer les emails autorisés

Si tu veux utiliser des emails différents de `theo@orgadeplat.fr` et `elodie@orgadeplat.fr`, modifie :
- Le tableau `ALLOWED_EMAILS` dans `src/App.jsx` (ligne ~32)
- Le tableau dans `firestore.rules` (ligne ~11)

### 2.3 — Mettre le projet sur GitHub

1. Crée un compte sur **https://github.com** si tu n'en as pas
2. Crée un **nouveau dépôt** (repository) : `orga-de-plat`
3. Sur ton ordinateur, dans le dossier `orga-plat-v4/` :

```bash
git init
git add .
git commit -m "Initial commit — Orga de plat v4"
git remote add origin https://github.com/TON_USERNAME/orga-de-plat.git
git push -u origin main
```

> 💡 Si tu n'as pas Git, télécharge-le sur https://git-scm.com

---

## ÉTAPE 3 — Déployer sur Vercel

### 3.1 — Créer un compte Vercel

1. Va sur **https://vercel.com**
2. Clique **"Sign Up"** → connecte-toi avec ton compte GitHub
3. Autorise Vercel à accéder à tes dépôts

### 3.2 — Importer le projet

1. Sur Vercel → **"Add New Project"**
2. Sélectionne ton dépôt `orga-de-plat`
3. Vercel détecte automatiquement React (Create React App)
4. Clique **"Deploy"**
5. ⏳ Attends ~2 minutes que le build se termine

### 3.3 — Accéder à l'app

Vercel te donne une URL du type :
```
https://orga-de-plat-xxxxx.vercel.app
```

**Enregistre cette URL** — c'est l'adresse de ton app !

### 3.4 — (Recommandé) Domaine personnalisé

Pour avoir une URL plus propre comme `orga.theo-elodie.fr` :
1. Vercel → ton projet → **"Settings"** → **"Domains"**
2. Ajoute ton domaine personnalisé

---

## ÉTAPE 4 — Installer l'app sur le téléphone (PWA)

### Sur iPhone (Safari uniquement) :
1. Ouvre l'URL de l'app dans **Safari**
2. Appuie sur l'icône **Partager** (carré avec flèche)
3. Sélectionne **"Sur l'écran d'accueil"**
4. Nomme-la "Orga de plat" → **"Ajouter"**
5. L'app apparaît comme une vraie app sur ton écran d'accueil ✅

### Sur Android (Chrome) :
1. Ouvre l'URL dans **Chrome**
2. Appuie sur le menu **⋮** (3 points)
3. Sélectionne **"Ajouter à l'écran d'accueil"**
4. Confirme → **"Ajouter"** ✅

---

## ÉTAPE 5 — Ajouter les icônes PWA (optionnel mais joli)

Crée deux images carrées :
- `public/icon-192.png` — 192×192 px
- `public/icon-512.png` — 512×512 px

Tu peux créer une icône gratuite sur **https://www.canva.com** ou **https://favicon.io**.

---

## MISES À JOUR

Pour mettre à jour l'app après une modification :

```bash
git add .
git commit -m "Description de la modification"
git push
```

Vercel redéploie automatiquement en ~2 minutes. ✅

---

## GESTION DES MOTS DE PASSE

### Changer le mot de passe d'un utilisateur :
1. Firebase Console → **Authentication** → **Utilisateurs**
2. Clique sur l'utilisateur → **"Réinitialiser le mot de passe"**
3. Firebase envoie un email de réinitialisation

### Sécurité des mots de passe :
- ✅ Les mots de passe sont **hashés avec bcrypt** par Firebase
- ✅ Personne (même l'administrateur) ne peut voir les mots de passe en clair
- ✅ Les tokens de session expirent automatiquement
- ✅ HTTPS forcé sur Vercel — les données transitent chiffrées
- ✅ Les règles Firestore empêchent tout accès non authentifié

---

## RÉSOLUTION DE PROBLÈMES

### "Permission denied" dans la console Firebase
→ Vérifie que les règles Firestore sont bien publiées (Étape 1.3)

### L'app ne se charge pas / erreur Firebase
→ Vérifie que la `firebaseConfig` dans `App.jsx` contient tes vraies valeurs

### Problème de build sur Vercel
→ Vérifie que `package.json` est présent à la racine du projet

### L'app ne s'installe pas en PWA sur iPhone
→ Tu dois impérativement utiliser **Safari** (pas Chrome ni Firefox)

---

## STRUCTURE DES DONNÉES FIRESTORE

```
firestore/
├── dishes/          ← Collection des plats
│   └── {id}/
│       ├── name, categories, recipe, photo
│       ├── tasteByUser: { Théo: 5, Elodie: 4 }
│       ├── dishesRating, timeRating
│       ├── favorite, createdBy, updatedBy
│       └── createdAt, updatedAt (Timestamps)
│
├── ideas/           ← Collection des idées de plats
│   └── {id}/
│       ├── title, note, link, photo
│       ├── tested, createdBy
│       └── createdAt
│
├── weekPlans/       ← Planning par semaine
│   └── {YYYY-MM-DD}/    ← clé = lundi de la semaine
│       ├── "Lundi midi": { id, name, photo }
│       ├── "Lundi soir": { id, name, photo }
│       └── ...
│
├── activity/        ← Fil d'activité
│   └── {id}/
│       ├── user, msg
│       └── ts (Timestamp)
│
└── config/          ← Configuration
    └── categories/
        └── list: ["Fat", "Asiat", ...]
```

---

## RÉCAPITULATIF

| Élément | Service | Coût |
|---------|---------|------|
| Base de données temps réel | Firebase Firestore | Gratuit |
| Authentification sécurisée | Firebase Auth | Gratuit |
| Hébergement web | Vercel | Gratuit |
| Certificat HTTPS | Vercel (automatique) | Gratuit |
| PWA (installation mobile) | Inclus dans l'app | — |
| **Total** | | **0 €/mois** |

Les limites du plan gratuit Firebase sont largement suffisantes :
- 1 Go de stockage Firestore
- 50 000 lectures / jour
- 20 000 écritures / jour

Pour 2 utilisateurs qui planifient des repas, vous n'approcherez jamais ces limites. 🎉
