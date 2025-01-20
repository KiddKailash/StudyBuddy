FROM node:18
RUN apt-get update && apt-get install -y cron
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["sh", "-c", "cron && node server.js"]
