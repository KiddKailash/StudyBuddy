# Use an official Node.js 18 image
FROM node:18

# Install cron
RUN apt-get update && apt-get install -y cron

# Create a working directory
WORKDIR /app

# Copy package files
COPY package.json ./
# If you don’t have package-lock.json, use only COPY package.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of your code (including scripts/ and cron-jobs)
COPY . .

# Make the cron file readable by cron
RUN chmod 0644 /app/cron-jobs

# Copy our cron file into the cron.d directory
RUN cp /app/cron-jobs /etc/cron.d/cron-jobs

# Register the cron job
RUN crontab /etc/cron.d/cron-jobs

# Expose your app port (8080 is common in DigitalOcean App Platform)
EXPOSE 8080

# Start cron in the background, then run your Node server
CMD ["sh", "-c", "cron && node server.js"]
