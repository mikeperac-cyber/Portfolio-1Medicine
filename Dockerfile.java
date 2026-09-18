FROM node:24-alpine AS assets
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM eclipse-temurin:21-jdk-alpine AS compiler
WORKDIR /app
COPY HealthWebService.java ./
RUN javac HealthWebService.java

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=compiler /app/*.class ./
COPY --from=assets /app/dist ./dist
COPY data ./data
ENV PORT=3000 WEB_ROOT=/app/dist
USER app
EXPOSE 3000
CMD ["java", "HealthWebService"]
