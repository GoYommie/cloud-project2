# Cloud Project 2 — Image and Service Rationale

## Overview

This project uses Docker to package a Node.js web application, Docker Compose to manage the application and its Redis cache, and AWS SAM CLI to test a Python Lambda function locally. The main goal is to create a reproducible environment that can be built and tested without deploying resources to a cloud provider.

## Container Image Selection

**Node.js 22 Alpine:** I selected `node:22-alpine` because it provides the Node.js runtime in an Alpine Linux-based image. It allows the application to run without installing Node.js directly on the host computer. My locally measured image size was approximately **239.1 MB**.

**Redis 7 Alpine:** I selected `redis:7-alpine` because Redis provides a simple key-value store that can be used to demonstrate communication between containers. The application uses Redis to increment and retrieve a page-visit counter. My locally measured Redis image size was approximately **57.3 MB**.

**Application image:** My final `cloud-project2-web:latest` image measured approximately **251.9 MB**. It contains the Node.js runtime, production dependencies, and application code. These measurements were obtained using `docker image inspect` and represent local image sizes.

## Multi-Stage Dockerfile

The Dockerfile uses two stages. The first stage installs production dependencies using `npm ci --omit=dev`. The second stage copies the installed dependencies and application files into the runtime image.

This separates dependency installation from the final runtime configuration and avoids including unnecessary installation steps in the final image. The application also runs as the non-root `node` user, reducing the privileges available to the application process.

Because both stages use the same Node.js Alpine base image, the multi-stage design does not automatically guarantee a smaller image than every possible single-stage alternative. Its main benefits here are a clearer build process and control over the files included in the runtime image.

## Docker Compose Service Design

Docker Compose manages two services: `web` and `cache`.

The `web` service builds the Node.js application image and publishes container port 3000 to the host. The `cache` service runs Redis on the internal Compose network.

The application connects to Redis using the hostname `cache`, which is resolved through Docker Compose service discovery.

Redis has a health check that executes `redis-cli ping`. The web service uses `depends_on` with `condition: service_healthy`, so Compose waits for Redis to report healthy before starting the web service. This improves startup coordination, although it does not guarantee Redis will remain available throughout the application's lifetime.

## Local AWS Lambda Testing

The project also includes a Python 3.12 Lambda function configured with an AWS SAM template. AWS SAM CLI runs the function locally using a Lambda-compatible Docker runtime.

The function was successfully built using `sam build` and invoked using `sam local invoke HelloWorldFunction`. It returned status code `200` and the message `Hello, World!`.

This demonstrates a serverless execution model alongside the continuously running Docker Compose services, without requiring an AWS deployment.

## Testing and Troubleshooting

I verified that both Compose services started successfully, Redis passed its health check, and the webpage visit counter increased when the page was refreshed.

I also inspected container logs, status, IP address, CPU usage, and memory usage. I tested stopping and restarting the web container while Redis remained healthy, and confirmed that the web application reconnected successfully.

## References

- Docker documentation — Multi-stage builds: https://docs.docker.com/build/building/multi-stage/
- Docker documentation — Compose startup order: https://docs.docker.com/compose/how-tos/startup-order/
- Docker Hub — Node official image: https://hub.docker.com/_/node
- Docker Hub — Redis official image: https://hub.docker.com/_/redis
- AWS documentation — AWS SAM local invoke: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-invoke.html
