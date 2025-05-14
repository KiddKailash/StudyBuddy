# 1. Use an official Node.js 18 image
FROM node:18

# 2. Install cron
RUN apt-get update && apt-get install -y cron

# 3. Create a working directory
WORKDIR /app

# 4. Copy package.json (and package-lock.json if present) from the build context root to /app
COPY package.json ./
RUN npm install

# 5. Copy the rest of your repository into /app
COPY . .

# 6. Make your cron-jobs file readable, then copy it into /etc/cron.d/
#    (assuming you have cron/cron-jobs in the repo root)
RUN chmod 0644 /app/cron/cron-jobs
RUN cp /app/cron/cron-jobs /etc/cron.d/cron-jobs

# 7. Make the start-cron.sh script executable (in environment/)
RUN chmod +x /app/environment/start-cron.sh

# 8. Expose the port your server listens on
EXPOSE 8080

# 9. Start cron + Node server via the start-cron.sh script
CMD ["/app/environment/start-cron.sh"]
