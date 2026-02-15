pipeline {
    agent any

    tools {
        nodejs 'Node18'
    }

    environment {
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

        // --- NEW STAGE: IDENTIFY ACTIVE ENVIRONMENT ---
        stage('Identify Environment') {
            steps {
                script {
                    // Check Nginx config to see if 'blue' is currently active, using docker exec to check the file inside the running Nginx container
                    def isBlue = sh(script: "docker exec nginx grep 'server frontend-blue' /etc/nginx/conf.d/default.conf", returnStatus: true) == 0

                    if (isBlue) {
                        env.CURRENT_ENV = "blue"
                        env.TARGET_ENV = "green"
                        echo "🔵 CURRENT ENV is BLUE. Deploying to 🟢 GREEN."
                    } else {
                        env.CURRENT_ENV = "green"
                        env.TARGET_ENV = "blue"
                        echo "🟢 CURRENT ENV is GREEN. Deploying to 🔵 BLUE."
                    }
                }
            }
        }

        stage('Build & Test Backend') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh "docker build -t backend:${BUILD_NUMBER} ."
                    sh "docker run --rm backend:${BUILD_NUMBER} npm test"
                }
            }
        }

        stage('Build & Test Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh "docker build -t frontend:${BUILD_NUMBER} ."
                    sh "docker run --rm frontend:${BUILD_NUMBER} npm test"
                }
            }
        }

        // --- NEW STAGE: DEPLOY TO IDLE ENVIRONMENT ---
        stage('Deploy to Target (Idle)') {
            steps {
                script {
                    echo "Deploying to ${TARGET_ENV}..."

                    // 1. Stop and Remove the old container of the Target env
                    sh "docker stop backend-${TARGET_ENV} || true"
                    sh "docker rm backend-${TARGET_ENV} || true"
                    sh "docker stop frontend-${TARGET_ENV} || true"
                    sh "docker rm frontend-${TARGET_ENV} || true"

                    // 2. Run the NEW Backend
                    sh """
                        docker run -d --name backend-${TARGET_ENV} \
                        --network devops-net \
                        backend:${BUILD_NUMBER}
                    """

                    // 3. Run the NEW Frontend
                    sh """
                        docker run -d --name frontend-${TARGET_ENV} \
                        --network devops-net \
                        frontend:${BUILD_NUMBER}
                    """
                }
            }
        }

        // --- NEW STAGE: SWITCH TRAFFIC ---
        stage('Switch Traffic (Nginx)') {
            steps {
                script {
                    echo "Switching traffic from ${CURRENT_ENV} to ${TARGET_ENV}..."

                    // We use sed to replace 'blue' with 'green' (or vice versa) in the Nginx config, doing this by copying the config out, editing it, copying it back, and reloading
                    sh """
                        docker exec nginx sh -c "sed 's/${CURRENT_ENV}/${TARGET_ENV}/g' /etc/nginx/conf.d/default.conf > /tmp/nginx.conf.tmp && cat /tmp/nginx.conf.tmp > /etc/nginx/conf.d/default.conf"
                    """

                    // Reload Nginx to apply changes without downtime
                    sh "docker exec nginx nginx -s reload"

                    echo "🚀 SUCCESSFULLY SWITCHED TO ${TARGET_ENV}!"
                }
            }
        }
    }
}