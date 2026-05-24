# Composite Action : Scan IaC (Checkov)

Scan des fichiers Infrastructure-as-Code via [Checkov](https://www.checkov.io/),
outil maintenu par Bridgecrew puis Prisma Cloud (Palo Alto Networks).

## Frameworks supportes

Checkov supporte plus de 30 frameworks IaC. Configuration par defaut dans ce
projet :

- `dockerfile` : Dockerfile et bonnes pratiques de containerisation
- `github_actions` : workflows GitHub Actions (permissions excessives, etc.)
- `secrets` : detection de secrets en complement de Gitleaks

Frameworks additionnels disponibles : `terraform`, `kubernetes`,
`cloudformation`, `helm`, `serverless`, etc.

## Utilisation

```yaml
- name: Scan IaC
  uses: ./.github/actions/iac
  with:
    directory: '.'
    framework: 'dockerfile,github_actions'
    soft-fail: 'true'
```

## Inputs

| Nom             | Type    | Defaut                                | Description                          |
|-----------------|---------|---------------------------------------|--------------------------------------|
| `directory`     | string  | `.`                                   | Dossier a scanner                    |
| `framework`     | string  | `dockerfile,github_actions,secrets`   | Frameworks Checkov                   |
| `output-format` | string  | `sarif`                               | Format de sortie                     |
| `soft-fail`     | string  | `true`                                | Pas d'echec CI sur findings          |

## Outputs et artefacts

- Artifact `iac-reports` : rapport SARIF + dossier complet, retention 30 jours
- Onglet "Security" GitHub : findings remontes en alertes natives
- Annotations `::warning::` dans l'UI Actions

## Pourquoi SARIF par defaut

Le format SARIF (Static Analysis Results Interchange Format) est un standard
OASIS pour les rapports de scan. GitHub l'integre nativement : un upload via
`github/codeql-action/upload-sarif@v3` remonte les findings dans l'onglet
"Security" du repo, en parallele des artifacts JSON pour audit hors-ligne.
