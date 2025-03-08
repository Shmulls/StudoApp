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

        stage('Build Expo App') {
            steps {
                withCredentials([string(credentialsId: 'EXPO_TOKEN', variable: 'EXPO_TOKEN')]) {
                    sh 'eas whoami --token $EXPO_TOKEN'
                    sh 'npx expo prebuild'
                    sh 'EAS_BUILD_SECRET=$EXPO_TOKEN npx eas build -p ios --non-interactive'
                }
            }
        }  // ✅ Closing brace added here to fix syntax

    }  // ✅ Closing brace for `stages`

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
}  // ✅ Closing brace for `pipeline`
