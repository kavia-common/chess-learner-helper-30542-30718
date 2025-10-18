FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npx prisma generate && npm run build || true
EXPOSE 4000
CMD ["npm", "run", "start"]
