# Composite Action : Scan SCA (Software Composition Analysis)

Detection des vulnerabilites dans les dependances Node de l'application.
Utilise deux sources complementaires : Trivy filesystem et npm audit.

## Architecture

Cette action enveloppe l'action officielle `aquasecurity/trivy-action@0.36.0`
plutot que de reinstaller Trivy a la main, pour quatre raisons :

1. Cache automatique du binaire Trivy entre runs (gain de temps)
2. Pas de hit sur la rate limit de l'API GitHub
3. Maintenance par Aqua Security eux-memes (suivi des breaking changes)
4. Reproductibilite (pinning sur 0.36.0)

## Utilisation

```yaml
- name: Scan SCA
  uses: ./.github/actions/sca
  with:
    scan-path: '.'
    app-dir: 'app'
    fail-on-finding: 'false'
```

## Inputs

| Nom               | Type    | Defaut                     | Description                                |
|-------------------|---------|----------------------------|--------------------------------------------|
| `scan-path`       | string  | `.`                        | Chemin a scanner par Trivy                 |
| `app-dir`         | string  | `app`                      | Dossier de l'app Node pour npm audit       |
| `trivy-severity`  | string  | `CRITICAL,HIGH,MEDIUM`     | Niveaux de severite a reporter             |
| `fail-on-finding` | string  | `false`                    | Faire echouer la CI si findings detectes   |

## Outputs et artefacts

- Artifact `sca-reports` (retention 30 jours) :
  - `trivy-sca-report.json` : rapport complet Trivy
  - `npm-audit-report.json` : rapport npm audit
- Annotations `::notice::` et `::warning::` dans l'UI GitHub

## Prerequis dans le workflow appelant

- `actions/checkout@v4`
- Node deja installe dans le runner (par defaut sur ubuntu-latest)
