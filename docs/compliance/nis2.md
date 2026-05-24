# Mapping NIS2 - Directive europeenne

Mapping vers la **Directive (UE) 2022/2555 - NIS2** (Network and Information
Security 2), transposee en droit francais en octobre 2024. NIS2 impose des
obligations de cybersecurite aux entites essentielles et importantes.

L'**Annexe I §2** liste 10 mesures techniques et organisationnelles minimales.
Ce document mappe les elements du pipeline vers ces mesures.

Reference : [Directive NIS2 sur EUR-Lex](https://eur-lex.europa.eu/eli/dir/2022/2555/oj)

## Annexe I §2 : mesures techniques et organisationnelles

| Mesure NIS2                                                      | Element du projet                                                          | Statut          |
|------------------------------------------------------------------|----------------------------------------------------------------------------|-----------------|
| §2(a) Politiques d'analyse des risques et SI                     | Threat model STRIDE complet (`docs/threat-model.md`), 24 menaces documentees | Implemente     |
| §2(b) Gestion des incidents                                      | Application de demo `incident-tracker` (mais pas de procedure operationnelle) | Demonstration |
| §2(c) Continuite d'activite et gestion des crises                | Hors scope template, releve de la PSSI utilisatrice                        | Non applicable  |
| §2(d) Securite de la chaine d'approvisionnement                  | SBOM CycloneDX + SPDX a chaque release, pinning actions, ADR-0003 supply chain | Implemente   |
| §2(e) Securite de l'acquisition, du developpement et de la maintenance | 7 layers DevSecOps : Secrets, SAST, SCA, IaC, Container, SBOM, DAST    | Implemente      |
| §2(f) Politiques d'evaluation de l'efficacite des mesures        | Pipeline tournant a chaque push + DAST nightly = evaluation continue         | Implemente      |
| §2(g) Hygiene cyber de base et formation                         | Documentation pedagogique du projet (ADR, threat model, README detaille)     | Implemente      |
| §2(h) Politiques et procedures relatives a la cryptographie      | JWT signing (mais avec secret faible volontaire pour demo)                   | Demonstration   |
| §2(i) Securite des ressources humaines, controle d'acces, gestion des actifs | Permissions `GITHUB_TOKEN` minimales declaratives par workflow      | Implemente      |
| §2(j) Authentification multi-facteur                             | Hors scope application demo, releve de l'utilisateur du template            | Non applicable  |

## Couverture detaillee §2(d) Supply chain

La securite de la chaine d'approvisionnement est centrale dans NIS2 (le mot
"chaine" apparait 47 fois dans la directive). Le projet couvre :

| Element supply chain                          | Implementation                                              |
|-----------------------------------------------|-------------------------------------------------------------|
| Inventaire des composants                     | SBOM CycloneDX + SPDX a chaque release                      |
| Detection de vulnerabilites dependances       | Trivy SCA + npm audit (Layer 3)                             |
| Detection de vulnerabilites image container   | Trivy image scan (Layer 5)                                  |
| Verification d'integrite des actions tierces  | Pinning sur tags versionnes immutables                      |
| Documentation des choix supply chain          | ADR-0003 (incident Aqua mars 2026), ADR-0004 (SBOM)         |
| Test runtime de la chaine assemblee           | DAST OWASP ZAP nightly                                      |

## Couverture detaillee §2(e) Securite developpement

| Element developpement                         | Implementation                                              |
|-----------------------------------------------|-------------------------------------------------------------|
| Detection secrets dans code et historique     | Gitleaks avec scan de l'historique complet (fetch-depth: 0) |
| Analyse statique du code                      | Semgrep avec ruleset par defaut + custom                    |
| Analyse des configurations IaC                | Checkov sur Dockerfile et workflows GitHub Actions          |
| Tests de penetration automatises              | OWASP ZAP baseline en nightly                               |
| Documentation des decisions architecturales   | 4 ADRs format Michael Nygard                                |

## Conclusion

Le projet implemente directement 6 des 10 mesures §2 (a, d, e, f, g, i),
fournit une demonstration pedagogique pour 2 (b, h), et laisse 2 hors scope
(c, j) qui relevent de la PSSI utilisatrice.

Pour une entite NIS2 (essentielle ou importante), ce template fournit la
brique technique CI/CD prete a l'emploi pour couvrir les exigences de
developpement et de chaine d'approvisionnement.
