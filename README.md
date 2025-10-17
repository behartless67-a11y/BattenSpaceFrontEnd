# The Batten Space - Frontend Portal

A secure, Azure Entra ID authenticated frontend portal for The Batten Space digital tools at the Frank Batten School of Leadership and Public Policy, University of Virginia.

## Features

- **Azure Easy Auth**: Secure authentication using Azure Static Web Apps built-in auth
- **Group-based Access Control**: Restricts access to `FBS_StaffAll` and `FBS_Community` groups
- **Modern UI**: Built with Next.js, React, and Tailwind CSS
- **UVA Branding**: Follows University of Virginia and Batten School design guidelines
- **Static Export**: Optimized for Azure Static Web Apps deployment
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 (Static Export)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Azure Static Web Apps Easy Auth
- **Deployment**: Azure Static Web Apps
- **Hosting**: Azure with custom domain (thebattenspace.org)

## Prerequisites

- Node.js 18+ and npm
- Azure subscription with Static Web Apps
- Access to Azure Key Vault for client secret
- GitHub account for CI/CD

## Configuration Details (From Admin)

Your Azure admin has already configured:

- **Client ID**: `0b45a06e-6b4a-4c3e-80ff-01d0c11a9def`
- **Tenant ID**: `7b3480c7-3707-4873-8b77-e216733a65ac`
- **Client Secret**: Stored in Azure Key Vault (see below)
- **Authorized Groups**: `FBS_StaffAll`, `FBS_Community`
- **Redirect URIs** (already configured in app registration):
  - `https://appexplorer.thebattenspace.org/.auth/login/aad/callback`
  - `https://calm-rock-0599eab0f.1.azurestaticapps.net/.auth/login/aad/callback`
  - `https://www.thebattenspace.org/.auth/login/aad/callback`

### Client Secret Location

The client secret is stored in Azure Key Vault:
- **Key Vault**: eieide2kv
- **Secret Name**: kvs-6582dc3a-472c-4589-8f88-d4025fc47bfe
- **Access URL**: https://portal.azure.com/#@myuva.onmicrosoft.com/asset/Microsoft_Azure_KeyVault/Secret/https://eieide2kv.vault.azure.net/secrets/kvs-6582dc3a-472c-4589-8f88-d4025fc47bfe/de56ef8f000e4b6badb6dc5be56f7ef5

**Important**: Use your eservices account (not SA account) to access the Key Vault. You'll receive automated emails every 6 months when the secret is rotated.

## Azure Static Web App Setup

### Step 1: Configure Easy Auth (Custom)

1. Go to your Azure Static Web App in the Azure Portal
2. Navigate to **Configuration** > **Authentication**
3. Click **Add** to add a custom identity provider
4. Select **Azure Active Directory**
5. Configure the following:

   **App registration**:
   - Registration type: **Provide app registration details**
   - Application (client) ID: `0b45a06e-6b4a-4c3e-80ff-01d0c11a9def`
   - Client secret: Get from Azure Key Vault (see above)
   - OpenID issuer URL: `https://login.microsoftonline.com/7b3480c7-3707-4873-8b77-e216733a65ac/v2.0`

   **Allowed token audiences**: (optional)
   - `api://0b45a06e-6b4a-4c3e-80ff-01d0c11a9def`

6. Click **Add** to save

### Step 2: Configure Environment Variables in Azure

Go to **Configuration** > **Application settings** and add:

| Name | Value |
|------|-------|
| `AZURE_CLIENT_ID` | `0b45a06e-6b4a-4c3e-80ff-01d0c11a9def` |
| `AZURE_CLIENT_SECRET` | Get from Key Vault (see above) |
| `AZURE_TENANT_ID` | `7b3480c7-3707-4873-8b77-e216733a65ac` |

### Step 3: GitHub Secrets

No GitHub secrets are required! The authentication is handled entirely by Azure Static Web Apps Easy Auth. The GitHub Actions workflow only needs:

- `AZURE_STATIC_WEB_APPS_API_TOKEN` - Your deployment token from Azure

To add this:
1. Go to your repository: https://github.com/behartless67-a11y/BattenSpaceFrontEnd
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Add **New repository secret**:
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: Get from Azure Portal > Your Static Web App > Overview > Manage deployment token

### Step 4: Deploy

Push to the `main` branch and GitHub Actions will automatically build and deploy your app!

```bash
git push origin main
```

## Local Development

For local development, Easy Auth won't work (it requires Azure infrastructure). To test locally:

```bash
npm install
npm run dev
```

**Note**: Authentication will not work locally. You'll need to test auth features in your deployed Azure environment.

## How It Works

### Authentication Flow

1. User visits the site
2. Azure Static Web Apps Easy Auth checks if user is authenticated
3. If not, redirects to `/.auth/login/aad`
4. User logs in with UVA credentials
5. Azure validates credentials and group membership
6. User is redirected back to the app with authentication cookie
7. Frontend checks user's groups via `/.auth/me` endpoint
8. If user is in `FBS_StaffAll` or `FBS_Community`, they see the dashboard
9. If not, they see an "Access Denied" message

### Group Membership Check

The app checks for group membership in [src/app/page.tsx](src/app/page.tsx):

```typescript
const REQUIRED_GROUPS = ["FBS_StaffAll", "FBS_Community"];
```

To modify which groups have access, edit this array.

### Easy Auth Endpoints

Azure Static Web Apps provides these built-in endpoints:

- `/.auth/login/aad` - Initiates Azure AD login
- `/.auth/logout` - Logs out the user
- `/.auth/me` - Returns current user info and roles

## Project Structure

```
BattenSpaceFrontEnd/
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml    # CI/CD workflow
├── public/
│   └── garrett-hall-sunset.jpg          # Background image
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── me/
│   │   │           └── route.ts         # User info API route
│   │   ├── layout.tsx                   # Root layout with fonts
│   │   ├── page.tsx                     # Main page with auth checks
│   │   └── globals.css                  # Global styles
│   ├── components/
│   │   ├── Header.tsx                   # Header with user info
│   │   └── Footer.tsx                   # Footer component
│   └── types/
│       └── auth.ts                      # TypeScript types for auth
├── .env.example                         # Environment variables reference
├── .gitignore                           # Git ignore rules
├── next.config.js                       # Next.js configuration
├── package.json                         # Dependencies
├── staticwebapp.config.json             # Azure Easy Auth configuration
├── tailwind.config.js                   # Tailwind CSS configuration
├── tsconfig.json                        # TypeScript configuration
└── README.md                            # This file
```

## Configuration

### Adding New Tools

Edit [src/app/page.tsx](src/app/page.tsx) and add new tools to the `tools` array:

```typescript
const tools: Tool[] = [
  {
    id: "unique-id",
    name: "Tool Name",
    description: "Description of the tool",
    url: "https://tool-url.com",
    icon: "wrench", // or "users", "file", "chart", "database", "link"
    category: "Category Name",
  },
  // ... more tools
];
```

### Modifying Access Control

To change which groups can access the application, edit the `REQUIRED_GROUPS` array in [src/app/page.tsx](src/app/page.tsx):

```typescript
const REQUIRED_GROUPS = ["FBS_StaffAll", "FBS_Community", "YourNewGroup"];
```

The app will grant access if the user is in **ANY** of the listed groups.

### Customizing Branding

- **Colors**: Edit [tailwind.config.js](tailwind.config.js) and [src/app/globals.css](src/app/globals.css)
- **Fonts**: Modify [src/app/layout.tsx](src/app/layout.tsx)
- **Background Image**: Replace [public/garrett-hall-sunset.jpg](public/garrett-hall-sunset.jpg)
- **Header/Footer**: Edit [src/components/Header.tsx](src/components/Header.tsx) and [src/components/Footer.tsx](src/components/Footer.tsx)

## Deployment

The application automatically deploys to Azure Static Web Apps when you push to the `main` branch via GitHub Actions.

### Build Process

1. GitHub Actions runs on push to `main`
2. Installs dependencies with `npm ci`
3. Builds static export with `npm run build`
4. Deploys to Azure Static Web Apps
5. Azure Easy Auth handles authentication

### Monitoring

Check deployment status:
- **GitHub Actions**: https://github.com/behartless67-a11y/BattenSpaceFrontEnd/actions
- **Azure Portal**: Your Static Web App resource > Deployment history

## Troubleshooting

### Users Can't Log In

**Solution**:
- Verify Easy Auth is configured in Azure Portal
- Check that all three configuration values are set (Client ID, Secret, Tenant ID)
- Ensure redirect URIs match in the app registration
- Verify client secret hasn't expired (check email for rotation notices)

### Access Denied After Login

**Problem**: User sees "Access Denied" message

**Solution**:
- Verify the user is a member of `FBS_StaffAll` or `FBS_Community` groups in Azure AD
- Check that "Emit groups as role claims" is enabled in app registration (already done by admin)
- The user may need to log out and log back in after being added to a group

### Build Failures

**Problem**: GitHub Actions workflow fails

**Solution**:
- Check that `AZURE_STATIC_WEB_APPS_API_TOKEN` secret is configured in GitHub
- Verify Node.js version compatibility (requires Node 18+)
- Review build logs in GitHub Actions for specific errors

### /.auth/me Returns No Groups

**Problem**: Groups aren't appearing in user roles

**Solution**:
- Verify "Emit groups as role claims" is enabled in Azure app registration (ID token)
- Check that the user is actually a member of the groups in Azure AD
- Try logging out and back in to refresh the token
- Contact your admin to verify the token configuration

## Managed Identity (MSI) - Optional

Your admin mentioned setting up Managed Identity so the Static Web App can read the client secret directly from Key Vault without human intervention. If you want this:

1. Contact your admin (Judy) to set up MSI
2. Benefits:
   - No need to manually retrieve secret from Key Vault
   - Automatic secret rotation handling
   - More secure (no human access to secrets)

## Support

For issues or questions:
- **Email**: bh4hb@virginia.edu
- **GitHub Issues**: https://github.com/behartless67-a11y/BattenSpaceFrontEnd/issues
- **Azure Admin**: Judy (for authentication/infrastructure issues)

## Important Notes

- The client secret in Key Vault is rotated every 6 months - you'll receive automated email notifications
- Always use your **eservices account** (not SA account) to access Azure resources
- Group membership changes may take a few minutes to propagate; users may need to log out and back in

## License

© 2025 Frank Batten School of Leadership and Public Policy, University of Virginia
