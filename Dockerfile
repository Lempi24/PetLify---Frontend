# Wersja Node.js
FROM node:20

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj cały folder projektu PetLify
COPY PetLify ./PetLify

# Wejdź do katalogu z projektem
WORKDIR /app/PetLify

# Zainstaluj zależności i zbuduj projekt
RUN npm install
RUN npm run build

# Start serwera produkcyjnego Vite
CMD ["npm", "run", "start"]
