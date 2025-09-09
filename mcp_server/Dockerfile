# Use Node.js base image
FROM node:20-alpine

# Set working directory
WORKDIR /src

# Copy package.json and lockfile
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the app
COPY . .

# Build step (if needed)
RUN npm run build

# Expose port
EXPOSE 4000

# Start command 
CMD ["npm", "run", "server"]
