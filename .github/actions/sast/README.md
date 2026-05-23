# Composite Action : Scan SAST (Semgrep)

Wrapper réutilisable autour de **Semgrep** pour l'analyse statique de sécurité (SAST) du code applicatif.

## Utilisation

```yaml
- name: Scan SAST Semgrep
  uses: ./.github/actions/sast
  with:
    fail-on-finding: 'false'
```

## Inputs

| Nom               | Type   | Défaut  | Description                                                 |
|-------------------|--------|---------|-------------------------------------------------------------|
| `upload-artifact` | string | `true`  | Active l'upload des rapports JSON et SARIF en artifacts.   |
| `fail-on-finding` | string | `false` | Si mis à `true`, fait échouer la CI dès qu'une vuln est trouvée. |

## Artefacts produits

- Rapport `semgrep-report.json` : Détails techniques machine.
- Rapport `semgrep-report.sarif` : Standard SARIF utilisable pour import dans GitHub Security Tab.
