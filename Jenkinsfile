pipeline {
    agent any

    environment {
        NODE_VERSION = "18"
        PATH = "/var/jenkins_home/nodejs/bin:/var/jenkins_home/.npm-global/bin:$PATH"
        NPM_CONFIG_PREFIX = "/var/jenkins_home/.npm-global"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'Shmuels', url: 'https://github.com/Shmulls/StudoApp.git'
            }
        }

        stage('Setup Node.js') {
            steps {
                sh 'node -v'
                sh 'npm -v'
                sh 'mkdir -p /var/jenkins_home/.npm-global'
                sh 'npm config set prefix "/var/jenkins_home/.npm-global"'
                sh 'npm install -g expo-cli'
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
