## DevOps Homework

## Overview
This project demonstrates a simple CI pipeline using containerized services:
- Gitea (Git engine)
- Jenkins (CI server)
- Nexus (Artifact repository)

All services are deployed using Docker Compose.


## Prerequisites
- Docker
- Docker Compose

## Start the environment
```bash
docker compose up -d
```

## Services

Gitea: http://localhost:3000

Jenkins: http://localhost:8080

Nexus: http://localhost:8081

### CI Pipeline Flow

Developer pushes code to Gitea

Gitea triggers Jenkins via webhook

Jenkins executes pipeline defined in Jenkinsfile

Jenkins builds Docker image and prepares artifact

Artifact is stored in Nexus
