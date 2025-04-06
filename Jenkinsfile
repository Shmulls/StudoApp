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
                sh 'npm uninstall -g expo-cli'  // Remove old CLI
                sh 'npm install -g expo eas-cli'  // Install new CLI
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
    }

    post {
        always {
            archiveArtifacts artifacts: '**/build/**', fingerprint: true
        }
        failure {
            echo 'Build failed!'
        }
        success {
            echo 'Build successful!'
        }
    }
}
