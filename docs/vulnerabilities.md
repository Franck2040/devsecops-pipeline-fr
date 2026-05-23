# Catalogue des vulnérabilités volontaires

Toutes les vulnérabilités listées ici sont **introduites volontairement** dans
l'application `incident-tracker` afin de servir de cible aux scanners du
pipeline. Elles ne doivent pas être considérées comme des bugs.

Chaque vuln est identifiable par son tag `VULN-XXX` dans le code source,
ce qui permet de croiser un finding de scanner avec l'intention pédagogique.

## Vue d'ensemble

| ID       | Vulnérabilité                          | Localisation              | CWE        | Scanner attendu                     |
|----------|----------------------------------------|---------------------------|------------|-------------------------------------|
| VULN-001 | SQL injection                          | `server.js` `/search`     | CWE-89     | Semgrep, OWASP ZAP                  |
| VULN-002 | XSS reflected                          | `server.js` `POST /api/incidents` | CWE-79 | Semgrep, OWASP ZAP             |
| VULN-003 | Prototype pollution via lodash.merge   | `server.js` `PATCH`       | CWE-1321   | Semgrep, Trivy SCA                  |
| VULN-004 | Unrestricted file upload               | `server.js` `/api/upload` | CWE-434    | Semgrep, OWASP ZAP, Trivy SCA       |
| VULN-005 | JWT weak signing                       | `server.js` `/api/login`  | CWE-326    | Semgrep                             |
| VULN-006 | Secret hardcodé (JWT_SECRET)           | `server.js`               | CWE-798    | Gitleaks, Semgrep                   |
| VULN-007 | Faux token AWS commité                 | `server.js`               | CWE-798    | Gitleaks                            |
| VULN-008 | Image Docker EOL (node:16)             | `app/Dockerfile`          | CWE-1104   | Trivy image, Checkov                |
| VULN-009 | Container en root                      | `app/Dockerfile`          | CWE-250    | Checkov, Trivy config               |

## Détails

### VULN-001 : SQL injection

Route `GET /api/incidents/search?q=...`. Le paramètre `q` est concaténé
directement dans la requête SQL sans paramétrage prepared statement.

Exploit minimal :

```
curl "http://localhost:3000/api/incidents/search?q=%27%20OR%20%271%27=%271"
```

Remédiation : utiliser `db.all(sql, [param], ...)` avec placeholders `?`.

### VULN-002 : XSS reflected

Route `POST /api/incidents`. La description fournie par l'utilisateur est
renvoyée en HTML sans échappement.

Exploit minimal :

```
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -d '{"title":"test","description":"<script>alert(1)</script>"}'
```

Remédiation : échapper la sortie avec une fonction comme `escape-html` ou
`he`, ou utiliser un moteur de template qui échappe par défaut.

### VULN-003 : Prototype pollution via lodash.merge

Route `PATCH /api/incidents/:id`. `lodash.merge` sur un objet contrôlé par
l'utilisateur permet de polluer `Object.prototype`.

Exploit minimal :

```
curl -X PATCH http://localhost:3000/api/incidents/1 \
  -H "Content-Type: application/json" \
  -d '{"__proto__":{"isAdmin":true}}'
```

Remédiation : passer en `lodash@4.17.21` ou plus récent (CVE-2019-10744
patché), valider les clés avant merge.

### VULN-004 : Unrestricted file upload

Route `POST /api/upload`. `express-fileupload@1.1.9` est vulnérable à
CVE-2020-7699 (parsing du multipart) et le code ne valide ni l'extension ni
le type MIME.

Remédiation : whitelist d'extensions, vérification du content-type côté
serveur, mise à jour vers `express-fileupload@>=1.1.10`.

### VULN-005 et VULN-006 : JWT weak signing et secret hardcodé

Le secret est en dur dans `server.js`, court et prédictible. Tout détenteur
du source peut forger des tokens valides.

Remédiation : lecture du secret depuis une variable d'environnement, secret
de 256 bits minimum généré aléatoirement, rotation périodique.

### VULN-007 : Faux token AWS commité

`AKIAIOSFODNN7EXAMPLE` est le token d'exemple de la documentation AWS, mais
il respecte le format `AKIA + 16 caractères` que les scanners de secrets
ciblent.

Remédiation : aucune valeur ressemblant à un secret ne doit être committée.
Pre-commit hook gitleaks recommandé.

### VULN-008 : Image Docker EOL

`node:16-alpine`. Node 16 est en fin de support depuis septembre 2023, donc
plus de patches CVE pour l'OS et le runtime.

Remédiation : passer sur `node:20-alpine` ou `node:22-alpine`.

### VULN-009 : Container en root

Aucune directive `USER` dans le Dockerfile, donc le process tourne avec
UID 0. En cas d'évasion conteneur, l'attaquant a les pleins pouvoirs.

Remédiation : créer un utilisateur dédié et basculer dessus :

```dockerfile
RUN addgroup -S app && adduser -S app -G app
USER app
```

## Mapping ANSSI / NIS2 (résumé, détail dans docs/compliance/)

| VULN-ID  | ANSSI guide d'hygiène | NIS2 mesure technique           |
|----------|-----------------------|---------------------------------|
| 001, 002 | 28 (cloisonnement)    | Annexe I §2(d) sécurité dev     |
| 003, 004 | 22 (durcissement)     | Annexe I §2(d)                  |
| 005-007  | 11 (gestion secrets)  | Annexe I §2(i) gestion accès    |
| 008, 009 | 14 (durcissement OS)  | Annexe I §2(c) gestion vuln     |
