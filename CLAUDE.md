# Roadmap App

Application de roadmap interactive avec flow editor, drag & drop et integration Miro.

## Stack

- React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4
- State: Zustand | Flow: @xyflow/react | DnD: @dnd-kit
- MCP: Miro (HTTP) pour boards et diagrammes

## Conventions code

Voir `.claude/rules/` pour le detail (react-conventions, typescript-conventions).
Principes cles : composants fonctionnels, Zustand (pas de Context), strict TS (pas de `any`), Tailwind + `clsx`.

## Conventions Miro

- Toujours demander l'URL du board si elle n'est pas fournie
- Appeler `diagram_get_dsl` avant de creer un diagramme pour obtenir la syntaxe correcte
- Utiliser `context_explore` en premier pour comprendre le contenu d'un board
- Doc API : https://developers.miro.com

## Tests

- Vitest + @testing-library/react - voir `.claude/rules/testing.md`
- Toujours tester : d'abord le fichier modifie, puis la suite complete

## Git

- Conventional commits : `type(scope): description`
- Scopes : ui, components, flow, dnd, store, config, deps, styles
- Toujours utiliser `/commit` pour committer
