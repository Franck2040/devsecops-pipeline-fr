# VULN-008 : image de base node:16 EOL depuis septembre 2023.
# Détecté par : Trivy image (OS et Node CVE), Checkov (rule CKV_DOCKER_3).
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# VULN-009 : pas de USER non-root, container tourne en root.
# Détecté par : Checkov (rule CKV_DOCKER_8), Trivy config.

EXPOSE 3000
CMD ["node", "server.js"]
