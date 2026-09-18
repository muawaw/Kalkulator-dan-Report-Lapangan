# cPanel Automated Deployment Guide

This directory contains the deployment scripts and configurations for deploying the React/Vite frontend to cPanel shared hosting.

---

## 1. Prerequisites (New Device Setup)

Before running the deployment script on a new machine, ensure you have:

- **Git Bash** installed (or any Unix-like terminal environment).
- **Node.js & npm** installed.
- **cPanel Private SSH Key (`cpanel_key.pem`)** placed inside `frontend/deploy/`.

---

## 2. File Permissions Setup

1. **Restrict SSH Key Permissions:**
   Open Git Bash in the `frontend` directory and set read-only permissions for the SSH key:
   ```bash
   chmod 600 deploy/cpanel_key.pem

   ```
2. **Update Permission**
   Make the script executable:
   ```bash
   chmod +x deploy/deploy.sh

   ```
3. **Deploy Environment Example**
   CPANEL_USER=USER_CPANEL
   CPANEL_HOST=HOST_OR_IP
   REMOTE_PATH=/home/HOSTNAME/public_html
   SSH_PORT=22
   SSH_KEY_PATH=./deploy/cpanel_key.pem

4. Passphrase Authentication (SSH Agent)
   If cpanel_key.pem requires a passphrase, cache it in memory using ssh-agent before running the deployment:

Start the SSH Agent:

```bash
eval "$(ssh-agent -s)"
```

Add Key & Enter Passphrase Once:

```bash
ssh-add deploy/cpanel_key.pem
```

Enter your key passphrase when prompted.
Verify SSH Connection:

```bash
ssh USER@HOST_OR_IP
```

If connected successfully without entering a password, type exit to continue.

5. Running the Deployment
   **Add the Script to `package.json`:**
   Ensure your `package.json` inside `frontend/` includes the `deploy` command under `"scripts"`:

   ```json
   {
     "name": "frontend",
     "private": true,
     "version": "0.0.0",
     "type": "module",
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "lint": "eslint .",
       "preview": "vite preview",
       "deploy": "bash deploy/deploy.sh"
     }
   }
   ```

Run the automated build, archive, upload, and extraction process from the frontend/ directory:

```bash
npm run deploy
```

(Alternatively: bash deploy/deploy.sh)
