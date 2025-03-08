pipeline {
    agent {
        docker {
            image 'node:16' // Use Node.js inside Docker
        }
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Shmulls/StudoApp'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build App') {
            steps {
                sh 'npm run build'
            }
        }
    }

    post {
        success {
            echo '✅ CI Pipeline Passed!'
        }
        failure {
            echo '❌ CI Failed! Check logs.'
        }
    }
}
