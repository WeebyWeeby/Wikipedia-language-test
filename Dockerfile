FROM mcr.microsoft.com/playwright:v1.62.1-noble

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV CI=1

CMD ["npm", "run", "test:chromium"]