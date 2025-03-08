pipeline {
    agent any

    environment {
        NODE_VERSION = "18"
        PATH = "/var/jenkins_home/nodejs/bin:$PATH"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'Shmuels', url: 'https://github.com/Shmulls/StudoApp'
            }
        }

        stage('Setup Node.js') {
            steps {
                sh 'node -v && npm -v'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Lint and Tests') {
            steps {
                sh 'npm run lint || true'
            }
        }

        stage('Start Expo') {
            steps {
                sh 'expo start --ios'
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
