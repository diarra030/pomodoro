# 🍅 Pomodoro Focus Timer

Une application web de concentration basée sur la technique Pomodoro, conçue pour vous aider à rester productif et à gérer efficacement votre temps de travail.

![Pomodoro Focus Timer](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-purple) ![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [Personnalisation](#-personnalisation)
- [Contribuer](#-contribuer)
- [Licence](#-licence)

## ✨ Fonctionnalités

### Modes de minuterie
- **Concentration** : Session de travail focalisé (25 min par défaut)
- **Pause courte** : Repos entre les sessions (5 min par défaut)
- **Pause longue** : Repos après plusieurs sessions (15 min par défaut)

### Contrôles
- ▶️ Démarrer / ⏸️ Mettre en pause
- 🔄 Réinitialiser le timer
- ⏭️ Sauter à la session suivante

### Personnalisation
- Durées personnalisables pour chaque mode
- Intervalle de pause longue configurable
- Paramètres sauvegardés automatiquement

### Statistiques
- Nombre de sessions de concentration complétées
- Temps total de focus accumulé
- Historique détaillé des sessions avec horodatage
- Données persistantes via localStorage

### Interface utilisateur
- Design épuré et moderne
- Fond dynamique selon le mode actif
- Cercle de progression animé
- Effets glass-morphism
- Animations fluides
- Notification sonore à la fin des sessions
- Indicateur visuel des sessions avant pause longue
- Responsive design (mobile & desktop)

## 🛠️ Technologies

- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS 3** - Framework CSS utility-first
- **Web Audio API** - Notifications sonores
- **localStorage** - Persistance des données

## 📦 Installation

### Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn

### Étapes d'installation

1. **Cloner le projet** (ou créer un nouveau dossier)
   ```bash
   mkdir pomodoro
   cd pomodoro
   ```

2. **Initialiser le projet Vite**
   ```bash
   npm create vite@latest . -- --template react-ts
   ```

3. **Installer les dépendances**
   ```bash
   npm install
   ```

4. **Installer Tailwind CSS**
   ```bash
   npm install -D tailwindcss@3 postcss autoprefixer
   npx tailwindcss init -p
   ```

5. **Configurer Tailwind**

   Modifiez `tailwind.config.js` :
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

6. **Créer les fichiers du projet**

   Remplacez le contenu des fichiers suivants :
   - `index.html`
   - `src/index.css`
   - `src/App.tsx`

   (Voir le code source complet dans les fichiers du projet)

7. **Vérifier l'import CSS dans `src/main.tsx`**
   ```typescript
   import './index.css'
   ```

## 🚀 Utilisation

### Mode développement

Lancez le serveur de développement avec rechargement automatique :

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Build de production

Créez une version optimisée pour la production :

```bash
npm run build
```

Les fichiers générés seront dans le dossier `dist/`

### Prévisualiser le build

```bash
npm run preview
```

### Déploiement

Le dossier `dist/` peut être déployé sur n'importe quel serveur statique :
- Vercel
- Netlify
- GitHub Pages
- Vercel
- Tout serveur web (Apache, Nginx, etc.)

## 📁 Structure du projet

```
pomodoro/
├── index.html              # Point d'entrée HTML
├── package.json            # Dépendances et scripts
├── tailwind.config.js      # Configuration Tailwind
├── postcss.config.js       # Configuration PostCSS
├── tsconfig.json           # Configuration TypeScript
├── vite.config.ts          # Configuration Vite
├── public/                 # Assets statiques
└── src/
    ├── main.tsx           # Point d'entrée React
    ├── App.tsx            # Composant principal
    └── index.css          # Styles globaux et Tailwind
```

## ⚙️ Personnalisation

### Modifier les durées par défaut

Dans `src/App.tsx`, modifiez l'objet `DEFAULT_SETTINGS` :

```typescript
const DEFAULT_SETTINGS: TimerSettings = {
  focus: 25,           // Durée de concentration en minutes
  shortBreak: 5,       // Durée de pause courte en minutes
  longBreak: 15,       // Durée de pause longue en minutes
  longBreakInterval: 4, // Nombre de sessions avant pause longue
};
```

### Changer les couleurs

Modifiez les variables CSS dans `src/index.css` :

```css
:root {
  --focus-color: #e74c3c;      /* Rouge pour concentration */
  --short-break-color: #27ae60; /* Vert pour pause courte */
  --long-break-color: #2980b9;  /* Bleu pour pause longue */
}
```

### Personnaliser les fonds

Modifiez les classes CSS dans `src/index.css` :

```css
body.focus-mode {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}
```

## 🎯 Technique Pomodoro

La technique Pomodoro est une méthode de gestion du temps développée par Francesco Cirillo dans les années 1980. Elle utilise un minuteur pour découper le travail en intervalles :

1. **Choisissez une tâche** à accomplir
2. **Réglez le minuteur** sur 25 minutes (un "pomodoro")
3. **Travaillez** sur la tâche jusqu'à ce que le minuteur sonne
4. **Prenez une courte pause** de 5 minutes
5. **Tous les 4 pomodoros**, prenez une pause plus longue de 15-30 minutes

Cette méthode aide à :
- Maintenir la concentration
- Réduire la procrastination
- Améliorer la productivité
- Mieux gérer le temps
- Éviter l'épuisement mental

## 🐛 Dépannage

### Le CSS ne s'applique pas

1. Vérifiez que Tailwind est installé : `npm list tailwindcss`
2. Vérifiez que `src/index.css` est importé dans `src/main.tsx`
3. Vérifiez la configuration dans `tailwind.config.js`
4. Redémarrez le serveur de développement

### Les statistiques ne se sauvegardent pas

1. Vérifiez que votre navigateur autorise localStorage
2. Consultez la console pour les erreurs JavaScript
3. Vérifiez les paramètres de confidentialité du navigateur

### Le son ne fonctionne pas

1. Vérifiez que votre navigateur autorise l'audio
2. Certains navigateurs bloquent l'audio automatique
3. Interagissez avec la page avant de lancer le timer

## 🤝 Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Idées d'améliorations

- [ ] Notifications push
- [ ] Mode sombre/clair
- [ ] Sons personnalisables
- [ ] Export des statistiques
- [ ] Synchronisation cloud
- [ ] Liste de tâches intégrée
- [ ] Statistiques hebdomadaires/mensuelles
- [ ] Mode plein écran
- [ ] Raccourcis clavier

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- Inspiration : Technique Pomodoro de Francesco Cirillo
- Icônes : SVG inline
- Police : Inter (Google Fonts)
- Framework : Vite, React, Tailwind CSS

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub.

---

**Bon travail et restez concentré !** 🍅✨
