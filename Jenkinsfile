pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    DEPLOY_HOST = '51.21.169.27'
    DEPLOY_USER = 'ubuntu'
    DEPLOY_DIR = '/home/ubuntu/TalkNest'
    PM2_APP = 'chat-app'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Prepare SSH') {
      steps {
        sshagent(credentials: ['ec2-ssh-key']) {
          sh '''
            set -e
            mkdir -p ~/.ssh
            ssh-keyscan -H "$DEPLOY_HOST" >> ~/.ssh/known_hosts
          '''
        }
      }
    }

    stage('Deploy To EC2') {
      steps {
        sshagent(credentials: ['ec2-ssh-key']) {
        sh '''
          set -e

          ssh "$DEPLOY_USER@$DEPLOY_HOST" "DEPLOY_DIR='$DEPLOY_DIR' PM2_APP='$PM2_APP' bash -s" << 'EOF'
            set -e
            cd "$DEPLOY_DIR"

            # Keep server-managed env files; update code from git.
            git pull

            npm install --prefix backend
            npm install --prefix frontend
            npm run build

            if [ ! -f backend/.env ]; then
              echo "Missing backend/.env in $DEPLOY_DIR/backend/.env"
              exit 1
            fi

            if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
              pm2 restart "$PM2_APP" --update-env
            else
              pm2 start backend/src/index.js --name "$PM2_APP"
            fi

            pm2 save
          EOF
        '''
        }
      }
    }

    stage('Health Check') {
      steps {
        sshagent(credentials: ['ec2-ssh-key']) {
        sh '''
          set -e
          ssh "$DEPLOY_USER@$DEPLOY_HOST" 'sleep 3; curl -fsS http://localhost:5001/ >/dev/null'
        '''
        }
      }
    }
  }

  post {
    success {
      echo 'Deployment completed successfully.'
    }
    failure {
      echo 'Deployment failed. Check console output and pm2 logs.'
      sshagent(credentials: ['ec2-ssh-key']) {
        sh 'ssh "$DEPLOY_USER@$DEPLOY_HOST" "pm2 logs \"$PM2_APP\" --lines 80 || true"'
      }
    }
  }
}
