# Use an official Node.js 18 image
FROM node:18

# Install cron
RUN apt-get update && apt-get install -y cron

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Copy your cron-jobs into /etc/cron.d (system-level cron format)
RUN chmod 0644 /app/cron-jobs
RUN cp /app/cron-jobs /etc/cron.d/cron-jobs

# (Remove the line 'RUN crontab /etc/cron.d/cron-jobs' 
#  because /etc/cron.d/cron-jobs is enough for system-level cron.)

# Add the script that sets up env + starts cron + starts server
COPY start-cron.sh /app/start-cron.sh
RUN chmod +x /app/start-cron.sh

EXPOSE 8080

# Use start-cron.sh as the container's startup command
CMD ["/app/start-cron.sh"]
