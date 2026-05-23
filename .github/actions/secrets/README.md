# Composite Action : Scan secrets

Wrapper standardise autour de [Gitleaks](https://github.com/gitleaks/gitleaks)
pour detection de secrets hardcodes.

## Utilisation

```yaml
- name: Scan secrets
  uses: ./.github/actions/secrets
  with:
    config-path: '.gitleaks.toml'
    fail-on-finding: 'true'
```

## Inputs

| Nom                | Type    | Defaut             | Description                                            |
|--------------------|---------|--------------------|--------------------------------------------------------|
| `config-path`      | string  | `.gitleaks.toml`   | Chemin du fichier de config Gitleaks                   |
| `gitleaks-version` | string  | `8.21.2`           | Version a installer                                    |
| `upload-artifact`  | string  | `true`             | Upload du rapport JSON                                 |
| `fail-on-finding`  | string  | `true`             | Faire echouer le job sur finding non exempte           |

## Outputs et artifacts

- Artifact `gitleaks-report` : rapport JSON, retention 30 jours.
- Annotations GitHub `::notice::` / `::warning::` / `::error::` selon resultat.

## Prerequis dans le workflow appelant

- `actions/checkout@v4` avec `fetch-depth: 0` (gitleaks scanne l'historique git).
