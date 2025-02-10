# Utilise l'image Node.js officielle
FROM node:18

# Définit le répertoire de travail
WORKDIR /app

# Copie les fichiers package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste de l'application
COPY . .

# Expose le port utilisé par l’API
EXPOSE 21401

# Définit la commande de démarrage
CMD ["npm", "run", "dev"]