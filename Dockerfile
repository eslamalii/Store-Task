# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install python and build dependencies
RUN apk add --no-cache python3 py3-pip build-base sqlite

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:prod"]
