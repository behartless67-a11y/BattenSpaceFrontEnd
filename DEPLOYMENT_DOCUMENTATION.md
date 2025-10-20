# The Batten Space - Deployment Documentation

## Project Overview

**Project Name:** The Batten Space
**Live URL:** https://www.thebattenspace.org
**Azure URL:** https://brave-wave-04cf51710.3.azurestaticapps.net
**GitHub Repository:** https://github.com/behartless67-a11y/BattenSpaceFrontEnd
**Purpose:** Central hub for digital tools and resources at the Frank Batten School of Leadership and Public Policy

## Technology Stack

- **Framework:** Next.js 15.1.6 with Static Export
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Hosting:** Azure Static Web Apps
- **Authentication:** Azure Static Web Apps Easy Auth (Entra ID)
- **DNS Provider:** Hover
- **Version Control:** GitHub with automated deployments via GitHub Actions

## Authentication Configuration

### Overview
The application uses Azure Static Web Apps Easy Auth (formerly known as EasyAuth) which is a built-in authentication feature provided by Azure. This is **NOT** client-side MSAL authentication.

### Azure Configuration
- **Authentication Provider:** Azure Active Directory (Entra ID)
- **Tenant ID:** 7b3480c7-3707-4873-8b77-e216733a65ac
- **Client ID:** 1f06e0c0-21df-4411-9258-27f1e1e7e0f4
- **Authentication Mode:** Simple (configured in Azure Portal)
- **Required Groups:**
  - FBS_StaffAll
  - FBS_Community

### staticwebapp.config.json
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["*.{css,js,png,jpg,gif,svg,ico}", "/_next/*", "/api/*"]
  }
}
```

**Note:** Authentication configuration is handled entirely in the Azure Portal under "Simple" mode. The config file only contains navigation fallback for SPA routing.

### Azure Portal Settings
Authentication is configured directly in Azure Portal:
1. Navigate to Azure Static Web Apps resource
2. Go to "Authentication" section
3. Mode: Simple
4. Identity Provider: Azure Active Directory
5. Groups configured to emit as role claims (per admin Judy)

### Authentication Flow
1. User accesses the site
2. Application fetches `/.auth/me` endpoint (provided by Easy Auth)
3. If not authenticated, redirect to `/.auth/login/aad`
4. After authentication, check for required groups in userRoles array
5. Grant or deny access based on group membership

### Current Issue: Group Claims Not Appearing
**Status:** Waiting for admin (Judy) to configure

**Problem:** The `/.auth/me` endpoint returns:
```json
{
  "clientPrincipal": {
    "userRoles": ["anonymous", "authenticated"]
  }
}
```

But missing the expected groups: `FBS_StaffAll` and `FBS_Community`

**Temporary Solution:** Code currently allows all authenticated users:
```typescript
// TEMPORARY: Allow all authenticated users until groups are configured
const authorized = userRoles.includes('authenticated');
```

**Future Fix:** Once groups appear in userRoles, change to:
```typescript
const REQUIRED_GROUPS = ["FBS_StaffAll", "FBS_Community"];
const authorized = REQUIRED_GROUPS.some(group => userRoles.includes(group));
```

## Custom Domain Configuration

### DNS Configuration (Hover)
- **Provider:** Hover
- **Root Domain:** thebattenspace.org
- **Subdomain:** www.thebattenspace.org

#### DNS Records
```
Type: CNAME
Host: www
Target: brave-wave-04cf51710.3.azurestaticapps.net
```

#### Forward Configuration
- **From:** thebattenspace.org (root)
- **To:** www.thebattenspace.org
- **Note:** Forward may conflict with CNAME. If root domain issues occur, disable the forward.

### Azure Custom Domain
- **Domain:** www.thebattenspace.org
- **Status:** Validated
- **SSL Certificate:** Auto-provisioned by Azure
- **Certificate Expiry:** 2026-04-14

#### Configuration Steps
1. Azure Portal → Static Web Apps → Custom domains
2. Add custom domain: www.thebattenspace.org
3. Type: CNAME
4. Add CNAME record in DNS provider
5. Wait for validation (can take 5-10 minutes)
6. SSL certificate auto-provisions after validation

### Redirect URI Configuration
**Important:** Custom domain requires redirect URI in Azure App Registration

**Location:** Azure Portal → App Registrations → [Your App] → Authentication → Redirect URIs

**Required URIs:**
- https://brave-wave-04cf51710.3.azurestaticapps.net/.auth/login/aad/callback
- https://www.thebattenspace.org/.auth/login/aad/callback

## Known Issues and Solutions

### Issue 1: Authentication Loop on Custom Domain
**Symptom:** www.thebattenspace.org loops "Trying to sign in" at Microsoft login

**Root Cause:** Browser cache/cookies from previous configurations or DNS propagation delay

**Solution:**
- Works correctly in incognito/private browsing mode
- Clear browser cache and cookies for www.thebattenspace.org
- Wait 10-15 minutes for DNS/SSL propagation after adding custom domain
- Direct Azure URL (brave-wave-04cf51710.3.azurestaticapps.net) works correctly

**Status:** RESOLVED (works in incognito, regular browsers need cache clear)

### Issue 2: Root Domain DNS Issues
**Symptom:** thebattenspace.org shows "site can't be reached"

**Root Cause:** Conflict between Hover forward and DNS records

**Solution:**
- Keep the forward: thebattenspace.org → www.thebattenspace.org
- Remove any conflicting A or CNAME records on root domain
- Propagation can take up to 48 hours

**Status:** RESOLVED (domain now resolves)

### Issue 3: Groups Not in UserRoles
**Symptom:** /.auth/me returns only ["anonymous", "authenticated"], missing FBS groups

**Root Cause:** Azure AD not configured to emit group claims

**Solution:** Admin (Judy) needs to configure group emission in Azure AD

**Temporary Workaround:** Allow all authenticated users (currently in code)

**Status:** PENDING (waiting for Judy)

### Issue 4: Build Errors During Initial Setup
**Symptom:** GitHub Actions failing on build

**Issues Encountered:**
1. Missing package-lock.json → Fixed by running `npm install`
2. Tailwind class `bg-background` not found → Added colors to tailwind.config.js
3. API route incompatible with static export → Removed /api directory

**Status:** RESOLVED

## Design System

### Color Palette
- **Primary (UVA Navy):** #232D4B
- **Accent (UVA Orange):** #E57200
- **Light Variants:**
  - UVA Blue Light: #2A3C5F
  - UVA Orange Light: #F28C28
- **Backgrounds:**
  - Background: #fafafa
  - Foreground: #232D4B

### Typography
- **Font Family:** Libre Baskerville (serif)
- **Fallback:** system serif fonts

### Background Image
- **File:** garrett-hall-sunset.jpg
- **Effect:** Grayscale with 85% white overlay
- **Position:** Fixed background attachment

### Design Reference
Copied from: `C:\Users\bh4hb\OneDrive - University of Virginia\Desktop\AI_Working\TheBattenSpace`

## Available Tools

### 1. Room Reservations
- **URL:** https://roomres.thebattenspace.org/
- **Description:** View and manage Batten School room reservations and availability
- **Category:** Facilities
- **Icon:** BarChart

### 2. APP Explorer
- **URL:** https://appexplorer.thebattenspace.org/
- **Description:** Browse, search, and download Applied Policy Projects from the Batten School archives
- **Category:** Academic Resources
- **Icon:** Database

## Contact Information

**Support Email:** battensupport@virginia.edu
**Administrator:** Judy (for Azure/Entra ID configuration)

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm
- Git

### Local Development
```bash
# Clone repository
git clone https://github.com/behartless67-a11y/BattenSpaceFrontEnd.git
cd BattenSpaceFrontEnd

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Development Mode Authentication
In development mode (`NODE_ENV=development`), the app uses mock authentication:
```typescript
const mockUser = {
  clientPrincipal: {
    identityProvider: 'aad',
    userId: 'dev-user-123',
    userDetails: 'Dev User (Local)',
    userRoles: ['authenticated', 'FBS_StaffAll'],
  }
};
```

This allows testing without Azure authentication locally.

## Deployment

### Automatic Deployment
Deployments are automated via GitHub Actions:
1. Push to `main` branch
2. GitHub Actions workflow triggers
3. Azure Static Web Apps builds and deploys
4. Changes live within 2-3 minutes

### Workflow File
`.github/workflows/azure-static-web-apps.yml`

### Manual Deployment
Not recommended. Use GitHub for all deployments to maintain consistency.

## File Structure

```
BattenSpaceFrontEnd/
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml    # Deployment automation
├── public/
│   └── garrett-hall-sunset.jpg          # Background image
├── src/
│   ├── app/
│   │   ├── globals.css                  # Global styles
│   │   ├── layout.tsx                   # Root layout
│   │   └── page.tsx                     # Main page (authentication & tools)
│   ├── components/
│   │   ├── Header.tsx                   # App header with logo & user info
│   │   └── Footer.tsx                   # App footer with support email
│   └── types/
│       └── auth.ts                      # TypeScript types for auth
├── staticwebapp.config.json             # Azure Static Web Apps config
├── tailwind.config.js                   # Tailwind CSS configuration
├── tsconfig.json                        # TypeScript configuration
├── next.config.js                       # Next.js configuration (static export)
├── package.json                         # Dependencies
└── package-lock.json                    # Locked dependencies
```

## Important Code Sections

### Authentication Check (src/app/page.tsx:66-109)
```typescript
useEffect(() => {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    // Mock user data for local development
    const mockUser = { /* ... */ };
    setUserInfo(mockUser);
    setHasAccess(true);
    setLoading(false);
    return;
  }

  // Fetch user info from Azure Easy Auth (production only)
  fetch('/.auth/me')
    .then(res => res.json())
    .then(data => {
      setUserInfo(data);

      if (data.clientPrincipal) {
        // TEMPORARY: Allow all authenticated users until groups are configured
        const userRoles = data.clientPrincipal.userRoles || [];
        const authorized = userRoles.includes('authenticated');
        setHasAccess(authorized);
      } else {
        // Not authenticated
        window.location.href = '/.auth/login/aad';
      }
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching user info:', err);
      setLoading(false);
    });
}, []);
```

### Tools Configuration (src/app/page.tsx:19-36)
```typescript
const tools: Tool[] = [
  {
    id: "1",
    name: "Room Reservations",
    description: "View and manage Batten School room reservations and availability",
    url: "https://roomres.thebattenspace.org/",
    icon: "chart",
    category: "Facilities",
  },
  {
    id: "2",
    name: "APP Explorer",
    description: "Browse, search, and download Applied Policy Projects from the Batten School archives",
    url: "https://appexplorer.thebattenspace.org/",
    icon: "database",
    category: "Academic Resources",
  },
];
```

To add more tools, simply add objects to this array following the same structure.

## Future Enhancements

### When Groups Are Configured
1. Uncomment group check in [src/app/page.tsx:96](src/app/page.tsx#L96):
```typescript
const REQUIRED_GROUPS = ["FBS_StaffAll", "FBS_Community"];
const authorized = REQUIRED_GROUPS.some(group => userRoles.includes(group));
```

2. Remove temporary bypass:
```typescript
// Remove this line:
const authorized = userRoles.includes('authenticated');
```

### Adding New Tools
1. Edit [src/app/page.tsx:19-36](src/app/page.tsx#L19-L36)
2. Add new tool object to `tools` array
3. Commit and push to GitHub
4. Deployment happens automatically

### Adding New Groups
1. Update `REQUIRED_GROUPS` in [src/app/page.tsx:64](src/app/page.tsx#L64)
2. Ensure groups are configured in Azure AD to emit as role claims
3. Test with users in new groups

## Troubleshooting

### User Can't Login
1. Verify user is in FBS_StaffAll or FBS_Community group
2. Check /.auth/me to see what roles are returned
3. Check Azure Portal authentication logs

### Custom Domain Not Working
1. Verify DNS CNAME is correct in Hover
2. Check custom domain status in Azure Portal (should be "Validated")
3. Verify redirect URI includes custom domain in App Registration
4. Wait 10-15 minutes for DNS propagation
5. Clear browser cache and try incognito mode

### Authentication Loop
1. Try incognito/private browsing mode
2. If works in incognito → clear browser cache/cookies
3. If doesn't work in incognito → check redirect URIs in Azure
4. Wait for DNS/SSL propagation if custom domain just added

### Build Failures
1. Check GitHub Actions logs for specific error
2. Ensure package-lock.json is committed
3. Verify all dependencies are in package.json
4. Test build locally: `npm run build`

### Groups Not Appearing
1. Contact Azure AD admin (Judy)
2. Verify group configuration in Azure Portal
3. Check if groups configured to emit as role claims
4. Test with /.auth/me endpoint

## Change Log

### 2025-10-17
- Initial deployment completed
- Custom domain configured: www.thebattenspace.org
- Authentication working (Easy Auth with Entra ID)
- Two tools added: Room Reservations and APP Explorer
- Support email updated to battensupport@virginia.edu
- Removed Quick Links section
- Changed tool layout to grid-cols-2 (both tools on same row)
- DNS issues resolved
- Authentication loop in regular browser (works in incognito) - documented

### Known Issues as of 2025-10-17
1. **Groups not appearing in userRoles** - Waiting for admin configuration
2. **Authentication loop in cached browsers** - Resolved by clearing cache or using incognito
3. **Temporary bypass allowing all authenticated users** - Will be removed once groups are configured

## Additional Notes

### Why Easy Auth Instead of MSAL?
Initially implemented client-side MSAL authentication, but admin (Judy) indicated the app was already configured in Azure with Easy Auth. Pivoted to use Azure Static Web Apps built-in authentication which:
- Requires no client-side auth libraries
- Automatically handles redirect flows
- Provides /.auth/* endpoints
- Simpler configuration
- Better integration with Azure Static Web Apps

### Why Static Export?
Using Next.js static export (`output: 'export'`) because:
- Azure Static Web Apps optimized for static files
- No server-side rendering needed for this simple portal
- Faster deployments
- Lower costs
- Better performance

### Reference Projects
Design and authentication patterns based on existing UVA/Batten projects located at:
`C:\Users\bh4hb\OneDrive - University of Virginia\Desktop\AI_Working\TheBattenSpace`

## Support and Maintenance

For issues or questions:
1. Check this documentation first
2. Review Azure Portal logs
3. Contact battensupport@virginia.edu
4. For group/authentication issues, contact admin Judy

## Security Notes

- Authentication required for all routes (via Easy Auth)
- HTTPS enforced on Azure Static Web Apps
- SSL certificate auto-renewed by Azure
- Group-based access control (once configured)
- No sensitive data stored in client-side code
- All API calls go through authenticated Azure endpoints
