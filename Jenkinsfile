pipeline {
    agent any

    environment {
        NODE_VERSION = "18"
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/Shmulls/StudoApp'
            }
        }

        stage('Setup Node.js') {
            steps {
                sh 'curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -'
                sh 'apt-get install -y nodejs'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Lint and Tests') {
            steps {
                sh 'npm run lint'
                sh 'npm test'
            }
        }

        stage('Build Expo App') {
            steps {
                sh 'npx expo prebuild'
                sh 'npx expo run:android'
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
