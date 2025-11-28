plugins {
    id("org.springframework.boot") version "3.3.3"
    id("io.spring.dependency-management") version "1.1.5"
    java
}

group = "campus"   // 패키지 안 써도 이 값은 그냥 프로젝트 식별자라 상관없음
version = "0.0.1"
java.sourceCompatibility = JavaVersion.VERSION_17

repositories { mavenCentral() }

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.security:spring-security-crypto")
    runtimeOnly("com.mysql:mysql-connector-j:8.4.0")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
}



tasks.withType<Test> { useJUnitPlatform() }
