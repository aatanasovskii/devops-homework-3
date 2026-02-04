pipeline {
    agent any

    tools {
        nodejs 'Node18'
    }

    environment {
        // Nexus Configuration
        NEXUS_URL = 'http://nexus:8081'
        NEXUS_REPO = 'my-raw-repo'
        NEXUS_CREDS = 'admin:admin123'
        GIT_REPO_URL = 'http://gitea:3000/aatanasovskii/simple-docker-app.git'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: "${GIT_REPO_URL}"
            }
        }

        // --- BACKEND PIPELINE ---
        stage('Process Backend') {
            steps {
                dir('backend') {
                    echo '--- 1. Installing Backend Dependencies ---'
                    sh 'npm install'

                    // There is no 'npm test' because the simple app has no tests yet.

                    echo '--- 2. Building Backend Docker Image ---'
                    // We name it backend-<build_number>
                    sh "docker build -t backend:${BUILD_NUMBER} ."

                    echo '--- 3. Packaging & Uploading Backend ---'
                    sh "tar -czf backend-${BUILD_NUMBER}.tar.gz index.js package.json Dockerfile"

                    sh """
                        curl -v -u ${NEXUS_CREDS} --upload-file backend-${BUILD_NUMBER}.tar.gz \
                        ${NEXUS_URL}/repository/${NEXUS_REPO}/backend-${BUILD_NUMBER}.tar.gz
                    """
                }
            }
        }

        // --- FRONTEND PIPELINE ---
        stage('Process Frontend') {
            steps {
                dir('frontend') {
                    echo '--- 1. Installing Frontend Dependencies ---'
                    sh 'npm install'

                    echo '--- 2. Building Frontend Docker Image ---'
                    sh "docker build -t frontend:${BUILD_NUMBER} ."

                    echo '--- 3. Packaging & Uploading Frontend ---'
                    sh "tar -czf frontend-${BUILD_NUMBER}.tar.gz index.js package.json Dockerfile"

                    sh """
                        curl -v -u ${NEXUS_CREDS} --upload-file frontend-${BUILD_NUMBER}.tar.gz \
                        ${NEXUS_URL}/repository/${NEXUS_REPO}/frontend-${BUILD_NUMBER}.tar.gz
                    """
                }
            }
        }
    }

    post {
        success {
            echo "SUCCESS: Uploaded backend-${BUILD_NUMBER}.tar.gz and frontend-${BUILD_NUMBER}.tar.gz to Nexus!"
        }
        failure {
            echo "Pipeline Failed."
        }
    }
}