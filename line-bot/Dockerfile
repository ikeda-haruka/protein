# Multi-stage build for lightweight production image
FROM eclipse-adoptium:21-jdk-jammy AS build
WORKDIR /app

# Copy gradle wrapper and build files
COPY gradlew gradlew.bat settings.gradle build.gradle ./
COPY gradle ./gradle

# Make gradlew executable
RUN chmod +x ./gradlew

# Download dependencies
RUN ./gradlew dependencies --no-daemon || true

# Copy source code and build jar
COPY src ./src
RUN ./gradlew bootJar --no-daemon -x test

# Runtime stage
FROM eclipse-adoptium:21-jre-jammy
WORKDIR /app

# Expose server port
EXPOSE 8080

# Environment variables with defaults
ENV PORT=8080

# Copy jar from build stage
COPY --from=build /app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
