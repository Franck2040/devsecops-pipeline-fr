# DevSecOps Pipeline FR

> Template GitHub reutilisable pour CI/CD securise en contexte francais et europeen.
> 7 couches de scan, mapping ANSSI/NIS2/DORA, SBOM CycloneDX, threat model STRIDE.

[![DevSecOps Pipeline](https://github.com/Franck2040/devsecops-pipeline-fr/actions/workflows/pipeline.yml/badge.svg)](https://github.com/Franck2040/devsecops-pipeline-fr/actions/workflows/pipeline.yml)
[![Release SBOM](https://github.com/Franck2040/devsecops-pipeline-fr/actions/workflows/release.yml/badge.svg)](https://github.com/Franck2040/devsecops-pipeline-fr/actions/workflows/release.yml)
[![DAST Nightly](https://github.com/Franck2040/devsecops-pipeline-fr/actions/workflows/dast-nightly.yml/badge.svg)](https://github.com/Franck2040/devsecops-pipeline-fr/actions/workflows/dast-nightly.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Vue d'ensemble

Ce repo est un **template GitHub**. Il fournit un pipeline DevSecOps pret a
forker pour demarrer un projet avec une securite shift-left deja industrialisee.

Le pipeline se decompose en 7 composite actions reutilisables, reparties en
trois workflows selon leur cycle de vie :

### Workflow principal (`pipeline.yml`) - sur push et PR

| # | Couche           | Outil principal       | Composite action            |
|---|------------------|-----------------------|-----------------------------|
| 1 | Secrets          | Gitleaks              | `.github/actions/secrets`   |
| 2 | SAST             | Semgrep               | `.github/actions/sast`      |
| 3 | SCA dependances  | Trivy fs + npm audit  | `.github/actions/sca`       |
| 4 | IaC / Dockerfile | Checkov               | `.github/actions/iac`       |
| 5 | Container image  | Trivy image           | `.github/actions/container` |

### Workflow release (`release.yml`) - sur release published

| # | Couche | Outil | Composite action |
|---|--------|-------|------------------|
| 6 | SBOM | Syft (CycloneDX + SPDX) | `.github/actions/sbom` |

### Workflow nightly (`dast-nightly.yml`) - cron quotidien 3h UTC

| # | Couche | Outil | Composite action |
|---|--------|-------|------------------|
| 7 | DAST | OWASP ZAP baseline | `.github/actions/dast` |

Une application de demonstration (`app/`) prouve le bon fonctionnement du
pipeline en exposant 9 vulnerabilites volontaires cataloguees dans
[docs/vulnerabilities.md](docs/vulnerabilities.md).

## Positionnement francais et europeen

| Referentiel                    | Mapping documente dans                |
|--------------------------------|---------------------------------------|
| ANSSI guide d'hygiene          | `docs/compliance/anssi-hygiene.md`    |
| Directive NIS2                 | `docs/compliance/nis2.md`             |
| Reglement DORA                 | `docs/compliance/dora.md`             |
| EU Cyber Resilience Act (CRA)  | `docs/compliance/eu-cra.md`           |

**Formats SBOM** : CycloneDX 1.5 (pousse par UE/ENISA) **et** SPDX 2.3
(ISO/IEC 5962:2021). Les deux generes a chaque release et attaches comme
assets pour conformite multi-referentiel.

## Utilisation comme template

1. Cliquer sur "Use this template" sur la page GitHub du repo.
2. Renommer l'app sous `app/` pour la votre.
3. Adapter `policies/` et `.gitleaks.toml` a vos seuils.
4. Les composite actions sous `.github/actions/` sont pretes a l'emploi.

## Visualiser les findings

Trois canaux complementaires :

- **Onglet Actions** : annotations `::warning::` directement sur chaque run
- **Onglet Security** du repo : findings SARIF de Checkov et Trivy image
- **Artifacts** : rapports JSON complets pour audit hors-ligne

## Tester manuellement chaque layer

```bash
# Layer 1-5 : declenche par tout push, ou manuellement :
gh workflow run pipeline.yml

# Layer 6 (SBOM) : declenche par release publication, ou :
gh workflow run release.yml

# Layer 7 (DAST) : declenche en cron quotidien, ou :
gh workflow run dast-nightly.yml
```

## Documentation

- [Architecture du pipeline (diagramme)](diagrams/README.md)
- [Threat model STRIDE](docs/threat-model.md)
- [ADR (Architecture Decision Records)](docs/adr/)
  - [ADR-0001 : Template repository et composite actions](docs/adr/0001-template-and-composite-actions.md)
  - [ADR-0002 : Choix des scanners SAST et SCA](docs/adr/0002-choice-of-sast-sca-scanners.md)
  - [ADR-0003 : Post-build scanning et lecons supply chain](docs/adr/0003-post-build-scanning-and-supply-chain-lessons.md)
  - [ADR-0004 : Strategie SBOM et DAST](docs/adr/0004-sbom-and-dast-strategy.md)
- [Catalogue des vulnerabilites volontaires](docs/vulnerabilities.md)

## Licence

MIT, voir [LICENSE](LICENSE).

## Auteur

Calixte Franck Kenmeugne, etudiant Bachelor ASRC a IMIE Paris.
Portfolio : [kenmeugnecalixte.com](https://kenmeugnecalixte.com)
