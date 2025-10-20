# Troubleshooting Guide - The Batten Space

## Authentication Issues

### Issue: Authentication Loop on Custom Domain

**Symptom:**
- Browser continuously loops between www.thebattenspace.org and Microsoft login
- Shows "Trying to sign in..." repeatedly
- Never completes authentication

**Diagnosis:**
- Test in incognito/private browsing mode
- If works in incognito → Browser cache issue
- If doesn't work in incognito → Configuration issue

**Solution 1: Browser Cache (Most Common)**
```
1. Open browser settings
2. Clear browsing data
3. Select "Cookies and other site data" and "Cached images and files"
4. Time range: "All time"
5. Clear data
6. Restart browser
7. Try accessing www.thebattenspace.org again
```

**Solution 2: Wait for Propagation**
If custom domain was just added:
- Wait 10-15 minutes for DNS propagation
- Wait for SSL certificate to fully provision
- Test in incognito mode periodically

**Solution 3: Check Redirect URIs**
1. Azure Portal → App Registrations
2. Find your app (Client ID: 1f06e0c0-21df-4411-9258-27f1e1e7e0f4)
3. Authentication → Redirect URIs
4. Verify these URIs exist:
   - `https://brave-wave-04cf51710.3.azurestaticapps.net/.auth/login/aad/callback`
   - `https://www.thebattenspace.org/.auth/login/aad/callback`
5. Add missing URIs if needed

**Verification:**
- Direct Azure URL should work: https://brave-wave-04cf51710.3.azurestaticapps.net
- Custom domain should work after cache clear: https://www.thebattenspace.org

**Current Status:** Works in incognito mode, regular browsers need cache clear

---

### Issue: User Can't Login / Access Denied

**Symptom:**
- User successfully authenticates
- Gets "Access Denied" page
- Message says not member of required groups

**Diagnosis Steps:**

1. **Check User Groups:**
```
Required groups:
- FBS_StaffAll (staff members)
- FBS_Community (community members)
```

2. **Test with /.auth/me:**
```
Navigate to: https://www.thebattenspace.org/.auth/me
Look for userRoles array in response
```

Expected response when working:
```json
{
  "clientPrincipal": {
    "userId": "...",
    "userDetails": "user@virginia.edu",
    "identityProvider": "aad",
    "userRoles": ["authenticated", "FBS_StaffAll", "FBS_Community"]
  }
}
```

Current response (issue):
```json
{
  "clientPrincipal": {
    "userId": "...",
    "userDetails": "user@virginia.edu",
    "identityProvider": "aad",
    "userRoles": ["anonymous", "authenticated"]
  }
}
```

**Root Cause:**
Groups not configured to emit as role claims in Azure AD

**Solution:**
Contact admin (Judy) to configure group emission:
1. Azure Portal → Enterprise Applications
2. Find The Batten Space application
3. Properties → Token Configuration
4. Add groups claim
5. Configure to emit security groups

**Temporary Workaround:**
Currently in code - all authenticated users allowed:
```typescript
// TEMPORARY: Allow all authenticated users until groups are configured
const authorized = userRoles.includes('authenticated');
```

**Future Fix:**
Once groups configured, uncomment in src/app/page.tsx:
```typescript
const REQUIRED_GROUPS = ["FBS_StaffAll", "FBS_Community"];
const authorized = REQUIRED_GROUPS.some(group => userRoles.includes(group));
```

---

### Issue: No Login Prompt / Stuck on Loading

**Symptom:**
- Page shows "Loading..." indefinitely
- No redirect to Microsoft login

**Diagnosis:**
1. Open browser console (F12)
2. Check for errors
3. Look at Network tab for failed requests

**Common Causes:**

1. **/.auth/me endpoint failing**
   - Check if endpoint returns 200 status
   - Verify response format

2. **JavaScript error preventing redirect**
   - Check console for errors
   - Verify Next.js built correctly

3. **Static Web App not deployed**
   - Check GitHub Actions for build status
   - Verify deployment succeeded

**Solution:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear cache and reload
3. Check GitHub Actions logs
4. Verify Azure Static Web App is running

---

## DNS and Domain Issues

### Issue: Root Domain Not Accessible

**Symptom:**
- thebattenspace.org shows "site can't be reached"
- www.thebattenspace.org works fine

**Root Cause:**
Hover forward configuration conflicting with DNS records

**Solution:**

**Option 1: Keep Forward (Recommended)**
```
Hover Dashboard:
1. Go to thebattenspace.org domain
2. Forwards tab
3. Verify forward: thebattenspace.org → www.thebattenspace.org
4. Remove any A or CNAME records on root domain
5. Keep CNAME on www subdomain
```

**Option 2: Remove Forward**
```
1. Delete forward in Hover
2. Add CNAME on root domain (if supported)
3. Point to: brave-wave-04cf51710.3.azurestaticapps.net
```

**Note:** Some DNS providers don't support CNAME on root domain. Forward is often the best solution.

**Propagation Time:** Up to 48 hours, typically 5-15 minutes

---

### Issue: Custom Domain Shows Azure Error Page

**Symptom:**
- Custom domain shows default Azure Static Web Apps page
- Says "Your Azure Static Web App is live"

**Root Cause:**
Custom domain not properly configured in Azure

**Solution:**
1. Azure Portal → Static Web Apps → Your app
2. Custom domains
3. Verify www.thebattenspace.org is listed
4. Status should be "Validated"
5. If status is "Validating", wait 5-10 minutes
6. If status is "Failed":
   - Delete custom domain entry
   - Verify DNS CNAME in Hover
   - Re-add custom domain in Azure

**DNS Record Check:**
```
Type: CNAME
Host: www
Target: brave-wave-04cf51710.3.azurestaticapps.net
```

**Verification Command:**
```bash
nslookup www.thebattenspace.org
```
Should return: brave-wave-04cf51710.3.azurestaticapps.net

---

## Build and Deployment Issues

### Issue: GitHub Actions Build Failing

**Common Errors:**

**Error 1: Missing package-lock.json**
```
Error: npm ci can only install packages when your package.json and package-lock.json are in sync
```

**Solution:**
```bash
cd BattenSpaceFrontEnd
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

---

**Error 2: Tailwind CSS Class Not Found**
```
Error: The `bg-background` class does not exist
```

**Solution:**
Verify tailwind.config.js has custom colors:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'background': '#fafafa',
        'foreground': '#232D4B',
        'uva-navy': '#232D4B',
        'uva-orange': '#E57200',
      }
    }
  }
}
```

---

**Error 3: API Route with Static Export**
```
Error: export const dynamic = "force-dynamic" on page "/api/..." cannot be used with "output: export"
```

**Solution:**
Remove /src/app/api directory. Azure Static Web Apps Easy Auth provides /.auth/* endpoints.

---

**Error 4: Build Timeout**
```
Error: Build timed out after 15 minutes
```

**Solution:**
1. Check if node_modules committed (should NOT be)
2. Verify .gitignore includes node_modules
3. Check package.json for problematic dependencies
4. Test build locally: `npm run build`

---

### Issue: Deployment Succeeded But Changes Not Visible

**Symptom:**
- GitHub Actions shows success
- Old version still visible on website

**Solutions:**

**Solution 1: Hard Refresh**
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**Solution 2: Clear Cache**
```
1. Open developer tools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
```

**Solution 3: Check Deployment Logs**
```
1. Azure Portal → Static Web Apps
2. Environment → Production
3. Check deployment history
4. Verify latest deployment timestamp
```

**Solution 4: Verify Build Output**
```
GitHub Actions → Latest workflow run
→ Build and Deploy Job
→ Scroll to deploy step
→ Verify "Finished successfully" message
```

---

## Local Development Issues

### Issue: npm run dev Fails

**Error: Port Already in Use**
```
Error: Port 3000 is already in use
```

**Solution:**
```bash
# Option 1: Kill process on port 3000
npx kill-port 3000

# Option 2: Use different port
PORT=3001 npm run dev
```

---

**Error: Module Not Found**
```
Error: Cannot find module '@/components/Header'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

### Issue: Authentication Not Working Locally

**Symptom:**
- Local dev shows "Access Denied"
- /.auth/me not available locally

**Expected Behavior:**
Local development should use mock authentication

**Verification:**
Check src/app/page.tsx:
```typescript
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  // Mock user data for local development
  const mockUser = {
    clientPrincipal: {
      identityProvider: 'aad',
      userId: 'dev-user-123',
      userDetails: 'Dev User (Local)',
      userRoles: ['authenticated', 'FBS_StaffAll'],
    }
  };
  setUserInfo(mockUser);
  setHasAccess(true);
  setLoading(false);
  return;
}
```

**Solution:**
Ensure NODE_ENV is 'development':
```bash
# Should be automatic with npm run dev
npm run dev
```

---

## Testing Checklist

### After Deployment
- [ ] Azure direct URL works: https://brave-wave-04cf51710.3.azurestaticapps.net
- [ ] Custom domain works: https://www.thebattenspace.org
- [ ] Root domain redirects to www
- [ ] Authentication prompts for login
- [ ] After login, dashboard loads
- [ ] Both tools display correctly
- [ ] Tool links open in new tab
- [ ] Support email link works
- [ ] Logo and images load
- [ ] Mobile responsive (test on phone)

### After Authentication Changes
- [ ] User in FBS_StaffAll can access
- [ ] User in FBS_Community can access
- [ ] User in neither group sees Access Denied
- [ ] Logout works correctly
- [ ] Re-login works correctly

### After DNS Changes
- [ ] Wait 15 minutes for propagation
- [ ] Test in incognito mode
- [ ] Clear cache and test in regular browser
- [ ] Test from different network (mobile data)
- [ ] Verify SSL certificate valid

### After Code Changes
- [ ] npm run build succeeds locally
- [ ] GitHub Actions build succeeds
- [ ] Changes visible after deployment
- [ ] No console errors in browser
- [ ] All links work correctly

---

## Quick Reference

### Important URLs
- **Production:** https://www.thebattenspace.org
- **Azure Direct:** https://brave-wave-04cf51710.3.azurestaticapps.net
- **Auth Info:** https://www.thebattenspace.org/.auth/me
- **Login:** https://www.thebattenspace.org/.auth/login/aad
- **Logout:** https://www.thebattenspace.org/.auth/logout
- **GitHub Repo:** https://github.com/behartless67-a11y/BattenSpaceFrontEnd

### Important IDs
- **Tenant ID:** 7b3480c7-3707-4873-8b77-e216733a65ac
- **Client ID:** 1f06e0c0-21df-4411-9258-27f1e1e7e0f4
- **Azure Resource:** brave-wave-04cf51710

### Required Groups
- FBS_StaffAll
- FBS_Community

### Support Contacts
- **General Support:** battensupport@virginia.edu
- **Azure Admin:** Judy

### DNS Provider
- **Provider:** Hover
- **Registrar:** Hover
- **Root:** thebattenspace.org
- **Subdomain:** www.thebattenspace.org

### Build Commands
```bash
npm install          # Install dependencies
npm run dev         # Local development
npm run build       # Build for production
npm run start       # Start production build (not used for Azure)
```

### Git Commands
```bash
git status          # Check current changes
git add .           # Stage all changes
git commit -m "..."  # Commit with message
git push            # Push to GitHub (triggers deployment)
```

---

## Getting Help

### Order of Operations
1. **Check this troubleshooting guide**
2. **Check DEPLOYMENT_DOCUMENTATION.md**
3. **Check browser console for errors**
4. **Check GitHub Actions logs**
5. **Check Azure Portal logs**
6. **Contact support**

### Information to Include When Asking for Help
- What you were trying to do
- Exact error message (screenshot if possible)
- Browser console errors (F12 → Console tab)
- URL you were accessing
- Whether issue occurs in incognito mode
- Whether issue occurs on Azure direct URL
- Recent changes made to code or configuration

### Log Locations
- **GitHub Actions:** https://github.com/behartless67-a11y/BattenSpaceFrontEnd/actions
- **Azure Portal:** Portal → Static Web Apps → Your App → Monitoring
- **Browser Console:** F12 → Console tab
- **Browser Network:** F12 → Network tab

---

## Known Limitations

### Easy Auth Limitations
- Groups must be configured in Azure AD to emit as role claims
- Local development requires mock authentication
- No way to test Easy Auth locally
- Must deploy to Azure to test authentication

### Static Export Limitations
- No API routes (must use external APIs or Azure Functions)
- No server-side rendering
- No incremental static regeneration
- All pages generated at build time

### DNS Limitations
- Root domain CNAME not supported by all providers
- Propagation can take up to 48 hours
- SSL provisioning can take 10-15 minutes
- Custom domain requires redirect URI configuration

---

## Version History

### 2025-10-17
- Initial troubleshooting guide created
- Documented authentication loop issue (browser cache)
- Documented DNS configuration issues
- Documented group claim configuration pending
