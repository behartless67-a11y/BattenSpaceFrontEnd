# Azure AD Name Claims Configuration

## Problem

The application is showing the computing ID (like "bh4hb") instead of the user's actual name because Azure AD is not emitting name claims in the authentication token.

## Root Cause

While Azure AD is configured to emit **group/role claims**, it's not configured to emit **name claims** (`givenname` and `surname`). These claims are needed to display the user's actual name instead of their computing ID.

## Solution

You need to configure the App Registration in Azure AD to include name claims in the ID token.

---

## Steps to Fix (Contact Judy or Configure Yourself)

### Option 1: Contact Judy (Recommended if you don't have App Registration access)

Send this email to Judy:

```
Subject: Request to Add Name Claims to BattenSpace App Registration

Hi Judy,

The BattenSpace application (Client ID: 0b45a06e-6b4a-4c3e-80ff-01d0c11a9def) is currently
showing computing IDs instead of actual names because the Azure AD token doesn't include
name claims.

Could you please add the following optional claims to the App Registration's ID token configuration?

**Claims to Add:**
- given_name (givenname)
- family_name (surname)
- name

These are standard Microsoft Graph claims that will allow the application to display
"John Doe" instead of "jd1ab".

**Steps to configure:**
1. Go to App Registrations in Azure Portal
2. Find app with Client ID: 0b45a06e-6b4a-4c3e-80ff-01d0c11a9def
3. Click "Token configuration" in left menu
4. Click "Add optional claim"
5. Select "ID" token type
6. Add these claims: given_name, family_name, name
7. Click "Add"
8. If prompted about Microsoft Graph permissions, click "Add" to grant them

After this change, users will need to log out and log back in to see their actual names.

Thanks!
Ben
```

### Option 2: Configure Yourself (If you have access)

#### Step 1: Navigate to App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for **"App registrations"**
3. Find the app with Client ID: `0b45a06e-6b4a-4c3e-80ff-01d0c11a9def`
4. Click on it to open

#### Step 2: Add Optional Claims

1. In the left menu, click **"Token configuration"**
2. Click **"Add optional claim"**
3. Select token type: **"ID"**
4. Check these claims:
   - ☑ `given_name` (Given Name)
   - ☑ `family_name` (Family Name/Surname)
   - ☑ `name` (Full Name)
5. Click **"Add"**
6. If prompted about Microsoft Graph permissions:
   - Check **"Turn on the Microsoft Graph profile permission"**
   - Click **"Add"**

#### Step 3: Verify Configuration

After saving:
1. Go back to **"Token configuration"**
2. Verify you see these claims listed under **"ID"** token:
   - `given_name`
   - `family_name`
   - `name`

#### Step 4: Test

1. **Log out** of the application: https://www.thebattenspace.org/.auth/logout
2. **Clear browser cookies** (or use incognito/private mode)
3. **Log back in** to the application
4. You should now see your actual name instead of computing ID

---

## Technical Details

### How It Works

**Before (Current State):**
```json
{
  "clientPrincipal": {
    "userDetails": "bh4hb",
    "claims": [
      {
        "typ": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
        "val": "bh4hb@virginia.edu"
      }
    ]
  }
}
```

**After (With Name Claims):**
```json
{
  "clientPrincipal": {
    "userDetails": "bh4hb",
    "claims": [
      {
        "typ": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
        "val": "Ben"
      },
      {
        "typ": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
        "val": "Hartless"
      },
      {
        "typ": "name",
        "val": "Ben Hartless"
      },
      {
        "typ": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
        "val": "bh4hb@virginia.edu"
      }
    ]
  }
}
```

### Code Already Implements This

The application code in [Header.tsx](src/components/Header.tsx) and [page.tsx](src/app/page.tsx) already checks for these claims:

```typescript
// Try givenname and surname claims (most reliable for Azure AD)
const givenName = claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname')?.val;
const surname = claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname')?.val;

if (givenName && surname) {
  return { full: `${givenName} ${surname}`, first: givenName };
}
```

Once the claims are configured in Azure AD, the code will automatically start displaying actual names!

---

## Alternative: Add staticwebapp.config.json Auth Config

If Easy Auth through the Portal isn't providing the claims, you can also add explicit authentication configuration to the codebase:

### Update staticwebapp.config.json

Replace the current content with:

```json
{
  "auth": {
    "identityProviders": {
      "azureActiveDirectory": {
        "registration": {
          "openIdIssuer": "https://login.microsoftonline.com/7b3480c7-3707-4873-8b77-e216733a65ac/v2.0",
          "clientIdSettingName": "AAD_CLIENT_ID",
          "clientSecretSettingName": "AAD_CLIENT_SECRET"
        }
      }
    }
  },
  "routes": [
    {
      "route": "/*",
      "allowedRoles": ["authenticated"]
    }
  ],
  "responseOverrides": {
    "401": {
      "redirect": "/.auth/login/aad",
      "statusCode": 302
    }
  },
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["*.{css,js,png,jpg,gif,svg,ico}", "/_next/*", "/api/*"]
  }
}
```

**Note:** This requires setting environment variables in Azure Static Web App:
- `AAD_CLIENT_ID`: `0b45a06e-6b4a-4c3e-80ff-01d0c11a9def`
- `AAD_CLIENT_SECRET`: (get from Key Vault)

---

## Testing After Configuration

### 1. Check Claims in Browser Console

After logging in, open browser console (F12) and run:

```javascript
fetch('/.auth/me')
  .then(r => r.json())
  .then(d => console.log(d.clientPrincipal.claims))
```

Look for claims with:
- `typ: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"`
- `typ: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"`
- `typ: "name"`

### 2. Verify Name Display

You should see:
- **Welcome message**: "Welcome, [First Name] to The Batten Space"
- **Header**: "[Full Name]" next to Sign Out button

---

## Troubleshooting

### Claims Still Not Appearing

1. **Clear all browser data** for the site (cookies, cache, etc.)
2. **Log out completely**: Visit `https://www.thebattenspace.org/.auth/logout`
3. **Close browser completely**
4. **Open new incognito/private window**
5. **Log in again**

### Still Showing Computing ID

If after configuration and clearing cache you still see computing ID:

1. Verify optional claims were saved in App Registration
2. Check that the correct App Registration (Client ID: `0b45a06e-6b4a-4c3e-80ff-01d0c11a9def`) was modified
3. Ensure you logged out and back in (new tokens are only issued on new login)
4. Contact Judy to verify Azure AD configuration

---

## References

- [Azure AD Optional Claims Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/optional-claims)
- [Azure Static Web Apps Authentication](https://learn.microsoft.com/en-us/azure/static-web-apps/authentication-authorization)
- [RoomTool Working Implementation](C:\Users\bh4hb\OneDrive - University of Virginia\Desktop\AI_Working\RoomTool)

---

**Created:** 2025-01-20
**Author:** Ben Hartless
**Issue:** Computing ID displayed instead of actual name
**Solution:** Configure Azure AD to emit name claims in ID token
