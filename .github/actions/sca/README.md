# Composite Action : Scan SCA (Trivy FS & npm audit)

Wrapper réutilisable combinant **Trivy FS** et **npm audit** pour l'analyse de composition logicielle (SCA) et l'identification de CVE dans les dépendances de production.

## Utilisation

```yaml
- name: Scan SCA Dépendances
  uses: ./.github/actions/sca
  with:
    fail-on-finding: 'false'
```

## Inputs

| Nom             | Type   | Défaut   | Description                                                 |
|-----------------|--------|----------|-------------------------------------------------------------|
| `trivy-version` | string | `0.51.1` | Version binaire de Trivy à installer.                       |
| `fail-on-finding` | string | `false`  | Si mis à `true`, bloque le build sur vulnérabilités détectées.|

## Artefacts produits

- Rapport `trivy-sca-report.json` : Détails de scan Trivy.
- Rapport `npm-audit-report.json` : Audit standard de l'écosystème Node.
