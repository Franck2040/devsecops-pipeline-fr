# ADR-0004 : Strategie SBOM et DAST, decouplage des triggers

## Status

Accepted

## Context

Apres la phase 5, le pipeline couvre 5 des 7 couches DevSecOps prevues. Il
reste a integrer :

1. **SBOM (Software Bill of Materials)** : genese et publication d'un
   inventaire complet des composants logiciels, exigence montante des
   regulateurs (NIS2, DORA, EU Cyber Resilience Act 2027).
2. **DAST (Dynamic Application Security Testing)** : scan runtime de l'app
   en execution, complementaire au SAST statique.

Une decision architecturale s'impose : faut-il les integrer au workflow
principal `pipeline.yml` qui tourne a chaque push, ou les decoupler dans
des workflows dedies ?

## Considered Options

### Strategie de declenchement

| Option                                  | Pour                                              | Contre                                              | Verdict      |
|-----------------------------------------|---------------------------------------------------|-----------------------------------------------------|--------------|
| Tout dans pipeline.yml, a chaque push   | Vue unifiee dans un seul workflow                 | DAST de 5-8 min ralentit chaque commit              | Rejete       |
| Tout dans pipeline.yml, avec conditions if | Reste centralise                              | Logique conditionnelle complexe et fragile          | Rejete       |
| **Workflows separes par cycle de vie**  | Decouplage propre, chaque scan a son trigger      | Plus de fichiers a maintenir                        | **Retenu**   |

### Format SBOM

| Option                | Pour                                              | Contre                                             | Verdict      |
|-----------------------|---------------------------------------------------|----------------------------------------------------|--------------|
| CycloneDX uniquement  | Standard OWASP, pousse par UE/ENISA               | Certains clients/regulateurs preferent SPDX        | Insuffisant  |
| SPDX uniquement       | ISO/IEC 5962:2021                                 | Moins riche en metadata securite                   | Insuffisant  |
| **Les deux**          | Compatibilite maximale, cout marginal             | Trois fichiers a publier au lieu d'un             | **Retenu**   |

### Outil DAST

| Option                | Pour                                              | Contre                                             | Verdict      |
|-----------------------|---------------------------------------------------|----------------------------------------------------|--------------|
| **OWASP ZAP baseline**| Open-source, maintenu par OWASP, free             | 5-8 min par scan                                   | **Retenu**   |
| Burp Suite Pro CLI    | Reference industrie                               | Licence payante, pas adapte au portfolio           | Rejete       |
| Nuclei                | Rapide, communautaire                             | Moins focus DAST web, plus generaliste             | Considere    |

## Decision

Le pipeline est decouple en **trois workflows GitHub Actions** :

1. **`pipeline.yml`** declenche sur `push` et `pull_request` :
   layers 1-5 (Secrets, SAST, SCA, IaC, Container)
2. **`release.yml`** declenche sur `release: published` et `workflow_dispatch` :
   layer 6 (SBOM)
3. **`dast-nightly.yml`** declenche sur `schedule (cron 0 3 * * *)` et
   `workflow_dispatch` : layer 7 (DAST)

Chaque workflow a un cycle de vie clair :

- Les scans "code et build" sont sur le chemin critique du developpeur (push/PR)
- Le SBOM est genere lors d'un release event explicite, et attache comme asset
- Le DAST tourne hors heures de pic, sans bloquer le developpement

## Consequences

### Positive

- Le developpeur garde un feedback rapide sur push (1 a 2 min, pas 8 min)
- Le SBOM accompagne chaque release sans intervention manuelle
- Le DAST tourne quotidiennement, suffisant pour detecter les regressions
  d'expositions sans surcharger la CI
- Chaque workflow peut etre lance manuellement via `workflow_dispatch` pour
  tests ad-hoc

### Negative

- Trois fichiers de workflow a maintenir au lieu d'un
- Pas de "build status" unique pour le repo (chaque workflow a son badge)
- Le DAST peut detecter une vulnerabilite jusqu'a 24h apres son introduction

### Risks et mitigations

| Risque                                          | Mitigation                                                       |
|-------------------------------------------------|------------------------------------------------------------------|
| Container DAST oublie en cas d'echec mi-scan    | Step `Stop app container` avec `if: always()`                    |
| Issue ZAP qui spam le repo a chaque scan        | Action ZAP reutilise la meme issue (issue_title pin)            |
| SBOM faux a cause d'un build non reproductible  | `package-lock.json` commite (regle SCA existante)               |
| Cron 3h UTC perturbe par maintenance GitHub     | `workflow_dispatch` permet un run manuel a tout moment           |

## Compliance

Cette decision impacte directement plusieurs referentiels :

- **EU Cyber Resilience Act (CRA, enforcement decembre 2027)** : exige un SBOM
  publie avec chaque release de produit logiciel. Le workflow `release.yml`
  satisfait cette exigence.
- **NIS2 Annexe I §2(d)** : securite dans le developpement. Le DAST quotidien
  contribue a la detection continue.
- **DORA (Digital Operational Resilience Act)** : exige tests reguliers de
  resilience operationnelle. Le DAST nightly fournit la trace d'audit.
- **NIST SSDF (SP 800-218)** : RV.1.1 (test de la securite executable),
  RV.1.2 (test de la securite des dependances avec SBOM).

## Links

- [CycloneDX specification](https://cyclonedx.org/specification/overview/)
- [SPDX specification](https://spdx.dev/specifications/)
- [OWASP ZAP baseline scan documentation](https://www.zaproxy.org/docs/docker/baseline-scan/)
- [EU Cyber Resilience Act overview](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act)
- [Action officielle anchore/sbom-action](https://github.com/anchore/sbom-action)
- [Action officielle zaproxy/action-baseline](https://github.com/zaproxy/action-baseline)
