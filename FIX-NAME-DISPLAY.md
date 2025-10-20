# Fix: Display Actual Names Instead of Computing IDs

## The Problem
The app shows computing IDs (like "bh4hb") instead of actual names (like "Ben Hartless").

## The Solution
You need to configure Azure AD to include name claims in the authentication token.

---

## Quick Fix (5 minutes)

### Step 1: Open App Registration in Azure Portal

1. Go to https://portal.azure.com
2. Search for **"App registrations"**
3. Click on **"All applications"**
4. Search for Client ID: `0b45a06e-6b4a-4c3e-80ff-01d0c11a9def`
5. Click on the app to open it

### Step 2: Add Optional Claims

1. In the left sidebar, click **"Token configuration"**
2. Click **"+ Add optional claim"**
3. Select token type: **ID**
4. Check these boxes:
   - ☑ **given_name**
   - ☑ **family_name**
   - ☑ **name**
5. Click **"Add"**
6. When prompted about Microsoft Graph permissions:
   - Check the box **"Turn on the Microsoft Graph profile permission"**
   - Click **"Add"**

### Step 3: Test

1. **Log out**: Visit https://www.thebattenspace.org/.auth/logout
2. **Clear browser data** (or use incognito/private window)
3. **Log back in**: Visit https://www.thebattenspace.org
4. You should now see your actual name!

---

## Why This Works

- **RoomTool works** because it was configured with these optional claims already
- **Both apps use the same App Registration** (Client ID: 0b45a06e-6b4a-4c3e-80ff-01d0c11a9def)
- Azure AD needs to be told to emit name claims in the ID token
- Once configured, all apps using this App Registration will get name claims

---

## Verification

After logging back in, open browser console (F12) and run:

```javascript
fetch('/.auth/me')
  .then(r => r.json())
  .then(d => {
    const claims = d.clientPrincipal.claims;
    console.log('Given name:', claims.find(c => c.typ.includes('givenname'))?.val);
    console.log('Surname:', claims.find(c => c.typ.includes('surname'))?.val);
  })
```

You should see your first and last name printed in the console.

---

## Screenshots of What to Click

### Token Configuration Page
Look for the left sidebar menu item called **"Token configuration"**

### Add Optional Claim Button
Click the **"+ Add optional claim"** button at the top

### Select Token Type
- Radio button: Select **"ID"**
- Then check: **given_name**, **family_name**, **name**

### Grant Permissions
When the popup appears asking about Microsoft Graph:
- Make sure to check the box
- Click **"Add"**

---

## If You Don't Have Access

If you can't access App Registrations, send this to Judy:

```
Hi Judy,

Could you please add these optional claims to the BattenSpace App Registration
(Client ID: 0b45a06e-6b4a-4c3e-80ff-01d0c11a9def)?

In Token Configuration > Add optional claim > ID token:
- given_name
- family_name
- name

This will allow the app to display actual names instead of computing IDs.

Thanks!
```

---

## What the App Currently Does

The code in [Header.tsx](src/components/Header.tsx) and [page.tsx](src/app/page.tsx) **already checks for name claims**:

```typescript
const givenName = claims.find(c =>
  c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'
)?.val;

const surname = claims.find(c =>
  c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'
)?.val;

if (givenName && surname) {
  return { full: `${givenName} ${surname}`, first: givenName };
}
```

The code is ready - it just needs Azure AD to provide the claims!

---

**Status**: Waiting for Azure AD optional claims configuration
**Time to fix**: ~5 minutes in Azure Portal
**Impact**: Will fix name display for all users across all BattenSpace apps
