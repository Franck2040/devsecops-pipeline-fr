# Composite Action : Scan container (Trivy image)

Build du container et scan de l'image construite. Detecte les CVE :

- du systeme d'exploitation de base (alpine, debian, etc.)
- des packages Node installes via `npm install` dans le container
- de la runtime Node elle-meme

## Architecture

L'action enchaine 3 etapes :

1. `docker build` localement dans le runner (pas de push registry necessaire)
2. Trivy image en mode JSON (audit hors-ligne)
3. Trivy image en mode SARIF (remontee GitHub Security)

## Utilisation

```yaml
- name: Scan container
  uses: ./.github/actions/container
  with:
    image-tag: 'incident-tracker:ci-scan'
    dockerfile: './app/Dockerfile'
    fail-on-finding: 'false'
```

## Inputs

| Nom              | Type   | Defaut                          | Description                       |
|------------------|--------|---------------------------------|-----------------------------------|
| `image-tag`      | string | `incident-tracker:ci-scan`      | Tag local de l'image              |
| `build-context`  | string | `./app`                         | Contexte de build Docker          |
| `dockerfile`     | string | `./app/Dockerfile`              | Chemin du Dockerfile              |
| `trivy-severity` | string | `CRITICAL,HIGH,MEDIUM`          | Niveaux a reporter                |
| `fail-on-finding`| string | `false`                         | Echec CI si findings              |

## Outputs et artefacts

- Artifact `container-reports` : JSON + SARIF, retention 30 jours
- Onglet GitHub Security : CVE remontees comme alertes
- Annotation avec OS detecte et nombre de CVE

## Pourquoi pas de push vers un registry

Le scan se fait localement sur le runner GitHub Actions. Pousser l'image vers
un registry (Docker Hub, GHCR) demanderait des credentials et serait un
risque supplementaire (image vulnerable publique). Comme on ne deploie pas,
on garde l'image en cache local du runner et on la jette en fin de job.
