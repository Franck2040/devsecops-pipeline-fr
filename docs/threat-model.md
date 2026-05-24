# Threat Model STRIDE

Modele de menaces selon la methodologie STRIDE de Microsoft, applique
a deux perimetres :

1. **L'application cible** (`app/` incident-tracker)
2. **Le pipeline DevSecOps** (workflows GitHub Actions, composite actions, supply chain)

STRIDE couvre six categories : **S**poofing identity, **T**ampering with data,
**R**epudiation, **I**nformation disclosure, **D**enial of service,
**E**levation of privilege.

## Vue d'ensemble

| Categorie               | Menaces app | Menaces pipeline | Total |
|-------------------------|-------------|------------------|-------|
| Spoofing identity       | 1           | 1                | 2     |
| Tampering with data     | 3           | 2                | 5     |
| Repudiation             | 2           | 1                | 3     |
| Information disclosure  | 3           | 2                | 5     |
| Denial of service       | 3           | 1                | 4     |
| Elevation of privilege  | 3           | 2                | 5     |
| **Total**               | **15**      | **9**            | **24**|

Severite : Critical (impact metier majeur, exploit facile), High (exploit
realiste, impact significatif), Medium (necessite conditions), Low (effet
limite ou difficulte d'exploitation elevee).

## Perimetre 1 : application incident-tracker

### S - Spoofing identity

#### T-S1 : Forgery de JWT admin

| Element        | Detail                                                                  |
|----------------|-------------------------------------------------------------------------|
| Description    | Le JWT_SECRET hardcode (VULN-006) est court et previsible. Un attaquant peut forger un token avec `admin: true` via jwt.io. |
| Composant      | `app/server.js` `/api/login`                                            |
| Severite       | Critical                                                                |
| Mitigation     | Secret de 256 bits genere aleatoirement, lu depuis variable d'environnement, rotation 90 jours |
| Statut         | Vulnerabilite volontaire pour demonstration, documentee dans docs/vulnerabilities.md |

### T - Tampering with data

#### T-T1 : Stored XSS via description d'incident

| Element     | Detail                                                                     |
|-------------|----------------------------------------------------------------------------|
| Description | VULN-002. L'attaquant injecte un payload `<script>` dans la description, execute dans le navigateur d'un admin qui consulte l'incident. |
| Composant   | `POST /api/incidents`                                                      |
| Severite    | High                                                                       |
| Mitigation  | Echappement HTML systematique a l'output, Content-Security-Policy stricte  |
| Statut      | Vulnerabilite volontaire, documentee                                       |

#### T-T2 : Prototype pollution via lodash.merge

| Element     | Detail                                                                                                |
|-------------|-------------------------------------------------------------------------------------------------------|
| Description | VULN-003. Un PATCH avec `__proto__.isAdmin = true` modifie Object.prototype pour toutes les requetes suivantes. |
| Composant   | `PATCH /api/incidents/:id`                                                                            |
| Severite    | High                                                                                                  |
| Mitigation  | Bump lodash >= 4.17.21, validation explicite des cles avant merge, freeze des prototypes              |
| Statut      | Vulnerabilite volontaire, documentee                                                                  |

#### T-T3 : Upload de fichier malicieux

| Element     | Detail                                                                                       |
|-------------|----------------------------------------------------------------------------------------------|
| Description | VULN-004. Aucun controle d'extension ni de type MIME. Un attaquant peut uploader un `.html` ou un `.svg` avec JavaScript. |
| Composant   | `POST /api/upload`                                                                           |
| Severite    | High                                                                                         |
| Mitigation  | Whitelist d'extensions, validation Content-Type, scan antivirus, stockage hors webroot       |
| Statut      | Vulnerabilite volontaire, documentee                                                         |

### R - Repudiation

#### T-R1 : Absence de journalisation des actions

| Element     | Detail                                                                |
|-------------|------------------------------------------------------------------------|
| Description | Les creations, modifications et acces aux incidents ne sont pas journalises. Un utilisateur peut nier ses actions. |
| Composant   | Toutes les routes mutatives                                            |
| Severite    | Medium                                                                 |
| Mitigation  | Journalisation structuree (JSON) avec user, action, timestamp, IP source vers stockage immuable |
| Statut      | Manque a corriger en production                                        |

#### T-R2 : Pas de signature des modifications

| Element     | Detail                                                                                           |
|-------------|--------------------------------------------------------------------------------------------------|
| Description | Les incidents peuvent etre modifies sans laisser de trace cryptographique de qui a fait la modification. |
| Composant   | Modele de donnees `incidents`                                                                    |
| Severite    | Low                                                                                              |
| Mitigation  | Hash + signature de chaque revision, ou append-only journal                                      |
| Statut      | Accepte (hors scope MVP)                                                                         |

### I - Information disclosure

#### T-I1 : Dump complet via SQL injection

| Element     | Detail                                                                                       |
|-------------|----------------------------------------------------------------------------------------------|
| Description | VULN-001. `' OR '1'='1` sur la recherche expose tous les incidents. UNION SELECT permet d'extraire d'autres tables. |
| Composant   | `GET /api/incidents/search`                                                                  |
| Severite    | Critical                                                                                     |
| Mitigation  | Prepared statements avec parametres, ORM (mais ORM ne protege pas tout), principe du moindre privilege sur le compte SQL |
| Statut      | Vulnerabilite volontaire, documentee                                                         |

#### T-I2 : Logs sensibles affiches au demarrage

| Element     | Detail                                                                            |
|-------------|------------------------------------------------------------------------------------|
| Description | VULN-007. Le faux token AWS est imprime sur stdout au demarrage du serveur, expose dans tous les logs (CI, prod, docker). |
| Composant   | `server.js` startup                                                                |
| Severite    | High                                                                               |
| Mitigation  | Aucun secret en log, masquage automatique via une lib de logging structuree        |
| Statut      | Vulnerabilite volontaire, documentee                                               |

#### T-I3 : Messages d'erreur verbeux

| Element     | Detail                                                                                       |
|-------------|----------------------------------------------------------------------------------------------|
| Description | Les erreurs `db.all` renvoyent `err.message` brut au client, exposant la structure SQL et SQLite. |
| Composant   | Toutes les routes API                                                                        |
| Severite    | Medium                                                                                       |
| Mitigation  | Middleware d'erreur uniforme avec messages generiques cote client, detail en log serveur     |
| Statut      | Manque a corriger en production                                                              |

### D - Denial of service

#### T-D1 : Disque sature par upload abusif

| Element     | Detail                                                                                |
|-------------|---------------------------------------------------------------------------------------|
| Description | VULN-004. Aucune limite de taille de fichier, aucune limite de nombre d'uploads par utilisateur. Un attaquant remplit `/tmp/uploads/` jusqu'a saturer le disque du container. |
| Composant   | `POST /api/upload`                                                                    |
| Severite    | High                                                                                  |
| Mitigation  | Limite de taille via `express-fileupload limits`, quota par utilisateur, rotation/purge automatique |
| Statut      | Vulnerabilite volontaire, documentee                                                  |

#### T-D2 : Absence de rate limiting

| Element     | Detail                                                                       |
|-------------|------------------------------------------------------------------------------|
| Description | Aucune route n'a de rate limit. Un attaquant peut bruteforcer `/api/login` ou inonder `/api/incidents/search` avec des requetes SQLi complexes. |
| Composant   | Application globale                                                          |
| Severite    | Medium                                                                       |
| Mitigation  | `express-rate-limit` avec limites par IP et par utilisateur authentifie      |
| Statut      | Manque a corriger en production                                              |

#### T-D3 : Container root, escape host

| Element     | Detail                                                                                |
|-------------|---------------------------------------------------------------------------------------|
| Description | VULN-009. Si un attaquant compromet le process Node, il a UID 0 dans le container et potentiellement sur le host en cas d'escape (kernel exploit). |
| Composant   | `app/Dockerfile`                                                                      |
| Severite    | High                                                                                  |
| Mitigation  | `USER app` non-root, capacites Linux droppees, seccomp/apparmor profile, runtime tel que gVisor pour isolation renforcee |
| Statut      | Vulnerabilite volontaire, documentee                                                  |

### E - Elevation of privilege

#### T-E1 : Chainage SQLi + JWT pour acces admin

| Element     | Detail                                                                                     |
|-------------|---------------------------------------------------------------------------------------------|
| Description | T-I1 (SQLi) extrait la table users (si elle existait, ici scenario hypothetique), T-S1 (JWT forge) injecte un token admin. Acces complet. |
| Composant   | Combinaison `/api/incidents/search` + `/api/login`                                          |
| Severite    | Critical                                                                                    |
| Mitigation  | Mitigations T-I1 et T-S1 + RBAC strict cote backend, pas de role administratif derivable du JWT seul |
| Statut      | Vulnerabilite volontaire, documentee                                                        |

#### T-E2 : RCE via deserialization (potentiel)

| Element     | Detail                                                                                      |
|-------------|---------------------------------------------------------------------------------------------|
| Description | EJS 2.7.4 (dependance installee) est sujet a CVE-2022-29078 (RCE via template injection si user input atteint un render). Non exploitable directement dans le code actuel mais latent. |
| Composant   | Dependance `ejs`                                                                            |
| Severite    | Medium                                                                                      |
| Mitigation  | Bump ejs >= 3.1.7, eviter de passer du user input dans `app.render()`                        |
| Statut      | Latent, scanne par Trivy / npm audit                                                        |

#### T-E3 : Runtime Node EOL avec CVE non patches

| Element     | Detail                                                                  |
|-------------|--------------------------------------------------------------------------|
| Description | VULN-008. Node 16 n'est plus supporte depuis septembre 2023. Toute CVE decouverte sur le runtime apres cette date n'est pas patchee. |
| Composant   | Image de base `node:16-alpine`                                           |
| Severite    | High                                                                     |
| Mitigation  | Bump vers `node:22-alpine` (LTS courant)                                 |
| Statut      | Vulnerabilite volontaire, documentee                                     |

---

## Perimetre 2 : pipeline DevSecOps

### S - Spoofing identity (pipeline)

#### P-S1 : Compromission d'un secret GitHub Actions

| Element     | Detail                                                                            |
|-------------|------------------------------------------------------------------------------------|
| Description | Si un secret repository (token PAT, cle API) etait compromis, un attaquant pourrait pousser du code et faire tourner des workflows en notre nom. |
| Composant   | GitHub Actions secrets store                                                       |
| Severite    | High                                                                               |
| Mitigation  | Aucun secret long-terme dans le repo, utilisation exclusive de `GITHUB_TOKEN` (rotated par run), OIDC pour les acces externes futurs |
| Statut      | Implemente (aucun PAT necessaire actuellement)                                     |

### T - Tampering with data (pipeline)

#### P-T1 : Attaque supply chain sur une composite action tierce

| Element     | Detail                                                                                                                  |
|-------------|-------------------------------------------------------------------------------------------------------------------------|
| Description | Une action externe (`aquasecurity/trivy-action`, `bridgecrewio/checkov-action`, etc.) est compromise. L'attaquant injecte du code dans la CI, exfiltre des secrets ou pousse du code. |
| Composant   | Toutes les composite actions tierces                                                                                    |
| Severite    | Critical                                                                                                                |
| Mitigation  | Pinning sur tags versionnes immutables, plan de migration vers pinning par SHA commit (cf. ADR-0003), monitoring d'advisories |
| Statut      | Mitigation interim active, SHA pinning planifie phase 8                                                                 |

#### P-T2 : PR malicieuse modifiant les workflows

| Element     | Detail                                                                                       |
|-------------|----------------------------------------------------------------------------------------------|
| Description | Un contributeur externe propose une PR qui modifie `.github/workflows/` pour exfiltrer des secrets ou desactiver des scans. |
| Composant   | Workflows GitHub Actions                                                                     |
| Severite    | High                                                                                         |
| Mitigation  | Branch protection sur `main` (review obligatoire), `permissions:` minimales par defaut, restriction des actions autorisees au niveau organisation |
| Statut      | Recommandation a appliquer au flip public (cf. README "Future work")                         |

### R - Repudiation (pipeline)

#### P-R1 : Modification de l'historique git

| Element     | Detail                                                                                       |
|-------------|----------------------------------------------------------------------------------------------|
| Description | Un commiter avec acces direct a `main` peut force-push et reecrire l'historique, masquant ses actions. |
| Composant   | Branche `main`                                                                               |
| Severite    | Medium                                                                                       |
| Mitigation  | Branch protection avec force-push refuse, signatures GPG des commits (verified badge), audit GitHub natif |
| Statut      | Branch protection a activer au flip public                                                   |

### I - Information disclosure (pipeline)

#### P-I1 : Logs de scanner verbeux

| Element     | Detail                                                                                           |
|-------------|--------------------------------------------------------------------------------------------------|
| Description | Trivy et Semgrep peuvent imprimer le contenu de fichiers, les paths internes, etc. Visible publiquement sur un repo public. |
| Composant   | Sortie des workflows                                                                             |
| Severite    | Low                                                                                              |
| Mitigation  | Format `--quiet` quand possible, masquage manuel des paths sensibles, rapports SARIF prefere aux logs verbeux |
| Statut      | Accepte (info publique par design du repo template)                                              |

#### P-I2 : SBOM expose toute la chaine de dependances

| Element     | Detail                                                                                |
|-------------|---------------------------------------------------------------------------------------|
| Description | Le SBOM publie comme asset de release expose toutes les dependances de l'app, ce qui peut faciliter l'enumeration d'attaques par un attaquant. |
| Composant   | SBOM CycloneDX / SPDX                                                                 |
| Severite    | Low                                                                                   |
| Mitigation  | Accepte : c'est exactement le but du SBOM (transparency), exige par CRA. Compense par un patch management agressif |
| Statut      | Decision architecturale, voir ADR-0004                                                |

### D - Denial of service (pipeline)

#### P-D1 : Exhaustion du quota Actions

| Element     | Detail                                                                                       |
|-------------|----------------------------------------------------------------------------------------------|
| Description | Un attaquant ouvre 1000 PRs vides qui declenchent `pipeline.yml`, cramant les 2000 min/mois du compte gratuit. |
| Composant   | Quota GitHub Actions                                                                         |
| Severite    | Medium                                                                                       |
| Mitigation  | `concurrency: group` pour annuler les runs obsoletes sur meme branche, restriction des contributeurs autorises a declencher CI sur fork, monitoring du quota |
| Statut      | `concurrency` a ajouter en phase 8                                                           |

### E - Elevation of privilege (pipeline)

#### P-E1 : Workflow injection via PR title ou commit message

| Element     | Detail                                                                                                                            |
|-------------|-----------------------------------------------------------------------------------------------------------------------------------|
| Description | Un attaquant injecte du code shell dans un titre de PR ou un commit message qui est utilise dans un `${{ github.event.pull_request.title }}` dans un step `run`. |
| Composant   | Steps `run` (potentiellement)                                                                                                     |
| Severite    | High                                                                                                                              |
| Mitigation  | Audit des steps `run` qui referencent du user input, passage par variables d'environnement intermediaires plutot que substitution directe |
| Statut      | Aucun step concerne actuellement (audit a refaire a chaque ajout)                                                                 |

#### P-E2 : Permissions excessives sur GITHUB_TOKEN

| Element     | Detail                                                                                       |
|-------------|----------------------------------------------------------------------------------------------|
| Description | Par defaut, le `GITHUB_TOKEN` a `contents: write` ce qui permettrait a un workflow compromis de pousser du code. |
| Composant   | Tous les workflows                                                                           |
| Severite    | Medium                                                                                       |
| Mitigation  | Declaration explicite de `permissions:` au niveau workflow ou job, jamais plus que necessaire. Implemente dans tous les workflows du projet. |
| Statut      | Implemente                                                                                   |

---

## Synthese et roadmap

### Mitigations implementees

- Pinning des actions sur tags versionnes immutables
- `permissions:` minimales declarees explicitement
- SBOM publie a chaque release
- DAST nightly via OWASP ZAP
- Documentation complete des vulnerabilites volontaires
- ADRs justifiant les choix architecturaux

### Mitigations a appliquer au flip public

1. Branch protection sur `main` (review obligatoire, pas de force-push)
2. Restriction des actions autorisees au niveau du repo
3. Activation de Dependabot pour les bumps auto

### Mitigations planifiees phase 8

1. Pinning par SHA commit pour les actions tierces
2. `concurrency: group` pour limiter les runs en parallele
3. Cosign signing du SBOM (sigstore keyless OIDC)
4. SLSA provenance level 3 pour les artefacts de release

## References

- [STRIDE methodology (Microsoft)](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats)
- [OWASP Threat Modeling](https://owasp.org/www-community/Threat_Modeling)
- [ADR-0003 sur la chaine d'approvisionnement](adr/0003-post-build-scanning-and-supply-chain-lessons.md)
