# Captures d'ecran

Captures pour illustrer le fonctionnement du pipeline. Servent au README
principal et au futur portfolio sur kenmeugnecalixte.com.

## Captures attendues

Les captures suivantes restent a prendre depuis l'interface GitHub du repo
et a deposer dans ce dossier. Nommage strict pour cohérence.

| Fichier                          | Contenu                                                                 | Source                                              |
|----------------------------------|-------------------------------------------------------------------------|-----------------------------------------------------|
| `01-pipeline-green.png`          | Run pipeline.yml avec les 5 layers vertes                              | Actions / DevSecOps Pipeline / dernier run         |
| `02-release-with-sboms.png`      | Page release v0.1.0-rc1 avec les 3 SBOM en assets                       | Releases / v0.1.0-rc1                              |
| `03-security-tab-findings.png`   | Onglet Security avec les findings SARIF de Checkov et Trivy            | Security / Code scanning alerts                    |
| `04-dast-issue.png`              | Issue creee par ZAP avec les findings DAST                              | Issues / [DAST] ZAP baseline scan findings         |
| `05-actions-overview.png`        | Vue des 3 workflows : pipeline, release, dast-nightly                  | Actions / vue All workflows                        |
| `06-workflow-runs-history.png`   | Historique des runs montrant la stabilite (vert majoritaire)            | Actions / liste des runs                           |

## Procedure pour capturer

1. Aller sur l'URL source indiquee dans le tableau ci-dessus
2. Capturer la zone pertinente (idealement 1200x800 ou plus, format PNG)
3. Renommer selon la convention `NN-description.png`
4. Deposer dans ce dossier `docs/screenshots/`
5. Apres avoir depose les 6 captures, lancer :
   ```bash
   cd ~/projects/devsecops-pipeline-fr
   git add docs/screenshots/
   git commit -m "docs: add pipeline execution screenshots for portfolio"
   git push
   ```

## Apres l'ajout

Une fois les captures depo­sees et poussees, elles seront accessibles via :

```
https://github.com/Franck2040/devsecops-pipeline-fr/blob/main/docs/screenshots/01-pipeline-green.png
```

Le README principal pourra etre enrichi d'une section "Screenshots" qui les
embarque inline. Cette etape est laissee manuelle pour donner du controle
qualite sur les captures.
