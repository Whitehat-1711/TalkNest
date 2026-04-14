# TalkNest - Realtime Chat App

Full-stack realtime chat application with:

- Backend: Node.js + Express + Socket.IO + MongoDB Atlas
- Frontend: React + Vite + Tailwind + DaisyUI
- Deployment: EC2 + PM2
- CI/CD: Jenkins (Docker) + GitHub Webhook

## 1. Environment Setup

Create backend env file at `backend/.env`:

```dotenv
PORT=5001
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

NODE_ENV=production
CORS_ORIGIN=http://51.20.210.18,http://51.20.210.18:5001
COOKIE_SAME_SITE=lax
COOKIE_SECURE=false
```

Create frontend env file at `frontend/.env`:

```dotenv
VITE_API_BASE_URL=http://51.20.210.18:5001/api
VITE_SERVER_BASE_URL=http://51.20.210.18:5001
```

Notes:

- Use your own values for MongoDB, JWT, Cloudinary, and Groq API key.
- If frontend and backend are hosted on different HTTPS domains, use `COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true`.

## 2. Build and Run

From repository root:

```bash
npm run build
npm start
```

App URL:

- `http://51.20.210.18:5001`

## 3. PM2 Commands (EC2)

Start app:

```bash
cd /home/ubuntu/TalkNest
pm2 start backend/src/index.js --name chat-app
pm2 save
```

Auto-start on reboot (one-time):

```bash
pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

Then run the command printed by PM2 and save:

```bash
pm2 save
```

Useful checks:

```bash
pm2 list
pm2 logs chat-app --lines 80
pm2 restart chat-app --update-env
```

## 4. Jenkins on Docker (Single EC2)

Install Docker:

```bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker
```

Run Jenkins container:

```bash
docker volume create jenkins_home
docker run -d \
	--name jenkins \
	--restart unless-stopped \
	-p 8080:8080 -p 50000:50000 \
	-v jenkins_home:/var/jenkins_home \
	-v /var/run/docker.sock:/var/run/docker.sock \
	jenkins/jenkins:lts
```

Jenkins URL:

- `http://51.20.210.18:8080`

Initial admin password:

```bash
docker logs jenkins | grep -A 5 "Please use the following password"
```

## 5. Jenkins Credential Needed

In Jenkins:

- Manage Jenkins -> Credentials -> System -> Global -> Add Credentials

Use:

- Kind: `SSH Username with private key`
- ID: `ec2-ssh-key`
- Username: `ubuntu`
- Private key: paste full `.pem` content including BEGIN/END lines

## 6. Jenkins Job Configuration

Create a Pipeline job:

- Pipeline script from SCM
- Git repository: `https://github.com/Whitehat-1711/TalkNest`
- Branch: `*/main`
- Script Path: `Jenkinsfile`
- Build Trigger: `GitHub hook trigger for GITScm polling`

## 7. GitHub Webhook Configuration

In GitHub repo settings:

- Webhooks -> Add webhook
- Payload URL: `http://51.20.210.18:8080/github-webhook/`
- Content type: `application/json`
- Events: `Just the push event`
- Active: enabled

For HTTP demo setup, SSL verification can remain disabled.

## 8. MongoDB Atlas Network Access

In MongoDB Atlas -> Network Access, allow:

- `51.20.210.18/32`

Temporary demo fallback (less secure):

- `0.0.0.0/0`

## 9. Presentation Day Quick Start

After EC2 start:

```bash
ssh -i your-key.pem ubuntu@51.20.210.18
sudo systemctl start docker
docker start jenkins || true
pm2 resurrect || pm2 start /home/ubuntu/TalkNest/backend/src/index.js --name chat-app
pm2 save
```

Verify:

```bash
docker ps
pm2 list
curl -I http://localhost:5001/
```

## 10. Common Troubleshooting

### CORS error: Not allowed by CORS

Set `CORS_ORIGIN` in `backend/.env` to include both origins:

```dotenv
CORS_ORIGIN=http://51.20.210.18,http://51.20.210.18:5001
```

Then restart:

```bash
pm2 restart chat-app --update-env
```

### MongoDB connection error / IP not whitelisted

Add EC2 Elastic IP in Atlas Network Access and restart PM2.

### Jenkins page not reachable

Check:

- Jenkins container running: `docker ps`
- Security Group inbound for port `8080`

### Webhook not triggering build

Check:

- Jenkins job trigger enabled
- GitHub webhook delivery status is `200`
- Payload URL is correct and reachable
