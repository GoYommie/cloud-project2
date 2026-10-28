# Cloud Project 2 — Containerize and Run Locally

## Project Overview

This project demonstrates how to containerize a Node.js web application using Docker, run multiple services with Docker Compose, and test an AWS Lambda function locally using AWS SAM CLI.

The application uses two services:

- **Web:** A Node.js HTTP server that displays a webpage and tracks visits.
- **Cache:** A Redis service that stores the webpage visit counter.

The project also includes a Python AWS Lambda function that can be executed locally through Docker.

## Technologies Used

- Docker and Docker Compose
- Node.js 22 (Alpine Linux)
- Redis 7 (Alpine Linux)
- Python 3.12
- AWS SAM CLI

## Prerequisites

Install the following tools before running the project:

- Git
- Docker Engine with Docker Compose support, or Docker Desktop
- AWS SAM CLI (for testing the Lambda function)

Docker must be running before starting the containers or invoking the Lambda function.

## Run the Docker Application

### 1. Clone the repository

```bash
git clone https://github.com/GoYommie/cloud-project2.git
cd cloud-project2
```


### 2. Build and start the services

```bash
docker compose up -d --build
```

Docker Compose builds the Node.js application image and starts the Redis and web services. The web service waits until Redis passes its health check.

### 3. Open the application

Visit:

http://localhost:8080

Refresh the page to see the visit counter increase.

### 4. Check the containers

```bash
docker compose ps
docker compose logs --tail=20 web
docker compose logs --tail=20 cache
```

### 5. Test Redis

```bash
docker compose exec cache redis-cli ping
docker compose exec cache redis-cli GET visits
```

The first command should return `PONG`. The second displays the current visit counter.

### 6. Stop the application

```bash
docker compose down
```

## Run the AWS Lambda Function Locally

### 1. Enter the Lambda project directory

```bash
cd local-fn
```

### 2. Build the function

```bash
sam build
```

### 3. Invoke the function locally

```bash
sam local invoke HelloWorldFunction
```

The function should return a response containing:

```json
{
  "statusCode": 200,
  "body": "{\"message\": \"Hello, World!\", \"source\": \"AWS Lambda running locally with SAM\"}"
}
```

### 4. Return to the main project directory

```bash
cd ..
```

## Dockerfile Design

The Dockerfile uses a multi-stage build.

The first stage installs production dependencies using `npm ci --omit=dev`. The second stage copies the required dependencies and application files into the final image.

The application runs as the non-root `node` user.

## Docker Compose Design

Docker Compose manages two services:

- **cache:** Runs Redis and includes a health check using `redis-cli ping`.
- **web:** Builds the Node.js application, maps host port 8080 to container port 3000, and waits for Redis to become healthy.

The Node.js application connects to Redis using the Compose service name `cache`.

## Troubleshooting

### Check container status

```bash
docker compose ps -a
```

### Inspect resource usage

```bash
docker stats --no-stream
```

### Restart the web service

```bash
docker compose stop web
docker compose start web
docker compose logs --tail=10 web
```

### Check the Redis connection

```bash
docker compose exec cache redis-cli ping
```

### Check Lambda execution

```bash
cd local-fn
sam build
sam local invoke HelloWorldFunction
```

## Local Testing Results

The following tests were completed successfully:

- Built and ran the Node.js Docker image.
- Started the web and Redis services using Docker Compose.
- Confirmed Redis passed its health check.
- Confirmed the webpage visit counter updated in Redis.
- Inspected container status, logs, IP address, CPU usage, and memory usage.
- Stopped and restarted the web container successfully.
- Built the Python Lambda function with AWS SAM.
- Invoked `HelloWorldFunction` locally and received status code `200`.

## Cleanup

To stop and remove the Compose containers and network:

```bash
docker compose down
```

Generated dependencies and build files are excluded from Git using `.gitignore`.
