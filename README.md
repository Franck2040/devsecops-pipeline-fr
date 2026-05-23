# DevSecOps Pipeline FR

> Template GitHub réutilisable pour CI/CD sécurisé en contexte français et européen.
> 7 couches de scan, mapping ANSSI/NIS2/DORA, SBOM CycloneDX, threat model STRIDE.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Vue d'ensemble

Ce repo est un **template GitHub**. Il fournit un pipeline DevSecOps prêt à
forker pour démarrer un projet avec une sécurité shift-left déjà industrialisée.

Le pipeline se décompose en 7 composite actions réutilisables :

| Couche           | Outil principal       | Trigger          |
|------------------|-----------------------|------------------|
| Secrets          | Gitleaks              | Push + PR        |
| SAST             | Semgrep + CodeQL      | PR               |
| SCA dépendances  | Trivy fs + npm audit  | PR               |
| IaC / Dockerfile | Checkov               | PR               |
| Container image  | Trivy image           | Build            |
| SBOM             | Syft (CycloneDX+SPDX) | Release          |
| DAST             | OWASP ZAP baseline    | Nightly + manuel |

Une application de démonstration (`app/incident-tracker`) prouve le bon
fonctionnement du pipeline en exposant des vulnérabilités volontaires
cataloguées dans [docs/vulnerabilities.md](docs/vulnerabilities.md).

## Positionnement français et européen

| Référentiel           | Mapping documenté dans                |
|-----------------------|---------------------------------------|
| ANSSI guide d'hygiène | `docs/compliance/anssi-hygiene.md`    |
| Directive NIS2        | `docs/compliance/nis2.md`             |
| Règlement DORA        | `docs/compliance/dora.md`             |

Format SBOM par défaut : **CycloneDX 1.5** (standard poussé par l'UE et l'ENISA).

## Utilisation comme template

1. Cliquer sur "Use this template" sur la page GitHub du repo.
2. Renommer l'app sous `app/` pour la vôtre.
3. Adapter `policies/` à vos seuils de criticité.
4. Les composite actions sous `.github/actions/` sont prêtes à l'emploi.

## Documentation

- [Architecture du pipeline](diagrams/pipeline.mmd)
- [Threat model STRIDE](docs/threat-model.md)
- [ADR (Architecture Decision Records)](docs/adr/)
- [Catalogue des vulnérabilités volontaires](docs/vulnerabilities.md)

## Licence

MIT, voir [LICENSE](LICENSE).

## Auteur

Calixte Franck Kenmeugne, étudiant Bachelor ASRC à IMIE Paris.
Portfolio : [kenmeugnecalixte.com](https://kenmeugnecalixte.com)
