# Mapping EU CRA - Cyber Resilience Act

Mapping vers le **Reglement (UE) 2024/2847 - Cyber Resilience Act (CRA)**,
adopte le 10 octobre 2024. Entree en application principale : **11 decembre 2027**.

Le CRA impose des exigences de cybersecurite aux **produits comportant des
elements numeriques** mis sur le marche europeen. Cela inclut tout produit
logiciel commercialise dans l'UE, avec des regimes differencies selon la
criticite (produits importants, critiques, normaux).

Reference : [Cyber Resilience Act sur EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/2847/oj)

## Article 13 : Obligations sur les SBOM

> "Le fabricant doit identifier et documenter les vulnerabilites et les
> composants contenus dans le produit, y compris en etablissant un SBOM."

**C'est l'exigence centrale qui justifie l'existence de notre Layer 6.**

| Exigence Art. 13                                  | Implementation                                            | Statut       |
|---------------------------------------------------|-----------------------------------------------------------|--------------|
| Etablir un SBOM des composants                    | Layer 6 : Syft genere CycloneDX 1.5 + SPDX 2.3            | Implemente   |
| Format machine-lisible                            | CycloneDX et SPDX sont tous deux des formats JSON         | Implemente   |
| Tenir le SBOM a jour pendant le cycle de vie      | Genere automatiquement a chaque release                   | Implemente   |
| Documenter les vulnerabilites identifiees         | `docs/vulnerabilities.md` + onglet GitHub Security        | Implemente   |

## Annexe I §1 : Exigences essentielles de cybersecurite

L'Annexe I §1 liste les exigences que tout produit doit respecter avant
mise sur le marche.

| Exigence Annexe I §1                                          | Element du projet                                              | Statut         |
|---------------------------------------------------------------|----------------------------------------------------------------|----------------|
| §1(a) Conception securisee (security by design)               | Threat model STRIDE des la conception, ADR documentes          | Implemente     |
| §1(b) Pas de vulnerabilites exploitables connues a la livraison | Vulnerabilites volontaires documentees explicitement         | Demonstration  |
| §1(c) Configuration securisee par defaut                      | Dockerfile a durcir (VULN-009 - exemple a corriger)            | Demonstration  |
| §1(d) Protection contre les acces non autorises               | JWT signing (faible volontaire pour demo)                      | Demonstration  |
| §1(e) Protection de la confidentialite                        | Pas de transmission de donnees sensibles dans la demo          | Non applicable |
| §1(f) Protection de l'integrite des donnees stockees          | SQLite local sans signature (latent)                           | Partiel        |
| §1(g) Minimiser la surface d'attaque                          | Endpoints minimaux, pas de fonctionnalites superflues          | Implemente     |
| §1(h) Reduction de l'impact d'un incident                     | Container isole, pas de privilege escalation horizontale       | Partiel        |
| §1(i) Enregistrement et monitoring                            | Logs basiques, pas d'agregation centralisee                    | Partiel        |
| §1(j) Possibilite de patches securite                         | Dependabot recommande (planifie phase 8)                       | Planifie       |

## Annexe I §2 : Exigences sur la gestion des vulnerabilites

| Exigence Annexe I §2                                          | Element du projet                                              | Statut         |
|---------------------------------------------------------------|----------------------------------------------------------------|----------------|
| §2(1) Identification et documentation des vulnerabilites      | 5 layers de scan + catalogue `docs/vulnerabilities.md`         | Implemente     |
| §2(2) Reaction sans delai aux vulnerabilites                  | Annotations CI immediates + issue DAST automatique             | Implemente     |
| §2(3) Tests de securite reguliers                             | DAST nightly + scans a chaque push                             | Implemente     |
| §2(4) Politique coordonnee de divulgation                     | `SECURITY.md` avec procedure de signalement                    | Implemente     |
| §2(5) Diffusion d'informations sur vulnerabilites corrigees   | Issues ZAP + releases avec changelog (recommande phase 8)      | Partiel        |
| §2(6) Mecanisme de distribution gratuite des patches          | Modele open-source MIT, fork et update libres                  | Implemente     |
| §2(7) Securite et integrite des mises a jour                  | Releases signees par GitHub natif, plan Cosign phase 8         | Partiel        |

## Article 11 : Obligations de notification

> "Le fabricant notifie a l'ENISA toute vulnerabilite exploitable activement
> exploitee dans son produit, dans les 24 heures."

| Exigence Art. 11                                              | Element du projet                                              | Statut         |
|---------------------------------------------------------------|----------------------------------------------------------------|----------------|
| Detection precoce des vulnerabilites                          | DAST nightly + scans push                                      | Implemente     |
| Procedure de signalement                                      | `SECURITY.md` definit le contact (kenmeugnetchoupo@gmail.com)  | Implemente     |
| Documentation de la mitigation                                | ADR-0003 (exemple Aqua) + issues GitHub                        | Implemente     |

## Timeline d'application

| Date              | Etape CRA                                                                   |
|-------------------|------------------------------------------------------------------------------|
| 10 octobre 2024   | Adoption finale du reglement                                                |
| 11 juin 2026      | Application des obligations de notification (Art. 11) et SBOM (Art. 13)     |
| **11 decembre 2027** | **Application pleine et entiere de toutes les obligations**              |

Le projet est **deja conforme** aux obligations Article 11 et Article 13
qui s'appliquent en juin 2026, ce qui en fait un template anticipatif pour
les editeurs souhaitant se mettre en conformite avant la date butoir.

## Pourquoi cette compliance est strategique

Le CRA s'applique a **tout produit logiciel commercialise dans l'UE**, pas
seulement aux secteurs reglementes. Concretement :

- Une boite SaaS qui vend en France : concernee
- Une lib open-source utilisee dans des produits commerciaux : son auteur peut etre concerne
- Un editeur de logiciel embarque : concerne

Le passage en pleine application en decembre 2027 va declencher une vague de
mise en conformite a partir de mi-2026. Les equipes ayant deja un pipeline
genre celui-ci auront une longueur d'avance.

## Conclusion

Le projet implemente directement les 2 articles centraux du CRA pour les
editeurs logiciels (Article 11 notification + Article 13 SBOM), couvre la
majorite des exigences essentielles de l'Annexe I, et fournit le socle
technique pour la mise en conformite avant decembre 2027.
