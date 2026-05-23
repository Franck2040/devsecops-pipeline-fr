# ADR-0001 : Template repository et architecture en composite actions

## Status

Accepted

## Context

Le projet vise a fournir un pipeline DevSecOps reutilisable pour des equipes
de developpement en contexte francais et europeen. Deux decisions
architecturales doivent etre tranchees des le bootstrap :

1. **Forme du repo** : projet standard vs template repository GitHub
2. **Structure du pipeline** : workflows monolithiques vs composite actions vs reusable workflows

L'objectif est qu'un developpeur tiers puisse :

- Forker le repo et demarrer un projet securise en moins de 10 minutes
- Reutiliser une couche de scan isolement dans un autre projet
- Comprendre l'architecture en lisant 1 ADR et 1 diagramme

## Considered Options

### Forme du repo

| Option              | Pour                                              | Contre                                                  | Verdict      |
|---------------------|---------------------------------------------------|---------------------------------------------------------|--------------|
| Repo standard       | Simple a publier                                  | Pas de signal de reutilisation, fork manuel             | Rejete       |
| Template repository | Bouton "Use this template" sur GitHub, intention claire | Discipline necessaire pour garder le repo fork-ready    | **Retenu**   |

### Structure du pipeline

| Option                 | Pour                                              | Contre                                                       | Verdict        |
|------------------------|---------------------------------------------------|--------------------------------------------------------------|----------------|
| Workflows monolithiques | Simple, debuggable, peu d'abstraction             | Duplication entre projets, copie-colle pour reutiliser       | Rejete         |
| Composite actions      | Reutilisables ailleurs, encapsulation, versioning | Pas d'imbrication composite-dans-composite propre            | **Retenu**     |
| Reusable workflows     | Reutilisables aussi                               | Plus rigides (pas de step composite, typing input limite)    | Considere      |

## Decision

Le repo est marque **template repository** sur GitHub (flip a la fin de la
phase 7, au moment du passage public).

Chaque couche de scan est implementee comme **composite action** sous
`.github/actions/<couche>/action.yml`. Chaque action est documentee par un
`README.md` propre, decrivant inputs, outputs, prerequis, exemples.

Un workflow d'orchestration `.github/workflows/pipeline.yml` appelle les
composite actions dans l'ordre voulu et selon les triggers appropries
(push, PR, nightly, release).

## Consequences

### Positive

- Un developpeur tiers peut forker et bootstraper un projet securise en quelques minutes
- Chaque scan est une unite reutilisable, copiable vers un autre repo
- Le versioning de chaque action est tracable separement (commits sur le sous-dossier)
- Les composite actions servent de "contrat" stable que d'autres projets peuvent appeler
- Documentation par action force la discipline (chaque dossier action a son README)

### Negative

- Une composite action ne peut pas appeler une autre composite action de maniere imbriquee
- Le debug d'une couche demande de naviguer dans 3 fichiers (workflow, action, config)
- Le bootstrap initial demande plus de ceremonie (creer le dossier, action.yml, README)

### Risks et mitigations

| Risque                                         | Mitigation                                                       |
|------------------------------------------------|------------------------------------------------------------------|
| Drift entre composite action et son README     | Linter markdown + revue manuelle a chaque PR sur l'action        |
| Incompatibilite version runner GitHub          | Pin de runner planifie (passage `ubuntu-latest` -> `ubuntu-22.04` a la phase finale) |
| Composite trop verbeux qui ralentit la CI      | Mesure de duree par job, refactoring si > 5 min                  |
| Allowlist `.gitleaks.toml` devenue trop laxe   | Revue ADR a chaque ajout d'entree dans l'allowlist                |

## Compliance

Aucune contrainte reglementaire directe ne s'applique a cette decision
d'architecture. La structure facilite cependant la conformite a :

- **NIS2 Annexe I §2(d)** : securite dans le developpement (composite actions
  standardisent les scans across projects)
- **ANSSI guide d'hygiene mesure 28** : cloisonnement des etapes du CI

## Links

- [Documentation GitHub composite actions](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)
- [Template repositories sur GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository)
- [Diagramme du pipeline](../../diagrams/pipeline.mmd)
- [Catalogue des vulnerabilites de l'app cible](../vulnerabilities.md)
