# ADR-0003 : Strategie de scanning post-build et lecons supply chain

## Status

Accepted

## Context

A partir de la phase 5 du projet, le pipeline ne scanne plus seulement le code
et les dependances declarees, mais aussi l'**image container construite**.
Cela introduit deux questions architecturales :

1. **Que scanner exactement** : seulement les fichiers IaC sources, ou aussi
   l'image construite avec ses dependances effectivement resolues ?
2. **Quelle confiance accorder aux outils tiers utilises par le pipeline** :
   un scanner de securite reste un binaire execute avec des privileges dans
   le runner, donc lui-meme une cible supply chain.

## Considered Options

### Strategie de scanning : pre-build vs post-build

| Option                          | Pour                                              | Contre                                              | Verdict      |
|---------------------------------|---------------------------------------------------|-----------------------------------------------------|--------------|
| Pre-build uniquement            | Rapide, pas de build dans la CI                   | Manque les CVE OS et runtime de l'image effective   | Rejete       |
| Post-build uniquement           | Image reflete la realite                          | Pas de feedback shift-left                          | Rejete       |
| **Les deux (defense en profondeur)** | Feedback rapide ET visibilite finale          | Build supplementaire dans la CI                     | **Retenu**   |

### Confiance aux outils tiers

| Option                              | Pour                                              | Contre                                                 | Verdict        |
|-------------------------------------|---------------------------------------------------|--------------------------------------------------------|----------------|
| Install manuelle inline (curl + tar)| Aucune dependance externe                         | Reinventer la roue, gestion d'erreurs fragile          | Rejete         |
| Action officielle pin par tag       | Simple, maintenu par editeur                      | Tag peut etre reecrit en cas de compromission         | **Retenu (interim)** |
| Action officielle pin par SHA       | Immutable strict                                  | Maintenance manuelle des bumps                         | Cible phase 7  |

## Decision

### Scanning en defense en profondeur

Le pipeline scanne **deux fois** la chaine d'approvisionnement :

- **Layer 3 (SCA)** scanne le `package-lock.json` au repo : feedback shift-left,
  detection immediate des dependances connues comme vulnerables.
- **Layer 5 (Container)** scanne l'image apres `docker build` : detection des
  CVE de l'OS de base, des packages systeme installes par `apk add`, et de la
  runtime Node, qui ne sont pas visibles dans le `package-lock.json`.

Les deux ne se substituent pas, ils se completent.

### Sourcing des actions tierces

Toutes les actions externes du pipeline sont **pinnees sur des tags
immutables versionnes** (ex. `aquasecurity/trivy-action@v0.36.0`,
`bridgecrewio/checkov-action@v12.2999.0`).

Aucune action n'est referencee via `@master` ou `@main`, qui exposeraient le
pipeline a un changement non intentionnel.

Le pinning par SHA commit (forme `@<sha40>`) est planifie pour la phase 7
(release du template), conformement aux recommandations OpenSSF Scorecard
et NIST SP 800-218 (SSDF).

## Consequences

### Positive

- La CI detecte les CVE qui n'apparaitraient qu'apres build (OS, runtime)
- Les findings sont remontes dans l'onglet "Security" de GitHub via SARIF,
  donc visibles sans avoir a fouiller les artifacts
- L'ADR documente une lecon d'incident reelle (cf. Lecons ci-dessous),
  ce qui transforme le repo en support pedagogique
- La discipline de pinning par tag versionne reduit fortement la surface
  d'attaque supply chain

### Negative

- Le job `layer5-container` ajoute ~30 a 60 secondes au pipeline (build)
- Deux scans Trivy (Layer 3 puis Layer 5) augmentent la duree totale,
  meme s'ils sont paralleles
- Le pinning par tag reste vulnerable a un attaquant qui controlerait le
  repo et reecrirait le tag (cf. lecons), d'ou le plan de migration SHA

### Risks et mitigations

| Risque                                                  | Mitigation                                                      |
|---------------------------------------------------------|------------------------------------------------------------------|
| Build casse en CI mais OK en local                      | Le `docker build` utilise le meme Dockerfile, sans secret CI    |
| Tag d'action reecrit par un attaquant                   | Pin par SHA en phase 7 + revue Dependabot des updates           |
| SARIF rate-limite par GitHub Security                   | `continue-on-error: true` sur les uploads SARIF                  |
| Image construite reste sur le runner et fuite           | Runner GitHub ephemere, image jetee a la fin du job             |

## Lecons : incident supply chain Aqua Security (mars 2026)

Pendant le developpement du projet, l'ecosysteme Aqua Security a subi une
attaque supply chain : un attaquant a publie une version malicieuse de
Trivy (v0.69.4) et compromis l'action `aquasecurity/setup-trivy`. En reponse,
Aqua a supprime les anciens tags de `trivy-action` et republie sous une
nomenclature `v*` immutable.

Le pipeline a du etre ajuste : passage de `aquasecurity/trivy-action@0.36.0`
(tag obsolete) vers `aquasecurity/trivy-action@v0.36.0` (tag courant). Cet
incident illustre trois principes :

1. **Aucune action tierce n'est intrinsequement de confiance**, meme
   maintenue par un editeur reconnu.
2. **Le pinning par tag versionne n'est pas suffisant** : un attaquant qui
   controle le repo peut reecrire le tag (verrouillage par SHA recommande).
3. **La maintenance continue est obligatoire** : Dependabot ou equivalent
   doit suivre les bumps de versions et les advisories.

Ce projet documente la mitigation appliquee (pin par tag immutable verifie)
et planifie la migration vers le pin par SHA en phase 7.

## Compliance

- **NIS2 Annexe I §2(d)** : securite dans le developpement, controle de la
  chaine d'approvisionnement logicielle
- **NIST SSDF (SP 800-218) PS.1, PS.3** : protection du code et de
  l'integrite de la chaine
- **ANSSI guide d'hygiene mesure 14** : durcissement des systemes, applicable
  au container construit

## Links

- [Trivy supply chain incident report (StepSecurity)](https://www.stepsecurity.io/blog/trivy-compromised-a-second-time---malicious-v0-69-4-release)
- [OpenSSF Scorecard - Pinned Dependencies](https://github.com/ossf/scorecard/blob/main/docs/checks.md#pinned-dependencies)
- [NIST SP 800-218 (SSDF)](https://csrc.nist.gov/Projects/ssdf)
- [Action officielle Trivy](https://github.com/aquasecurity/trivy-action)
- [Action officielle Checkov](https://github.com/bridgecrewio/checkov-action)
