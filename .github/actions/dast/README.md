# Composite Action : DAST (OWASP ZAP baseline)

Lance l'application incident-tracker dans un container, attend qu'elle reponde,
puis execute un scan OWASP ZAP baseline contre `http://localhost:3000`.

## Pourquoi DAST en complement de SAST

| Vulnerabilite trouvee | Detectable par SAST ? | Detectable par DAST ? |
|-----------------------|----------------------|----------------------|
| SQL injection (VULN-001) | Oui (analyse de code) | Oui (probe runtime)  |
| XSS reflected (VULN-002) | Oui                  | Oui                  |
| Header HSTS manquant     | Non                  | **Oui uniquement**   |
| Cookies sans Secure flag | Partiel              | **Oui uniquement**   |
| Misconfig serveur HTTP   | Non                  | **Oui uniquement**   |

DAST attrape ce que SAST ne peut pas voir : configuration runtime, headers HTTP,
comportement effectif du serveur. C'est complementaire, pas redondant.

## Utilisation

```yaml
- name: Scan DAST
  uses: ./.github/actions/dast
```

## Inputs

| Nom              | Type    | Defaut    | Description                              |
|------------------|---------|-----------|------------------------------------------|
| `app-port`       | string  | `3000`    | Port d'ecoute de l'app                   |
| `health-path`    | string  | `/health` | Endpoint health-check                    |
| `fail-on-finding`| string  | `false`   | Echec CI si findings (par defaut non)    |

## Artefacts produits

- `zap_scan` (artifact GitHub) : rapport HTML + JSON + XML genere par ZAP
- **GitHub Issue maintenue automatiquement** : l'action ZAP cree ou met a jour
  une issue avec les findings actifs, evitant le spam d'issues.

## Pourquoi nightly et pas sur push

ZAP baseline prend 5 a 8 minutes par scan. L'executer a chaque push :
- Ralentirait severement les developpeurs
- N'apporte pas plus d'info qu'une fois par 24h (le code change peu vite)

Le nightly a 3h UTC garantit une couverture quotidienne sans gener.
Pour test ad-hoc : `gh workflow run dast-nightly.yml`.
