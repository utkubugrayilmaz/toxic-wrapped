# ============== BUILD STAGE ==============
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Maven wrapper ve pom.xml kopyala (cache için)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Dependency'leri indir (cache layer)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Source kopyala ve build
COPY src src
RUN ./mvnw package -DskipTests -B

# ============== RUNTIME STAGE ==============
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Güvenlik: non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -D appuser

# Jar kopyala
COPY --from=builder /app/target/*.jar app.jar

# Ownership
RUN chown -R appuser:appgroup /app
USER appuser

# Port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8081/api/v1/health || exit 1

# Run
ENTRYPOINT ["java", "-jar", "app.jar"]