FROM eclipse-temurin:21-jdk

RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean

ENV JUNIT_VERSION=1.10.0
RUN mkdir -p /opt/junit && \
    curl -L -o /opt/junit/junit-platform-console-standalone.jar \
    https://repo1.maven.org/maven2/org/junit/platform/junit-platform-console-standalone/${JUNIT_VERSION}/junit-platform-console-standalone-${JUNIT_VERSION}.jar

RUN useradd -m user
USER user
WORKDIR /home/user