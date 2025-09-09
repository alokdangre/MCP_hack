# --- Base build stage ---
    FROM node:20-alpine AS build

    WORKDIR /src
    
    # Install dependencies
    COPY package*.json ./
    RUN npm install
    
    # Copy source code
    COPY . .
    
    # Build TypeScript
    RUN npm run build
    
    # --- Runtime stage ---
    FROM node:20-alpine AS runtime
    
    WORKDIR /src
    
    COPY --from=build /src/package*.json ./
    COPY --from=build /src/node_modules ./node_modules
    COPY --from=build /src/dist ./dist
    
    # Environment
    ENV PORT=4000
    
    # Expose port for MCP
    EXPOSE 4000
    
    # Start server (http-server.js is your entry)
    CMD ["node", "dist/http-server.js"]
    