pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    DEPLOY_DIR = '/home/ubuntu/TalkNest'
    PM2_APP = 'chat-app'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Sync To Deploy Directory') {
      steps {
        sh '''
          set -e

          mkdir -p "$DEPLOY_DIR"

          # Keep runtime env files on server; sync application code from Jenkins workspace.
          rsync -a --delete \
            --exclude '.git' \
            --exclude 'node_modules' \
            --exclude 'backend/node_modules' \
            --exclude 'frontend/node_modules' \
            --exclude 'backend/.env' \
            --exclude 'frontend/.env' \
            "$WORKSPACE"/ "$DEPLOY_DIR"/
        '''
      }
    }

    stage('Install Dependencies') {
      steps {
        sh '''
          set -e
          cd "$DEPLOY_DIR"
          npm install --prefix backend
          npm install --prefix frontend
        '''
      }
    }

    stage('Build Frontend') {
      steps {
        sh '''
          set -e
          cd "$DEPLOY_DIR"
          npm run build
        '''
      }
    }

    stage('Deploy With PM2') {
      steps {
        sh '''
          set -e
          cd "$DEPLOY_DIR"

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
        '''
      }
    }

    stage('Health Check') {
      steps {
        sh '''
          set -e
          sleep 3
          curl -fsS http://localhost:5001/ >/dev/null
        '''
      }
    }
  }

  post {
    success {
      echo 'Deployment completed successfully.'
    }
    failure {
      echo 'Deployment failed. Check console output and pm2 logs.'
      sh 'pm2 logs "$PM2_APP" --lines 80 || true'
    }
  }
}
