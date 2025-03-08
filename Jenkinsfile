pipeline {
    agent any

    environment {
        NODE_VERSION = "18"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'Shmuels', 
                    url: 'https://github.com/Shmulls/StudoApp.git'
            }
        }

        stage('Setup Node.js') {
            steps {
                sh 'export PATH="/var/jenkins_home/nodejs/bin:$PATH" && node -v && npm -v'
                sh 'npm install -g expo-cli --unsafe-perm'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'export PATH="/var/jenkins_home/nodejs/bin:$PATH" && npm install'
            }
        }

        stage('Run Lint and Tests') {
            steps {
                sh 'export PATH="/var/jenkins_home/nodejs/bin:$PATH" && npm run lint'
                sh 'export PATH="/var/jenkins_home/nodejs/bin:$PATH" && npm test'
            }
        }

        stage('Build Expo App') {
            steps {
                sh 'export PATH="/var/jenkins_home/nodejs/bin:$PATH" && npx expo prebuild'
                sh 'export PATH="/var/jenkins_home/nodejs/bin:$PATH" && npx expo run:android'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '**/build/**/*.apk', fingerprint: true
        }
        failure {
            echo 'Build failed!'
        }
        success {
            echo 'Build successful!'
        }
    }
}
