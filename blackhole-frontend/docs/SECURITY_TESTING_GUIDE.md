# Security Implementation Testing Guide

This guide shows you how to test the Day 5 security primitives (JWT, Nonce, HMAC Signature).

## Quick Test Methods

### Method 1: Browser DevTools (Easiest)

1. **Open your browser** and navigate to `http://localhost:3000`
2. **Open DevTools**:
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Or `Cmd+Option+I` (Mac)
3. **Go to Network tab**
4. **Trigger an API call**:
   - Navigate to the News Feed page
   - Or scrape a news article
   - Or submit feedback on an article
5. **Inspect the request**:
   - Click on any request (e.g., `/health`, `/feedback`, `/exports/weekly_report.json`)
   - Go to **Headers** tab
   - Scroll to **Request Headers** section

**What to look for:**
```
Authorization: Bearer <your_jwt_token>
X-Client-Nonce: <unique_nonce>
X-Signature: <hex_signature>
X-Timestamp: <timestamp>
```

### Method 2: Console Logging Test

1. **Open browser console** (F12 → Console tab)
2. **Run this test code:**

```javascript
// Test security headers generation
(async () => {
  const { createSecurityHeaders } = await import('/lib/security.js');
  
  const headers = await createSecurityHeaders(
    'POST',
    'http://localhost:8000/feedback',
    JSON.stringify({ id: 'test', signals: {} })
  );
  
  console.log('Security Headers:', headers);
  console.log('JWT Present:', !!headers.Authorization);
  console.log('Nonce Present:', !!headers['X-Client-Nonce']);
  console.log('Signature Present:', !!headers['X-Signature']);
  console.log('Timestamp Present:', !!headers['X-Timestamp']);
})();
```

### Method 3: Test API Call Directly

Open browser console and run:

```javascript
// Test a real API call with security headers
fetch('http://localhost:8000/health', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    ...await (await import('/lib/security.js')).createSecurityHeaders('GET', 'http://localhost:8000/health')
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ API call successful:', data);
  console.log('Check Network tab to see security headers');
})
.catch(err => console.error('❌ API call failed:', err));
```

## Step-by-Step Testing

### Test 1: Verify Headers Are Present

**Steps:**
1. Open `http://localhost:3000` in browser
2. Open DevTools → Network tab
3. Navigate to News Feed page (`/feed`)
4. Find the request to `/exports/weekly_report.json` or `/health`
5. Click on it → Headers tab
6. Check **Request Headers** section

**Expected Result:**
- ✅ `Authorization: Bearer ...` (if JWT is configured)
- ✅ `X-Client-Nonce: <random-string>`
- ✅ `X-Signature: <hex-string>`
- ✅ `X-Timestamp: <number>`

### Test 2: Test Without JWT Token

**Steps:**
1. Remove or comment out `NEXT_PUBLIC_JWT_TOKEN` in `.env.local`
2. Restart frontend: `npm run dev`
3. Make an API call
4. Check headers - `Authorization` should be missing
5. API should still work (if backend doesn't require JWT)

**Expected Result:**
- ✅ `X-Client-Nonce` still present
- ✅ `X-Signature` still present (but may be empty if HMAC secret missing)
- ❌ `Authorization` header missing

### Test 3: Test Without HMAC Secret

**Steps:**
1. Remove or comment out `NEXT_PUBLIC_HMAC_SECRET` in `.env.local`
2. Restart frontend
3. Make an API call
4. Check headers

**Expected Result:**
- ✅ `X-Client-Nonce` still present
- ⚠️ `X-Signature` may be empty string (check console for warning)
- Backend may reject request if it validates signature

### Test 4: Verify Nonce Uniqueness

**Steps:**
1. Open browser console
2. Run this code multiple times:

```javascript
(async () => {
  const { generateNonce } = await import('/lib/security.js');
  const nonces = [];
  for (let i = 0; i < 5; i++) {
    nonces.push(generateNonce());
  }
  console.log('Generated Nonces:', nonces);
  console.log('All unique?', new Set(nonces).size === nonces.length);
})();
```

**Expected Result:**
- ✅ Each nonce should be unique
- ✅ Format: `timestamp-random1-random2`

### Test 5: Test HMAC Signature Generation

**Steps:**
1. Set `NEXT_PUBLIC_HMAC_SECRET` in `.env.local` (e.g., `test_secret_123`)
2. Restart frontend
3. Open browser console
4. Run:

```javascript
(async () => {
  const { signRequest } = await import('/lib/security.js');
  
  const method = 'POST';
  const url = 'http://localhost:8000/feedback';
  const body = JSON.stringify({ id: 'test', signals: {} });
  const nonce = 'test-nonce-123';
  const timestamp = Date.now();
  
  const signature = await signRequest(method, url, body, nonce, timestamp);
  console.log('Signature:', signature);
  console.log('Signature length:', signature.length);
  console.log('Is hex?', /^[0-9a-f]+$/.test(signature));
})();
```

**Expected Result:**
- ✅ Signature is a hex string (64 characters for SHA-256)
- ✅ Same input produces same signature
- ✅ Different input produces different signature

### Test 6: Test Error Handling (401/403)

**Steps:**
1. Set an invalid JWT token in `.env.local`
2. Make an API call that requires authentication
3. Check browser console for error messages

**Expected Result:**
- ✅ Console shows: "Authentication failed: Invalid or expired JWT token"
- ✅ Request returns 401 status
- ✅ `handleAuthError()` function is called

## Automated Test Script

Create a test file: `blackhole-frontend/test-security.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Security Testing</title>
</head>
<body>
    <h1>Security Headers Test</h1>
    <button onclick="testSecurity()">Test Security Headers</button>
    <pre id="output"></pre>
    
    <script type="module">
        async function testSecurity() {
            const output = document.getElementById('output');
            output.textContent = 'Testing...\n';
            
            try {
                // Import security functions (adjust path as needed)
                const response = await fetch('/lib/security.ts');
                // Note: This is a simplified test - in real app, use proper imports
                
                // Test API call
                const apiResponse = await fetch('http://localhost:8000/health');
                const headers = {};
                apiResponse.headers.forEach((value, key) => {
                    headers[key] = value;
                });
                
                output.textContent = JSON.stringify(headers, null, 2);
            } catch (error) {
                output.textContent = 'Error: ' + error.message;
            }
        }
        
        window.testSecurity = testSecurity;
    </script>
</body>
</html>
```

## Testing Checklist

- [ ] **Headers Present**: All 4 security headers appear in Network tab
- [ ] **JWT Token**: `Authorization` header contains valid JWT (if configured)
- [ ] **Nonce Unique**: Each request has different nonce
- [ ] **Signature Valid**: Signature is hex string (64 chars for SHA-256)
- [ ] **Timestamp Present**: Timestamp is current Unix timestamp
- [ ] **Error Handling**: 401/403 errors are handled gracefully
- [ ] **Console Warnings**: Check for any security-related warnings
- [ ] **Backend Validation**: Backend accepts and validates headers (coordinate with backend team)

## Common Issues & Solutions

### Issue: "HMAC_SECRET not found" warning
**Solution**: Add `NEXT_PUBLIC_HMAC_SECRET` to `.env.local`

### Issue: Signature is empty string
**Solution**: Check that `NEXT_PUBLIC_HMAC_SECRET` is set correctly

### Issue: JWT token not in headers
**Solution**: Add `NEXT_PUBLIC_JWT_TOKEN` to `.env.local` or check localStorage

### Issue: Backend rejects requests
**Solution**: 
1. Verify backend is configured to accept these headers
2. Ensure HMAC secret matches between frontend and backend
3. Check backend logs for validation errors

## Verification Commands

### Check Environment Variables (in browser console)

```javascript
// Check if env vars are accessible
console.log('JWT Token:', process.env.NEXT_PUBLIC_JWT_TOKEN ? 'Set' : 'Not Set');
console.log('HMAC Secret:', process.env.NEXT_PUBLIC_HMAC_SECRET ? 'Set' : 'Not Set');
```

### Monitor Network Requests

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Click on any API request
4. Go to Headers → Request Headers
5. Look for security headers

## Expected Behavior

### ✅ **Working Correctly:**
- Every API request includes security headers
- Nonce is unique for each request
- Signature is generated (if HMAC secret is set)
- JWT is included (if token is set)
- No console errors related to security

### ⚠️ **Warnings (Non-blocking):**
- "HMAC_SECRET not found" - Secret not configured (signature will be empty)
- "JWT token not found" - Token not configured (auth header will be missing)

### ❌ **Errors (Need Fixing):**
- "Failed to sign request" - Crypto API error
- "Authentication failed" - Backend rejected JWT
- 401/403 responses - Backend validation failed

## Next Steps After Testing

1. ✅ Verify headers are present
2. ⏳ Coordinate with backend team to ensure they validate headers
3. ⏳ Test with real JWT token from backend
4. ⏳ Test with matching HMAC secret
5. ⏳ Verify backend accepts and validates all headers

---

*For more details, see `docs/SECURITY_SETUP.md`*

