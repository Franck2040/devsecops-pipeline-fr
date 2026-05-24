# Composite Action : SBOM generation

Genere un Software Bill of Materials via [Syft](https://github.com/anchore/syft),
l'outil maintenu par Anchore. Trois SBOM produits :

- `sbom-repo-cyclonedx.json` : CycloneDX 1.5 du repo complet
- `sbom-repo-spdx.json` : SPDX 2.3 du repo complet
- `sbom-app-cyclonedx.json` : CycloneDX 1.5 du sous-dossier `app/`

## Pourquoi deux formats

| Format     | Maintenu par         | Force                                  |
|------------|----------------------|----------------------------------------|
| CycloneDX  | OWASP                | Pousse par UE/ENISA, riche en metadata sécurité |
| SPDX       | Linux Foundation     | ISO/IEC 5962:2021, fort sur licences   |

Certains regulateurs ou clients exigent un format plutot que l'autre. Generer
les deux maximise la compatibilite (cible EU CRA December 2027, NIS2, DORA).

## Utilisation

```yaml
- name: Generate SBOM
  uses: ./.github/actions/sbom
```

## Inputs

| Nom          | Type    | Defaut | Description                                  |
|--------------|---------|--------|----------------------------------------------|
| `scan-path`  | string  | `.`    | Racine du repo                               |
| `scan-app`   | string  | `app`  | Sous-dossier app a scanner separement        |

## Artefacts produits

- Run normal : artifacts uploades pour 90 jours
- Run sur release published : SBOM attaches comme **release assets**
  (telecharchables depuis la page release sans avoir a fouiller les workflow runs)

## Pourquoi pin sur v0.22.1 et pas v0

`anchore/sbom-action@v0` est un float tag qui suit la derniere 0.x. Pratique
mais expose a des changements non intentionnels. Le projet pin sur v0.22.1
(janvier 2026) pour reproductibilite. Les bumps de version seront geres
manuellement ou via Dependabot.
