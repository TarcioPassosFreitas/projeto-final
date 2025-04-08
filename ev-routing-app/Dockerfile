# Etapa 1: build do frontend
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Etapa 2: imagem final para servir frontend + iniciar bridge
FROM node:20-slim
WORKDIR /app

# Instalar serve para hospedar o frontend
RUN npm install -g serve

# Copiar arquivos do app e da bridge
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/bridge ./bridge
COPY --from=builder /app/package*.json ./

# Reinstalar dependências mínimas (para rodar bridge)
RUN npm install --omit=dev

# Expor a porta do frontend
EXPOSE 5173

# Comando: iniciar a bridge e o frontend juntos
CMD node bridge/bridge.cjs & serve -s dist -l 5173
