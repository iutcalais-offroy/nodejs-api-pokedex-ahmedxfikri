# Guide de contribution

Comment travailler sur ce projet ?

## 1. Avant de commencer

```bash
# Installe les dépendances
npm install

# Installe les git hooks
npm install
```

## 2. Pendant le développement

```bash
# Lance le serveur de dev (auto-reload)
npm run dev

# Lance les tests en continu
npm test:ui
```

## 3. Avant de commit

```bash
# Corrige les erreurs de linting automatiquement
npm run lint:fix

# Formate le code
npm run format

# Vérifie qu'il n'y a pas d'erreurs
npm run lint
npm run ts:check
npm run test
```

## 4. Messages de commit

Utilise le format Conventional Commits :

```
type: description courte

Exemple:
- feat: add user authentication
- fix: prevent duplicate cards in deck
- test: add validation tests
- docs: update README
```

Types acceptés : `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

## 5. Pull Request

- Crée une branche pour ta feature : `git checkout -b feat/ma-feature`
- Fais des commits clairs
- Pousse : `git push origin feat/ma-feature`
- Crée une PR sur GitHub
- La CI doit passer (lint, format, tests)

## Commandes utiles

```bash
npm run dev          # Dev avec auto-reload
npm run lint:fix     # Répare les erreurs
npm run format       # Formate tout
npm test             # Tests
npm run ts:check     # Vérifie les types
npm run build        # Build pour la prod
```

Des questions ? Ouvre une issue.

