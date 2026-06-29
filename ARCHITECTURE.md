# Architecture NCR Quiz SST

## Application

- `quizz.html` : application PWA principale, interface, logique quiz, mode examinateur, modes élèves et Firebase.
- `Sw.js` : service worker et cache hors-ligne.
- `manifest.json` : manifeste PWA.

## Banques de questions

Les situations SST sont indépendantes dans `modules/`.

- `modules/manifest.json` liste les modules chargés par l'application.
- Chaque fichier `modules/*.json` contient un module avec ses métadonnées et sa banque de questions.
- Pour ajouter un module, créer un nouveau fichier JSON puis l'ajouter dans `modules/manifest.json`.

Format minimal d'une question :

```json
{
  "id": "module-001",
  "difficulty": "facile",
  "category": "Reconnaissance",
  "q": "Question ?",
  "a": ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
  "c": 0,
  "e": "Explication affichée en correction.",
  "commonError": "Erreur fréquente.",
  "advice": "Conseil de révision."
}
```

## Données Firebase

Les chemins utilisés sont structurés ainsi :

- `users/students` : comptes élèves privés.
- `users/groups` : groupes.
- `progression` : progression des sessions libres.
- `examens` : tentatives, notes, erreurs, dates et durées.
- `statistiques` : réservé aux agrégats futurs.
- `users_progress` : ancien chemin lu/écrit pour compatibilité.

## Sécurité

Le mot de passe examinateur protège l'interface côté client. Les mots de passe élèves privés sont hashés avec un sel avant stockage. Pour une sécurité forte en production, configurer aussi des règles Firebase Realtime Database adaptées.
