# FROM node:21.7.3-alpine3.20

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY prisma ./prisma

# COPY cron-jobs ./cron-jobs

# COPY results ./results

# RUN npx prisma generate 

# COPY . .

# EXPOSE 3000

# CMD ["node", "server.js"]

# ----------------------------------------------------------------

FROM node:21.7.3-alpine3.20

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma

# Set the DATABASE_URL environment variable
ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres?schema=public

# Generate Prisma Client
RUN npx prisma generate 

# Apply migrations to create/update tables in the database
# RUN npx prisma migrate deploy

# Copy the rest of the application code
COPY cron-jobs ./cron-jobs
COPY results ./results
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]
# CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
