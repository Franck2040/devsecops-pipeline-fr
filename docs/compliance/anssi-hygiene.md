# Mapping ANSSI - Guide d'hygiene informatique

Mapping des elements du pipeline DevSecOps vers les **42 mesures du
Guide d'hygiene informatique** publie par l'ANSSI (Agence nationale de la
securite des systemes d'information).

Le guide couvre les mesures fondamentales de cybersecurite recommandees pour
toute organisation. Toutes les mesures ne sont pas applicables a un projet
de pipeline CI/CD : ce document mappe celles qui le sont.

Reference : [Guide d'hygiene informatique - ANSSI](https://cyber.gouv.fr/publications/guide-dhygiene-informatique)

## Mesures couvertes par le projet

| Mesure ANSSI                                                  | Element du projet                                                  | Statut       |
|---------------------------------------------------------------|---------------------------------------------------------------------|--------------|
| Mesure 11 : gerer le cycle de vie des comptes et autorisations| Gitleaks (Layer 1) detecte les secrets long-terme committes        | Implemente   |
| Mesure 14 : durcir la configuration des composants techniques | Checkov (Layer 4) scanne le Dockerfile et workflows GitHub Actions | Implemente   |
| Mesure 22 : activer et configurer les journaux                | Logging structure dans incident-tracker (limite, voir threat model T-R1) | Partiel  |
| Mesure 26 : utiliser un outil de gestion centralisee          | GitHub Actions centralise tous les scans et leur historique         | Implemente   |
| Mesure 28 : cloisonner les ressources                         | Composite actions isolees, workflows separes par cycle de vie       | Implemente   |
| Mesure 30 : limiter les flux reseau                           | Docker network bridge dans docker-compose, pas de port expose en prod | Implemente |
| Mesure 35 : segmenter le SI et mettre en oeuvre un cloisonnement | Workflows separes (push vs release vs nightly)                   | Implemente   |
| Mesure 37 : controler et proteger l'acces aux salles serveurs | Non applicable (cloud-native, GitHub runners)                       | Non applicable |
| Mesure 38 : conserver une cartographie precise de l'installation| SBOM CycloneDX + SPDX a chaque release                            | Implemente   |
| Mesure 42 : auditer regulierement le SI                       | DAST nightly + 5 layers a chaque push                               | Implemente   |

## Mesures partiellement couvertes

| Mesure ANSSI                                                  | Etat actuel                                                            | Plan          |
|---------------------------------------------------------------|------------------------------------------------------------------------|---------------|
| Mesure 22 : activer et configurer les journaux                | Logging basique dans incident-tracker, pas d'agregation                | Phase 8       |
| Mesure 25 : proteger les acces a distance                     | Pas d'application en prod actuellement                                 | Hors scope    |
| Mesure 31 : gerer le cycle de vie des materiels et logiciels  | Trivy detecte node:16 EOL, mais pas de processus de bump automatise    | Dependabot phase 8 |

## Mesures hors scope

Les mesures relatives a la gestion physique (locaux, materiels, BYOD), aux
plans de secours organisationnels, et a la sensibilisation des utilisateurs
sont hors du perimetre d'un template DevSecOps. Elles relevent de la PSSI de
l'organisation utilisatrice du template.

## Conclusion

Sur les ~20 mesures applicables au scope CI/CD logiciel, le projet en
implemente directement 8, en couvre partiellement 3, et fournit des
mecanismes d'audit pour l'ensemble du parc forke.
