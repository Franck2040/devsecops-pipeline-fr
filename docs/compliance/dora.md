# Mapping DORA - Reglement europeen

Mapping vers le **Reglement (UE) 2022/2554 - DORA** (Digital Operational
Resilience Act), entree en application le 17 janvier 2025. DORA s'applique
au secteur financier europeen et impose des obligations de resilience
operationnelle face aux risques numeriques.

Ce document mappe les elements du pipeline vers les piliers DORA pertinents
pour un projet CI/CD.

Reference : [Reglement DORA sur EUR-Lex](https://eur-lex.europa.eu/eli/reg/2022/2554/oj)

## Pilier 1 : Gestion du risque TIC (Articles 5-15)

| Exigence DORA                                              | Element du projet                                              | Statut         |
|------------------------------------------------------------|----------------------------------------------------------------|----------------|
| Art. 6 : cadre de gestion du risque TIC                   | Threat model STRIDE + ADR documentent les risques techniques  | Implemente     |
| Art. 8 : identification des fonctions et actifs TIC       | SBOM CycloneDX liste tous les composants                       | Implemente     |
| Art. 9 : protection et prevention                          | 5 layers DevSecOps shift-left + DAST nightly                   | Implemente     |
| Art. 10 : detection                                        | Annotations CI + onglet GitHub Security + issue ZAP automatique | Implemente    |
| Art. 11 : reponse et recuperation                          | Hors scope template, releve de la PSSI utilisatrice            | Non applicable |
| Art. 13 : apprentissage et evolution                       | Documentation des incidents (ADR-0003 Aqua) et lecons apprises | Implemente     |

## Pilier 2 : Gestion des incidents TIC (Articles 17-23)

| Exigence DORA                                              | Element du projet                                              | Statut         |
|------------------------------------------------------------|----------------------------------------------------------------|----------------|
| Art. 17 : processus de gestion des incidents               | Application demo `incident-tracker` (illustration uniquement)  | Demonstration  |
| Art. 19 : notification reglementaire                       | Hors scope technique, processus organisationnel                | Non applicable |

## Pilier 3 : Tests de resilience operationnelle (Articles 24-27)

C'est le pilier le plus directement aligne avec un pipeline DevSecOps.

| Exigence DORA                                              | Element du projet                                              | Statut         |
|------------------------------------------------------------|----------------------------------------------------------------|----------------|
| Art. 24 : programme de tests de resilience                 | DAST nightly + 5 layers a chaque push                          | Implemente     |
| Art. 25(1)(a) : analyse de vulnerabilites                  | Trivy SCA + Trivy image + Semgrep                              | Implemente     |
| Art. 25(1)(b) : analyse de code source                     | Semgrep SAST                                                   | Implemente     |
| Art. 25(1)(c) : tests d'intrusion                          | OWASP ZAP baseline (tests passifs et actifs limites)          | Implemente partiellement |
| Art. 26 : tests fondes sur les menaces (TLPT)              | Hors scope template (red team a part)                         | Non applicable |
| Art. 27 : exigences pour les testeurs                      | Outils certifies industrie (OWASP, Aqua Security, Bridgecrew)  | Implemente     |

## Pilier 4 : Gestion du risque tiers TIC (Articles 28-44)

| Exigence DORA                                              | Element du projet                                              | Statut         |
|------------------------------------------------------------|----------------------------------------------------------------|----------------|
| Art. 28 : principes generaux du risque tiers              | ADR-0003 documente la strategie tiers (pinning, monitoring)    | Implemente     |
| Art. 30(2)(c) : suivi de la chaine de sous-traitance      | SBOM transitive (Syft scanne les dependances de dependances)   | Implemente     |
| Art. 30(2)(g) : strategies de sortie                       | Composite actions reutilisables, peuvent etre forquees         | Implemente     |
| Art. 31 : services TIC supportant des fonctions critiques | Identification via SBOM et categorisation severite Trivy       | Implemente     |

## Pilier 5 : Echange d'informations (Articles 45-49)

| Exigence DORA                                              | Element du projet                                              | Statut         |
|------------------------------------------------------------|----------------------------------------------------------------|----------------|
| Art. 45 : accords de partage volontaire                    | Repo open-source MIT, SBOM publie, threat model partage        | Implemente     |

## Conclusion

Le projet couvre directement le **Pilier 3 (Tests de resilience)** qui est
le coeur technique de DORA, ainsi que des elements significatifs des
Piliers 1 (gestion risque TIC) et 4 (risque tiers).

Pour une entite financiere DORA, ce template fournit la base technique
prouvant la conformite aux Articles 24-25 (programme de tests) et
contribue aux exigences des Articles 28-30 (chaine tiers).
