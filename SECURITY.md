# Politique de sécurité

## Versions supportées

Ce projet est un template DevSecOps à but pédagogique et démonstratif.
Seule la branche `main` est maintenue.

| Version | Supportée |
|---------|-----------|
| main    | Oui       |
| autres  | Non       |

## Signalement d'une vulnérabilité

Le code applicatif sous `app/` contient des vulnérabilités **volontaires**,
documentées dans `docs/vulnerabilities.md`. Elles font partie intégrante de la
démonstration du pipeline et ne doivent pas être signalées.

Pour toute vulnérabilité **involontaire** affectant le pipeline lui-même
(composite actions, scripts, infrastructure), procéder à un signalement
coordonné :

1. Ne pas ouvrir d'issue publique.
2. Envoyer un mail à `kenmeugnetchoupo@gmail.com` avec :
   - Description de la vulnérabilité
   - Étapes de reproduction
   - Impact estimé
3. Délai de réponse cible : 72 heures ouvrées.

## Périmètre

Inclus :

- Composite actions sous `.github/actions/`
- Scripts sous `scripts/`
- Configuration de scan sous `policies/`

Exclus :

- Vulnérabilités intentionnelles de l'app `incident-tracker` (voir `docs/vulnerabilities.md`)
- Dépendances tierces (utiliser les canaux upstream)
