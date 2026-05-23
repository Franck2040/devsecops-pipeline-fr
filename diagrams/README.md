# Diagrammes

Ce dossier contient les diagrammes Mermaid du projet. Chaque diagramme est
versionne dans son fichier `.mmd` et embarque ci-dessous en rendu inline pour
visualisation directe sur GitHub.

## Pipeline DevSecOps

Architecture des 7 composite actions, leurs declencheurs et leurs artefacts.

```mermaid
%%{init: {'theme':'base', 'themeVariables':{
  'edgeLabelBackground':'#0d2a47',
  'lineColor':'#2B579A',
  'primaryColor':'#2B579A',
  'primaryTextColor':'#ffffff',
  'primaryBorderColor':'#0d2a47'
}}}%%
flowchart LR

    subgraph TRG[" Declencheurs "]
        direction TB
        T1[Push main<br/>PR]
        T2[Nightly cron]
        T3[Release tag]
        T4[Manual]
    end

    subgraph PIP[" Pipeline DevSecOps - 7 composite actions "]
        direction TB
        A1["1. Secrets<br/>Gitleaks"]
        A2["2. SAST<br/>Semgrep + CodeQL"]
        A3["3. SCA<br/>Trivy fs + npm audit"]
        A4["4. IaC<br/>Checkov"]
        A5["5. Container<br/>Trivy image"]
        A6["6. SBOM<br/>Syft CycloneDX"]
        A7["7. DAST<br/>OWASP ZAP"]

        A1 --> A2 --> A3 --> A4 --> A5
    end

    subgraph OUT[" Artefacts "]
        direction TB
        O1[Rapports JSON]
        O2["GitHub Security<br/>SARIF"]
        O3["SBOM CycloneDX<br/>signe Cosign"]
    end

    T1 ==> A1
    T4 ==> A1
    T2 -.->|nightly| A7
    T3 -.->|release| A6
    A5 -.->|build| A6

    A1 --> O1
    A2 --> O1
    A2 --> O2
    A3 --> O1
    A4 --> O1
    A5 --> O1
    A6 --> O3
    A7 --> O1

    classDef trigger fill:#0d2a47,stroke:#000000,color:#ffffff
    classDef action fill:#2B579A,stroke:#0d2a47,color:#ffffff
    classDef output fill:#1F5454,stroke:#000000,color:#ffffff

    class T1,T2,T3,T4 trigger
    class A1,A2,A3,A4,A5,A6,A7 action
    class O1,O2,O3 output
```

## Legende

- Bleu marine fonce : declencheurs (push, PR, cron, release, manual)
- Bleu brand : composite actions, executees en ordre dans le workflow
- Teal fonce : artefacts produits (rapports, SARIF, SBOM)
- Trait plein : flux principal sur push/PR
- Trait pointille : flux conditionnels (nightly, release, build)

## Fichiers source

- [pipeline.mmd](pipeline.mmd) : source Mermaid editable
