// app/server.js
//
// Mini-API incident-tracker, cible de démo du pipeline DevSecOps.
// TOUTES les vulnérabilités ci-dessous sont VOLONTAIRES et cataloguées
// dans docs/vulnerabilities.md.

const express = require('express');
const fileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const initDb = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3000;

// VULN-006 : secret JWT en dur dans le code source.
// Détecté par : Gitleaks (pattern detection), Semgrep (rule jwt-hardcoded-secret).
const JWT_SECRET = 'supersecret_dev_jwt_key_change_me_42';

// VULN-007 : faux token AWS commité (gitleaks doit le voir).
// Format AKIA + 16 caractères, conforme au pattern AWS.
const AWS_FAKE_TOKEN = 'AKIAIOSFODNN7EXAMPLE';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

let db;
initDb().then((database) => { db = database; });

// Route de santé, propre, sans vuln.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'incident-tracker' });
});

// VULN-001 : SQL injection via concaténation directe dans la query.
// Détecté par : Semgrep (rule express-sqli), OWASP ZAP (DAST).
// CWE-89. Exploit : /api/incidents/search?q=' OR '1'='1
app.get('/api/incidents/search', (req, res) => {
  const q = req.query.q || '';
  const sql = "SELECT * FROM incidents WHERE title LIKE '%" + q + "%'";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// VULN-002 : XSS reflected, la description est retournée en HTML sans échappement.
// Détecté par : Semgrep (rule express-xss), OWASP ZAP. CWE-79.
app.post('/api/incidents', (req, res) => {
  const { title, description } = req.body;
  db.run(
    'INSERT INTO incidents (title, description) VALUES (?, ?)',
    [title, description],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.set('Content-Type', 'text/html');
      res.send(
        '<h1>Incident cree : ' + title + '</h1>' +
        '<p>' + description + '</p>' +
        '<a href="/api/incidents/' + this.lastID + '">Voir</a>'
      );
    }
  );
});

// VULN-003 : prototype pollution via lodash.merge sur user input non assaini.
// Détecté par : Semgrep (rule lodash-merge-pollution),
// Trivy SCA (lodash 4.17.4 CVE-2019-10744). CWE-1321.
app.patch('/api/incidents/:id', (req, res) => {
  const target = {};
  _.merge(target, req.body);
  res.json({ updated: true, target });
});

// VULN-004 : upload sans whitelist d'extension, sans vérification MIME.
// Détecté par : Semgrep (rule express-fileupload-unrestricted),
// OWASP ZAP, Trivy SCA (express-fileupload 1.1.9 CVE-2020-7699). CWE-434.
app.post('/api/upload', (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({ error: 'No file' });
  }
  const file = req.files.file;
  const savePath = '/tmp/uploads/' + file.name;
  file.mv(savePath, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ saved: savePath });
  });
});

// VULN-005 : JWT signé avec un secret faible (voir VULN-006).
// Bruteforce trivial via hashcat/jwt-cracker.
// Détecté par : Semgrep (rule jwt-weak-secret).
app.post('/api/login', (req, res) => {
  const { username } = req.body;
  const token = jwt.sign({ user: username, admin: false }, JWT_SECRET);
  res.json({ token });
});

app.get('/', (req, res) => {
  res.json({
    name: 'incident-tracker',
    version: '0.1.0',
    warning: 'Application volontairement vulnérable. Voir docs/vulnerabilities.md.'
  });
});

app.listen(PORT, () => {
  console.log('incident-tracker listening on :' + PORT);
  // Le log du token AWS factice est volontaire pour démo (log poisoning aussi possible).
  console.log('Token AWS factice de demo : ' + AWS_FAKE_TOKEN);
});
