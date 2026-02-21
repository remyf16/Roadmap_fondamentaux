# Guide de démarrage

Salut Rémy ! Voici tout ce qu'il faut pour bosser sur le projet.

## 1. Prérequis

### Installer

- **Node.js 22+** : https://nodejs.org
- **Git** : https://git-scm.com
- **VSCode** : https://code.visualstudio.com
- **Claude Code** (extension VSCode) : chercher "Claude Code" dans le marketplace

### Extensions VSCode recommandées

| Extension                     | Pourquoi                                    |
| ----------------------------- | ------------------------------------------- |
| **Claude Code**               | L'IA qui code avec toi (obligatoire)        |
| **Git Graph**                 | Visualiser les branches et l'historique git |
| **ESLint**                    | Linting TypeScript en temps réel            |
| **Prettier**                  | Formatage automatique                       |
| **Tailwind CSS IntelliSense** | Autocomplétion des classes Tailwind         |
| **Error Lens**                | Erreurs affichées directement dans le code  |

### Setup initial

```bash
git clone git@github.com:utilia-ai-wox/roadmap-remy.git
cd roadmap-remy
npm install
npm run dev
```

L'app tourne sur http://localhost:5173

## 2. Claude Code

Claude Code est une IA intégrée dans VSCode qui comprend tout le projet. Elle a été configurée spécifiquement pour cette codebase.

### Comment l'utiliser

1. Ouvrir le panneau Claude Code dans VSCode (icône dans la sidebar)
2. Taper ta demande en français, Claude répond en français
3. Claude peut lire, écrire, et exécuter du code directement

### Les skills (commandes `/`)

Les skills sont des workflows pré-configurés. Tape `/` dans le chat Claude pour voir la liste.

#### Workflow principal : nouvelle feature

```
/new-feature    ->  Cadrer la feature (explore le code, crée une spec)
/plan-phase     ->  Découper en tâches (crée un PLAN.md)
/implement 1    ->  Implémenter la tâche 1
/implement 2    ->  Implémenter la tâche 2
...etc
```

Exemple concret :

```
> /new-feature Ajouter un filtre par équipe dans la vue Kanban
```

Claude va explorer le code, identifier les fichiers impactés, et créer une spec.

#### Git (tout est automatisé)

Tu n'as **jamais** besoin de faire des commandes git manuellement. Claude gère tout :

- `/commit` -> Commit propre avec message conventionnel
- `/create-pr` -> Crée une PR avec description auto-générée

Quand tu demandes une feature à Claude, il va automatiquement :

1. Créer une branche depuis `develop`
2. Coder et committer régulièrement
3. Lancer les tests
4. Pousser et créer la PR

#### Autres skills

| Skill           | Usage                           |
| --------------- | ------------------------------- |
| `/explore`      | Poser des questions sur le code |
| `/oneshot`      | Feature rapide en un seul coup  |
| `/audit-claude` | Vérifier la config Claude       |
| `/release`      | Préparer une release            |
| `/hotfix`       | Fix urgent en production        |

### Les rules (conventions automatiques)

Claude suit automatiquement ces règles (pas besoin de les rappeler) :

| Rule                     | Ce qu'elle fait                                                   |
| ------------------------ | ----------------------------------------------------------------- |
| `react-conventions`      | Composants fonctionnels, props typées, clsx                       |
| `typescript-conventions` | Strict mode, pas de `any`, imports groupés                        |
| `testing`                | Toujours tester : d'abord le fichier modifié, puis toute la suite |
| `french-ui`              | Bon français : accents, sentence case, vocabulaire cohérent       |
| `git-auto`               | Création de branche, commits, PR automatiques                     |
| `git-workflow`           | Git Flow : main, develop, branches typées                         |

### MCP Servers (outils connectés)

| Serveur      | Ce qu'il fait                                   |
| ------------ | ----------------------------------------------- |
| **Miro**     | Lire/créer des boards et diagrammes Miro        |
| **Context7** | Accéder à la doc à jour de React, Zustand, etc. |

## 3. Structure du projet

```
roadmap-remy/
├── src/                        # Code source
│   ├── components/
│   │   ├── layout/             # Header, Sidebar, ViewSwitcher
│   │   ├── shared/             # Badge, ProgressBar
│   │   ├── tasks/              # TaskDetailPanel
│   │   └── views/              # GraphView, KanbanView, TimelineView
│   ├── store/                  # Zustand (state global)
│   │   └── slices/             # taskSlice, teamSlice, etc.
│   ├── hooks/                  # Hooks custom
│   ├── types/                  # Modèles TypeScript
│   ├── lib/                    # Utilitaires, storage
│   └── data/                   # Données seed
├── .claude/                    # Config Claude Code
│   ├── rules/                  # Règles automatiques
│   ├── skills/                 # Workflows (commandes /)
│   ├── agents/                 # Agents spécialisés
│   └── settings.json           # Permissions, hooks
├── .github/                    # CI/CD, templates PR
├── CLAUDE.md                   # Instructions projet pour Claude
└── package.json                # Dépendances et scripts
```

## 4. Stack technique

| Techno        | Version | Rôle                  |
| ------------- | ------- | --------------------- |
| React         | 19      | UI                    |
| TypeScript    | 5.9     | Typage strict         |
| Vite          | 7       | Build & dev server    |
| Tailwind CSS  | 4       | Styles                |
| Zustand       | 5       | State management      |
| @xyflow/react | 12      | Graphe de dépendances |
| @dnd-kit      | 6/10    | Drag & drop (Kanban)  |
| Vitest        | 4       | Tests unitaires       |
| date-fns      | 4       | Manipulation de dates |
| lucide-react  | -       | Icônes                |

## 5. Commandes utiles

```bash
npm run dev          # Lancer le serveur de dév
npm run build        # Build de production
npm run lint         # Vérifier le code
npm run test         # Tests en mode watch
npm run test:run     # Tests une seule fois
npm run test:coverage # Tests avec couverture
```

## 6. Git Flow

Le projet utilise Git Flow. En résumé :

- **`main`** = production stable
- **`develop`** = intégration
- **`feat/xxx`** = nouvelle feature
- **`fix/xxx`** = correction de bug

Claude gère tout ça automatiquement. Quand tu lui demandes une feature, il crée la branche, code, teste, commit et crée la PR. Toi tu n'as qu'à review et merger.

## 7. Tips

- **Demande en français** : Claude est configuré pour répondre en français
- **Sois spécifique** : "Ajoute un filtre par équipe dans le Kanban" > "Améliore le Kanban"
- **Utilise les skills** : `/new-feature` pour les grosses features, `/oneshot` pour les petits trucs
- **Git Graph** : installe l'extension pour visualiser les branches dans VSCode
- **Ne commit pas manuellement** : laisse Claude gérer via `/commit`
