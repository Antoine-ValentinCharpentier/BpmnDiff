# Étape 1 : build du projet avec Maven
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src

RUN mvn clean package -DskipTests

# Étape 2 : exécution avec un JRE léger
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 9000

ENTRYPOINT ["java", "-jar", "app.jar"]
