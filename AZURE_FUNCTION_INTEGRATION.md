# Azure Function Integration - GetUserRoles

## Overview

This document explains how to integrate an Azure Function to provide role mapping for The Batten Space application. This is an alternative approach to relying on Azure AD to emit group claims directly.

## Background

Currently, the application expects groups (FBS_StaffAll, FBS_Community) to appear in the `userRoles` array from the `/.auth/me` endpoint. However, Azure AD is not configured to emit these groups, and waiting for admin configuration may take time.

## Solution: Azure Function for Role Mapping

We can deploy an Azure Function that:
1. Reads the `x-ms-client-principal` header (provided by Easy Auth)
2. Extracts user information and groups
3. Maps Azure AD groups to application roles
4. Returns the roles to the frontend

## Reference Implementation

A working implementation exists in the RoomTool project:
`C:\Users\bh4hb\OneDrive - University of Virginia\Desktop\AI_Working\RoomTool\azure-function\GetUserRoles\`

### Key Components

#### 1. Function Code (__init__.py)
```python
import logging
import json
import base64
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Map Entra ID group membership to application roles.
    """
    logging.info('GetUserRoles function triggered')

    # Get the user claims from x-ms-client-principal header
    client_principal_header = req.headers.get('x-ms-client-principal')

    if not client_principal_header:
        return func.HttpResponse(
            json.dumps({"roles": []}),
            mimetype="application/json",
            status_code=200
        )

    try:
        # Decode the base64 encoded header
        claims_data = base64.b64decode(client_principal_header).decode('utf-8')
        claims = json.loads(claims_data)

        user_roles = []
        user_claims = claims.get('claims', [])

        # Look for group claims
        for claim in user_claims:
            claim_type = claim.get('typ', '')
            claim_value = claim.get('val', '')

            if claim_type == 'roles' or claim_type == 'groups':
                # Map FBS groups to application roles
                if claim_value == 'FBS_StaffAll':
                    user_roles.append('staff')
                elif claim_value == 'FBS_Community':
                    user_roles.append('community')

        # Add authenticated role for all logged in users
        if 'authenticated' not in user_roles:
            user_roles.append('authenticated')

        return func.HttpResponse(
            json.dumps({"roles": user_roles}),
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:
        logging.error(f'Error processing user roles: {str(e)}')
        return func.HttpResponse(
            json.dumps({"roles": ["authenticated"]}),
            mimetype="application/json",
            status_code=200
        )
```

#### 2. Function Configuration (function.json)
```json
{
  "scriptFile": "__init__.py",
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["get", "post"],
      "route": "GetUserRoles"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "$return"
    }
  ]
}
```

## Integration Steps

### Option 1: Use Existing RoomTool Function (Easiest)

If RoomTool's Azure Function is already deployed and accessible:

1. **Update Frontend to Call Function**

Edit `src/app/page.tsx`:

```typescript
// Replace the fetch('/.auth/me') call with:
const [authData, rolesData] = await Promise.all([
  fetch('/.auth/me').then(res => res.json()),
  fetch('https://roomres.thebattenspace.org/api/GetUserRoles').then(res => res.json())
]);

setUserInfo(authData);

if (authData.clientPrincipal) {
  // Use roles from Azure Function instead of userRoles from Easy Auth
  const userRoles = rolesData.roles || [];
  const authorized = userRoles.includes('staff') || userRoles.includes('community');
  setHasAccess(authorized);
}
```

2. **Update staticwebapp.config.json**

Allow API calls to RoomTool function:
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["*.{css,js,png,jpg,gif,svg,ico}", "/_next/*", "/api/*"]
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.azurewebsites.net https://*.virginia.edu https://*.thebattenspace.org data: blob:;"
  }
}
```

### Option 2: Deploy Dedicated Function for BattenSpace

1. **Create Azure Function App**
```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Create new function project
func init BattenSpaceFunction --python
cd BattenSpaceFunction

# Create GetUserRoles function
func new --name GetUserRoles --template "HTTP trigger" --authlevel "anonymous"
```

2. **Copy Implementation**
- Copy `__init__.py` from RoomTool implementation
- Copy `function.json` configuration
- Update group mappings if needed

3. **Deploy to Azure**
```bash
# Login to Azure
az login

# Create Function App
az functionapp create \
  --resource-group <your-resource-group> \
  --consumption-plan-location eastus \
  --runtime python \
  --runtime-version 3.9 \
  --functions-version 4 \
  --name battenspace-functions \
  --storage-account <your-storage-account>

# Deploy
func azure functionapp publish battenspace-functions
```

4. **Configure CORS**
Azure Portal → Function App → CORS:
- Add `https://www.thebattenspace.org`
- Add `https://brave-wave-04cf51710.3.azurestaticapps.net`

5. **Update Frontend**
Same as Option 1, but use your function URL:
```typescript
fetch('https://battenspace-functions.azurewebsites.net/api/GetUserRoles')
```

### Option 3: Add Function to Static Web App (Recommended)

Azure Static Web Apps supports integrated Azure Functions:

1. **Create api Directory**
```bash
cd BattenSpaceFrontEnd
mkdir api
cd api
```

2. **Initialize Function**
```bash
func init --worker-runtime python
func new --name GetUserRoles --template "HTTP trigger" --authlevel "anonymous"
```

3. **Copy Implementation**
- Copy `__init__.py` from RoomTool
- Copy `function.json`

4. **Update staticwebapp.config.json**
```json
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["*.{css,js,png,jpg,gif,svg,ico}", "/_next/*", "/api/*"]
  }
}
```

5. **Update GitHub Workflow**
`.github/workflows/azure-static-web-apps.yml`:
```yaml
- name: Build And Deploy
  uses: Azure/static-web-apps-deploy@v1
  with:
    azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
    repo_token: ${{ secrets.GITHUB_TOKEN }}
    action: "upload"
    app_location: "/"
    api_location: "api"  # Add this line
    output_location: "out"
```

6. **Update Frontend**
```typescript
// Function will be at /api/GetUserRoles
fetch('/api/GetUserRoles').then(res => res.json())
```

## Comparison of Options

| Option | Pros | Cons | Recommended |
|--------|------|------|-------------|
| Use RoomTool Function | - No deployment needed<br>- Already working | - Dependency on RoomTool<br>- Cross-origin requests | No |
| Dedicated Function App | - Independent<br>- Full control | - Separate resource<br>- Extra cost<br>- CORS configuration | Maybe |
| Integrated with Static Web App | - Same domain<br>- No CORS issues<br>- No extra cost | - Requires redeploy | **Yes** |

## Implementation Details

### x-ms-client-principal Header

Azure Static Web Apps automatically adds this header after authentication:

```
x-ms-client-principal: <base64-encoded-json>
```

Decoded structure:
```json
{
  "userId": "1234567890",
  "userDetails": "user@virginia.edu",
  "identityProvider": "aad",
  "claims": [
    {
      "typ": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
      "val": "user@virginia.edu"
    },
    {
      "typ": "roles",
      "val": "FBS_StaffAll"
    },
    {
      "typ": "roles",
      "val": "FBS_Community"
    }
  ]
}
```

### Group Mapping

Current mappings in RoomTool implementation:
- `FBS_StaffAll` → `staff` role
- `FBS_Community` → `community` role
- All authenticated users → `authenticated` role

For BattenSpace, we can:
1. Keep same mappings
2. Add more granular roles
3. Map to different role names

Example enhanced mapping:
```python
# Map FBS groups to application roles
role_mapping = {
    'FBS_StaffAll': ['staff', 'authenticated'],
    'FBS_Community': ['community', 'authenticated'],
    'FBS_Faculty': ['faculty', 'community', 'authenticated'],
    'FBS_Admin': ['admin', 'staff', 'authenticated']
}

for claim in user_claims:
    if claim_type in ['roles', 'groups']:
        if claim_value in role_mapping:
            user_roles.extend(role_mapping[claim_value])

# Remove duplicates
user_roles = list(set(user_roles))
```

## Testing

### Test Azure Function Locally

1. **Start Function**
```bash
cd api  # or BattenSpaceFunction
func start
```

2. **Test with curl**
```bash
# Without auth header (should return empty roles)
curl http://localhost:7071/api/GetUserRoles

# With mock auth header
echo -n '{"userId":"test","claims":[{"typ":"roles","val":"FBS_StaffAll"}]}' | base64
curl -H "x-ms-client-principal: <base64-result>" http://localhost:7071/api/GetUserRoles
```

3. **Expected Response**
```json
{
  "roles": ["staff", "authenticated"]
}
```

### Test Frontend Integration

1. **Mock the API in Development**

Update `src/app/page.tsx`:
```typescript
if (isDev) {
  // Mock both auth and roles
  const mockUser = {
    clientPrincipal: {
      identityProvider: 'aad',
      userId: 'dev-user-123',
      userDetails: 'Dev User (Local)',
      userRoles: ['authenticated']  // Keep minimal for realism
    }
  };

  // Mock role API response
  const mockRoles = {
    roles: ['staff', 'authenticated']
  };

  setUserInfo(mockUser);
  setHasAccess(mockRoles.roles.includes('staff') || mockRoles.roles.includes('community'));
  setLoading(false);
  return;
}
```

2. **Test in Production**
- Deploy function
- Deploy frontend with function call
- Login as user in FBS_StaffAll
- Open browser console
- Check network tab for API call
- Verify roles returned correctly

## Migration Path

### Current State
```typescript
// Uses Easy Auth userRoles (doesn't work - groups not configured)
const userRoles = data.clientPrincipal.userRoles || [];
const authorized = userRoles.includes('authenticated');  // Temporary bypass
```

### After Function Integration
```typescript
// Uses Azure Function for role mapping
const rolesData = await fetch('/api/GetUserRoles').then(res => res.json());
const userRoles = rolesData.roles || [];
const authorized = userRoles.includes('staff') || userRoles.includes('community');
```

### Benefits
1. ✅ Works immediately without waiting for Azure AD config
2. ✅ More flexible - can add custom role logic
3. ✅ Can map multiple groups to single role
4. ✅ Can implement role hierarchy
5. ✅ Easier to debug and test
6. ✅ Independent of Azure AD configuration

### Drawbacks
1. ❌ Extra API call on page load
2. ❌ Slightly more complex deployment
3. ❌ Need to maintain function code

## Recommended Next Steps

1. **Create api directory** in BattenSpaceFrontEnd
2. **Copy GetUserRoles function** from RoomTool
3. **Test locally** with func start
4. **Update GitHub workflow** to deploy API
5. **Update frontend** to call /api/GetUserRoles
6. **Test in production**
7. **Remove temporary bypass** once confirmed working

## Code Changes Summary

### Files to Create
- `api/GetUserRoles/__init__.py` (function implementation)
- `api/GetUserRoles/function.json` (function configuration)
- `api/host.json` (function app configuration)
- `api/requirements.txt` (Python dependencies)

### Files to Modify
- `.github/workflows/azure-static-web-apps.yml` (add api_location)
- `src/app/page.tsx` (call function instead of using userRoles directly)
- `staticwebapp.config.json` (optional: add API route configuration)

### Estimated Time
- Setup: 30 minutes
- Testing: 30 minutes
- Deployment: 15 minutes
- **Total: ~1.5 hours**

## Support

If implementing this solution:
1. Test locally first with `func start`
2. Check function logs in Azure Portal
3. Verify x-ms-client-principal header contains groups
4. Test with real users in FBS groups
5. Monitor Application Insights for errors

## References

- RoomTool Implementation: `C:\Users\bh4hb\OneDrive - University of Virginia\Desktop\AI_Working\RoomTool\azure-function\GetUserRoles\`
- Azure Functions Python Guide: https://learn.microsoft.com/azure/azure-functions/functions-reference-python
- Static Web Apps API: https://learn.microsoft.com/azure/static-web-apps/apis
- Easy Auth Headers: https://learn.microsoft.com/azure/static-web-apps/user-information
