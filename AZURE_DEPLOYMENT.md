# Azure App Service Deployment Guide

## Prerequisites
- Azure account (https://portal.azure.com)
- Azure CLI installed (`winget install Microsoft.AzureCLI`)
- GitHub repository (for CI/CD)

---

## Step 1: Create Azure Resources

### Option A: Using Azure Portal (GUI)

1. **Create Resource Group**
   - Go to Azure Portal → Resource Groups → Create
   - Name: `designquest-rg`
   - Region: `East US` (or nearest to you)

2. **Create PostgreSQL Database**
   - Search "Azure Database for PostgreSQL flexible server"
   - Click Create
   - Settings:
     - Server name: `designquest-db`
     - Region: Same as resource group
     - PostgreSQL version: 16
     - Workload type: Development (cheapest)
     - Authentication: PostgreSQL authentication only
     - Admin username: `adminuser`
     - Password: `YourSecurePassword123!`
   - Networking: Allow public access + Add your IP
   - Click Review + Create

3. **Create App Service**
   - Search "App Service" → Create → Web App
   - Settings:
     - Name: `designquest-app` (will be designquest-app.azurewebsites.net)
     - Runtime stack: Node 20 LTS
     - Region: Same as database
     - Pricing: B1 (Basic) for testing, or Free F1
   - Click Review + Create

### Option B: Using Azure CLI (Terminal)

```powershell
# Login to Azure
az login

# Set variables
$RESOURCE_GROUP = "designquest-rg"
$LOCATION = "eastus"
$DB_SERVER = "designquest-db"
$DB_NAME = "designquest"
$DB_USER = "adminuser"
$DB_PASSWORD = "YourSecurePassword123!"
$APP_NAME = "designquest-app"
$APP_PLAN = "designquest-plan"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create PostgreSQL flexible server
az postgres flexible-server create `
  --resource-group $RESOURCE_GROUP `
  --name $DB_SERVER `
  --location $LOCATION `
  --admin-user $DB_USER `
  --admin-password $DB_PASSWORD `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --storage-size 32 `
  --version 16 `
  --public-access 0.0.0.0

# Create database
az postgres flexible-server db create `
  --resource-group $RESOURCE_GROUP `
  --server-name $DB_SERVER `
  --database-name $DB_NAME

# Create App Service plan
az appservice plan create `
  --name $APP_PLAN `
  --resource-group $RESOURCE_GROUP `
  --sku B1 `
  --is-linux

# Create Web App
az webapp create `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_PLAN `
  --runtime "NODE:20-lts"

# Get database connection string
$DB_HOST = "$DB_SERVER.postgres.database.azure.com"
$DATABASE_URL = "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}?sslmode=require"

# Set environment variables
az webapp config appsettings set `
  --resource-group $RESOURCE_GROUP `
  --name $APP_NAME `
  --settings `
    DATABASE_URL="$DATABASE_URL" `
    JWT_SECRET="your-super-secret-jwt-key-change-this" `
    NODE_ENV="production"

echo "Database URL: $DATABASE_URL"
echo "App URL: https://$APP_NAME.azurewebsites.net"
```

---

## Step 2: Update Project for PostgreSQL

### 2.1 Update Prisma Schema

Change `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2.2 Update local `.env`

```env
# For local development, keep using SQLite or set up local PostgreSQL
DATABASE_URL="postgresql://adminuser:YourSecurePassword123!@designquest-db.postgres.database.azure.com:5432/designquest?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-change-this"
```

### 2.3 Generate Prisma Client & Migrate

```powershell
# Generate new client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Seed the database
npm run db:seed
```

---

## Step 3: Deploy the App

### Option A: GitHub Actions (Recommended)

1. Push your code to GitHub

2. In Azure Portal:
   - Go to your App Service
   - Deployment Center → Source: GitHub
   - Authorize and select your repo
   - Azure will create a workflow file automatically

3. Or use the workflow file in `.github/workflows/azure.yml`

### Option B: Direct Deploy via ZIP

```powershell
# Build the app
npm run build

# Create deployment package
Compress-Archive -Path .next, package.json, package-lock.json, prisma, public, next.config.ts, node_modules -DestinationPath deploy.zip -Force

# Deploy
az webapp deployment source config-zip `
  --resource-group designquest-rg `
  --name designquest-app `
  --src deploy.zip
```

### Option C: Git Deploy

```powershell
# Configure git deployment
az webapp deployment source config-local-git `
  --name designquest-app `
  --resource-group designquest-rg

# Get the git URL (will show in output)
# Add as remote and push
git remote add azure https://designquest-app.scm.azurewebsites.net/designquest-app.git
git push azure main
```

---

## Step 4: Configure App Service Settings

In Azure Portal → App Service → Configuration:

### Application Settings (already set via CLI):
| Name | Value |
|------|-------|
| DATABASE_URL | postgresql://... |
| JWT_SECRET | your-secret |
| NODE_ENV | production |

### General Settings:
- Startup Command: `npm run start`
- Always On: Yes (for B1 tier and above)
- HTTP Version: 2.0

---

## Step 5: Run Database Migration on Azure

```powershell
# SSH into the app service
az webapp ssh --name designquest-app --resource-group designquest-rg

# Inside SSH:
cd /home/site/wwwroot
npx prisma db push
npx prisma db seed
```

Or use Kudu console:
- Go to `https://designquest-app.scm.azurewebsites.net`
- Debug Console → CMD
- Navigate to site/wwwroot
- Run prisma commands

---

## Troubleshooting

### View Logs
```powershell
az webapp log tail --name designquest-app --resource-group designquest-rg
```

### Common Issues

1. **Database connection failed**
   - Check firewall rules on PostgreSQL (allow Azure services)
   - Verify DATABASE_URL is correct
   - Ensure `?sslmode=require` is in the URL

2. **Build fails**
   - Check Node version matches (20.x)
   - Ensure all dependencies are in `dependencies`, not `devDependencies`

3. **App won't start**
   - Check startup command
   - View logs for errors
   - Ensure PORT is not hardcoded (use `process.env.PORT`)

---

## Cost Estimate (Monthly)

| Resource | Tier | Est. Cost |
|----------|------|-----------|
| App Service | B1 Basic | ~$13 |
| PostgreSQL | Burstable B1ms | ~$15 |
| **Total** | | **~$28/month** |

For development/testing, you can use:
- App Service: F1 Free (limited)
- PostgreSQL: Burstable B1ms (cheapest)

---

## Next Steps

1. Set up custom domain
2. Configure SSL certificate
3. Set up staging slot for testing
4. Configure auto-scaling
5. Set up monitoring with Application Insights
