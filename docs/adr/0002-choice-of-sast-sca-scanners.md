# ADR-0002 : Choix des outils de scans SAST (Semgrep) et SCA (Trivy)

## Status

Accepted

## Context

L'intégration continue sécurisée du projet doit disposer de scanners pour deux couches essentielles :
1. **SAST (Static Application Security Testing)** : Vérifier les vulnérabilités injectées dans le code source de l'application (ex: SQLi, XSS).
2. **SCA (Software Composition Analysis)** : Auditer les dépendances open-source déclarées dans `package-lock.json` afin de détecter des CVE connues.

Pour maintenir un positionnement "souveraineté numérique", "RGPD-compliant" et "coût zéro", les outils retenus doivent s'exécuter localement, sans dépendances d'API SaaS américaines (comme Snyk ou SonarCloud), tout en restant rapides et hautement intégrables dans des pipelines basés sur des micro-conteneurs.

## Considered Options

### Solution SAST (Analyse Statique)

| Option | Pour | Contre | Verdict |
|---|---|---|---|
| **SonarQube (Self-hosted)** | Extrêmement complet, supporte plus de 30 langages, rapports visuels riches. | Nécessite un serveur dédié lourd (>4 Go RAM), difficile à orchestrer en composite action légère. | Rejeté |
| **CodeQL (GitHub Native)** | Analyse sémantique profonde via graphes de flux de données, natif GitHub. | Lourd à exécuter (build complet), configurations complexes pour des projets non-standard, nécessite GHAS en entreprise privée. | Conservé en option optionnelle |
| **Semgrep (CLI Open-Source)** | Ultra-rapide, règles écrites en YAML très lisibles, s'installe via un simple `pip install` en 10 secondes. S'exécute 100% localement. | Analyse de flux de données moins profonde que CodeQL sur des scénarios complexes multi-fichiers. | **Retenu comme standard** |

### Solution SCA (Sécurité des dépendances)

| Option | Pour | Contre | Verdict |
|---|---|---|---|
| **Snyk (SaaS)** | Base de données de vulnérabilités exceptionnelle, excellents rapports. | Requiert un compte cloud, envoie l'arbre de dépendances sur des serveurs tiers (US), plan gratuit restreint. | Rejeté (souveraineté + coût) |
| **Dependabot (GitHub Native)** | Alertes et PR de remédiation automatiques et transparentes. | Pas de génération de rapport exportable en unitaire, impossible d'intégrer dans un pipeline non-GitHub (ex: GitLab/local). | Conservé en couche secondaire passive |
| **Trivy (Aqua Security)** | S'exécute 100% localement. Base de vulnérabilités mise à jour à chaque run. Scanner universel (FS, images docker, IaC, SBOM). | Nécessite un téléchargement binaire (géré dans l'action). | **Retenu comme standard universel** |

## Decision

1. **SAST : Semgrep** est sélectionné pour sa légèreté et sa modularité. Il permet de scanner et de retourner des rapports complets au format standard de l'industrie **SARIF**.
2. **SCA : Trivy** est sélectionné comme outil unique de composition. Son choix est hautement stratégique car il sera réutilisé pour la Phase 5 (analyse de l'image Docker finale) et la Phase 6 (génération de SBOM), unifiant ainsi notre boîte à outils. Nous le doublons d'un `npm audit` natif léger.

## Consequences

### Positive
- **Indépendance souveraine** : Aucun code source, métadonnée ou manifeste n'est envoyé à des APIs cloud tierces. Tout est calculé dans le runner virtuel GitHub.
- **Vitesse** : Les deux outils s'installent et s'exécutent en moins de 30 secondes cumulées.
- **Interopérabilité** : Production de rapports standardisés JSON et SARIF intégrables dans n'importe quel SIEM ou SOC (dont Wazuh / Splunk).

### Negative
- Semgrep requiert un environnement avec Python configuré pour l'installation par `pip3`.

## Links
- [Semgrep ruleset registry](https://semgrep.dev/explore)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [ADR-0001 : Choix du template et composite actions](./0001-template-and-composite-actions.md)
