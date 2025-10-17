# The Batten Space - Frontend Portal

A secure, Azure Entra ID authenticated frontend portal for The Batten Space digital tools at the Frank Batten School of Leadership and Public Policy, University of Virginia.

## Features

- **Azure Entra ID Authentication**: Secure single sign-on using Microsoft Entra (formerly Azure AD)
- **Group-based Access Control**: Restrict access to specific Entra security groups
- **Modern UI**: Built with Next.js, React, and Tailwind CSS
- **UVA Branding**: Follows University of Virginia and Batten School design guidelines
- **Static Export**: Optimized for Azure Static Web Apps deployment
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 (Static Export)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Azure MSAL (Microsoft Authentication Library)
- **Deployment**: Azure Static Web Apps
- **Hosting**: Azure with custom domain (thebattenspace.org)

## Prerequisites

- Node.js 18+ and npm
- Azure subscription with appropriate permissions
- Azure Entra ID (formerly Azure AD) tenant
- GitHub account for CI/CD

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/behartless67-a11y/BattenSpaceFrontEnd.git
cd BattenSpaceFrontEnd
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Azure Entra ID values:

```env
NEXT_PUBLIC_AZURE_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_AZURE_TENANT_ID=your-tenant-id-here
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
NEXT_PUBLIC_POST_LOGOUT_REDIRECT_URI=http://localhost:3000
NEXT_PUBLIC_AUTHORIZED_GROUPS=group-id-1,group-id-2
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Azure Setup

### Step 1: Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: The Batten Space Frontend
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**:
     - Type: Single-page application (SPA)
     - URI: `https://thebattenspace.org` (for production)
     - URI: `http://localhost:3000` (for development)
5. Click **Register**
6. Note down:
   - **Application (client) ID**
   - **Directory (tenant) ID**

### Step 2: Configure API Permissions

1. In your App Registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add these permissions:
   - `User.Read`
   - `GroupMember.Read.All`
6. Click **Add permissions**
7. Click **Grant admin consent** (requires admin privileges)

### Step 3: Configure Authentication

1. In your App Registration, go to **Authentication**
2. Under **Single-page application**, ensure your redirect URIs are listed:
   - `https://thebattenspace.org`
   - `http://localhost:3000` (for development)
3. Under **Implicit grant and hybrid flows**, ensure:
   - **Access tokens** is checked
   - **ID tokens** is checked
4. Under **Allow public client flows**: Set to **No**
5. Click **Save**

### Step 4: Get Authorized Group IDs

1. Go to **Azure Active Directory** > **Groups**
2. Find the security groups that should have access
3. Click on each group and note the **Object ID**
4. Add these IDs (comma-separated) to your environment variables

### Step 5: Create Azure Static Web App

1. In Azure Portal, click **Create a resource**
2. Search for **Static Web App** and select it
3. Click **Create**
4. Configure:
   - **Subscription**: Your subscription
   - **Resource Group**: Create or select existing
   - **Name**: batten-space-frontend
   - **Plan type**: Free or Standard
   - **Region**: East US 2 (or closest to you)
   - **Source**: GitHub
   - **Organization**: behartless67-a11y
   - **Repository**: BattenSpaceFrontEnd
   - **Branch**: main
   - **Build Presets**: Next.js
   - **App location**: /
   - **Output location**: out
5. Click **Review + create**, then **Create**
6. After deployment, note the **deployment token**

### Step 6: Configure Custom Domain

1. In your Azure Static Web App resource, go to **Custom domains**
2. Click **Add**
3. Choose **Custom domain on other DNS**
4. Enter: `thebattenspace.org`
5. Follow the instructions to add DNS records:
   - Add a CNAME record pointing to your Azure Static Web App URL
   - Or add a TXT record for validation
6. Wait for DNS propagation (can take up to 48 hours)
7. Azure will automatically provision a free SSL certificate

### Step 7: Configure GitHub Secrets

1. Go to your GitHub repository: https://github.com/behartless67-a11y/BattenSpaceFrontEnd
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Add the following secrets:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`: Your deployment token from Step 5
   - `AZURE_CLIENT_ID`: Your Application (client) ID from Step 1
   - `AZURE_TENANT_ID`: Your Directory (tenant) ID from Step 1
   - `REDIRECT_URI`: `https://thebattenspace.org`
   - `POST_LOGOUT_REDIRECT_URI`: `https://thebattenspace.org`
   - `AUTHORIZED_GROUPS`: Comma-separated group IDs from Step 4

## Deployment

The application automatically deploys to Azure Static Web Apps when you push to the `main` branch.

### Manual Deployment

If you need to trigger a manual deployment:

```bash
npm run build
```

Then push the changes:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

The GitHub Actions workflow will automatically build and deploy your application.

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

To change which groups can access the application, update the `NEXT_PUBLIC_AUTHORIZED_GROUPS` environment variable with comma-separated Entra group IDs.

To allow all authenticated users (no group restrictions), leave `NEXT_PUBLIC_AUTHORIZED_GROUPS` empty.

### Customizing Branding

- **Colors**: Edit [tailwind.config.js](tailwind.config.js) and [src/app/globals.css](src/app/globals.css)
- **Fonts**: Modify [src/app/layout.tsx](src/app/layout.tsx)
- **Background Image**: Replace [public/garrett-hall-sunset.jpg](public/garrett-hall-sunset.jpg)
- **Header/Footer**: Edit [src/components/Header.tsx](src/components/Header.tsx) and [src/components/Footer.tsx](src/components/Footer.tsx)

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
│   │   ├── layout.tsx                   # Root layout with fonts
│   │   ├── page.tsx                     # Main landing page
│   │   └── globals.css                  # Global styles
│   ├── components/
│   │   ├── AuthGuard.tsx                # Authentication wrapper
│   │   ├── MsalProvider.tsx             # MSAL provider wrapper
│   │   ├── Header.tsx                   # Header component
│   │   └── Footer.tsx                   # Footer component
│   ├── config/
│   │   └── authConfig.ts                # Azure MSAL configuration
│   └── lib/                             # Utility functions
├── .env.example                         # Environment variables template
├── .gitignore                           # Git ignore rules
├── next.config.js                       # Next.js configuration
├── package.json                         # Dependencies
├── staticwebapp.config.json             # Azure Static Web App config
├── tailwind.config.js                   # Tailwind CSS configuration
├── tsconfig.json                        # TypeScript configuration
└── README.md                            # This file
```

## Troubleshooting

### Authentication Issues

**Problem**: Users can't log in or get redirected incorrectly

**Solution**:
- Verify redirect URIs in Azure App Registration match your environment
- Check that the Client ID and Tenant ID are correct
- Ensure API permissions are granted and admin consent is provided

### Access Denied After Login

**Problem**: Users see "Access Denied" message after successful login

**Solution**:
- Verify the user is a member of one of the authorized groups
- Check that `NEXT_PUBLIC_AUTHORIZED_GROUPS` contains the correct group IDs
- Ensure the `GroupMember.Read.All` permission is granted

### Build Failures

**Problem**: GitHub Actions workflow fails

**Solution**:
- Check that all required secrets are configured in GitHub
- Verify Node.js version compatibility (requires Node 18+)
- Review build logs in GitHub Actions for specific errors

### Custom Domain Not Working

**Problem**: thebattenspace.org doesn't load the site

**Solution**:
- Verify DNS records are configured correctly
- Wait for DNS propagation (can take up to 48 hours)
- Check SSL certificate status in Azure Portal
- Ensure the domain is added and validated in Azure Static Web Apps

## Support

For issues or questions:
- **Email**: bh4hb@virginia.edu
- **GitHub Issues**: https://github.com/behartless67-a11y/BattenSpaceFrontEnd/issues

## License

© 2025 Frank Batten School of Leadership and Public Policy, University of Virginia
