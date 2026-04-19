# SpringBatchbasedRAG

A Spring Batch-based Retrieval-Augmented Generation (RAG) starter project that demonstrates how to process, index, and serve documents for RAG workflows using Spring Boot and Spring Batch. This repository contains batch jobs to ingest data, process and embed documents, and update a vector store for use in RAG pipelines.

## Features

- Spring Boot application with Spring Batch jobs for document ingestion and processing
- Hooks for embedding generation (OpenAI/other providers) and vector store updates
- Configurable batch and chunking settings
- Example job configurations and simple job launcher

## Prerequisites

- Java 17 (or Java 11+) installed
- Maven 3.6+ (or Gradle if you prefer — update build steps accordingly)
- An embedding provider API key (e.g., OpenAI) and/or vector database endpoint if used

## Installation

1. Clone the repository:

   git clone https://github.com/Hari9704/SpringBatchbasedRAG.git
   cd SpringBatchbasedRAG

2. Configure application properties:

   - Edit `src/main/resources/application.yml` or `application.properties` and set required values such as embedding provider API keys, vector DB connection settings, and Spring Batch datasource if you want persistent job repository.
   - You can also provide configuration via environment variables. Typical keys:
     - OPENAI_API_KEY (or PROVIDER_API_KEY)
     - VECTOR_DB_URL, VECTOR_DB_API_KEY
     - spring.datasource.* (if using a DB for Spring Batch job repository)

3. Build the project:

   mvn clean package

## Running

- Run the Spring Boot application:

  java -jar target/*.jar

- Jobs can be executed using the included job launcher or REST endpoints (if enabled). Example `curl` to launch a job (adjust to your actual endpoint):

  curl -X POST "http://localhost:8080/actuator/batch/jobs/yourJobName" -H "Content-Type: application/json" -d '{}' 

- Monitor job/step status via logs or Spring Boot Actuator endpoints if configured.

## Configuration

- Batch settings such as chunk size, commit interval, and parallelism are defined in application configuration files.
- Embedding provider and vector store integration points are implemented as service interfaces. Replace or configure implementations as needed.

## Development & Testing

- Run tests:

  mvn test

- Run the app from your IDE by starting the main Spring Boot application class.

## Contributing

Contributions are welcome. Please open an issue to discuss changes or submit a pull request with a clear description and tests where appropriate.

## License

Specify a license for your project (e.g., MIT). If you don't have one yet, add a LICENSE file.

---

Notes:
- Update the README with project-specific details (job names, REST endpoints, configuration keys) when available.
- If you want, I can customize the README further with exact job names and example configuration from your codebase — just grant access or paste the relevant files.