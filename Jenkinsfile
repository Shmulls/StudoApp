pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                git 'https://github.com/Shmulls/StudoApp'
            }
        }

        stage('Setup Node.js') {
            steps {
                sh 'node -v'
                sh 'npm -v'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install -g expo-cli'
                sh 'npm install'
            }
        }

        stage('Run Lint') {
            steps {
                sh 'npx eslint .'
            }
        }

        stage('Start Expo for iOS') {
            steps {
                sh 'expo start --ios'
            }
        }
    }
}
