# Security Setup Guide (SSPL-III Compliance)

This guide explains how to configure and use the security primitives implemented for Day 5 of the integration plan.

## Overview

The frontend implements three security primitives for all API requests:

1. **JWT Token** - Authentication via `Authorization: Bearer <token>` header
2. **Nonce** - Anti-replay protection via `X-Client-Nonce` header
3. **HMAC Signature** - Request integrity via `X-Signature` header

## Configuration

### 1. Environment Variables

Create a `.env.local` file in the `blackhole-frontend` directory with:

```env
# JWT Token (obtain from backend/auth service)
NEXT_PUBLIC_JWT_TOKEN=your_jwt_token_here

# HMAC Secret (must match backend configuration)
NEXT_PUBLIC_HMAC_SECRET=your_hmac_secret_here
```

### 2. Generating HMAC Secret

**Recommended**: Use OpenSSL to generate a secure random secret:

```bash
openssl rand -hex 32
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important**: The same secret must be configured on all backend services (Sankalp, Noopur, Seeya) that validate signatures.

### 3. Obtaining JWT Token

The JWT token should be obtained through your authentication flow. For development/testing:

1. **Option A**: Get token from backend login endpoint
2. **Option B**: Use a test token provided by backend team
3. **Option C**: Store token in localStorage (development only)

For production, implement a proper login flow that:
- Authenticates user credentials
- Receives JWT token from auth service
- Stores token securely (consider httpOnly cookies for production)

## How It Works

### Request Flow

1. **Client generates nonce**: Unique string per request
2. **Client creates signature**: HMAC-SHA256 of `method|url|body|nonce|timestamp`
3. **Client sends request** with headers:
   - `Authorization: Bearer <JWT>`
   - `X-Client-Nonce: <nonce>`
   - `X-Signature: <hmac_signature>`
   - `X-Timestamp: <timestamp>`

4. **Backend validates**:
   - JWT token is valid and not expired
   - Nonce hasn't been used before (replay protection)
   - Signature matches expected HMAC

### Signature Format

The signature is computed as:

```
stringToSign = "METHOD|URL|BODY|NONCE|TIMESTAMP"
signature = HMAC-SHA256(secret, stringToSign)
```

Example:
```
POST|http://localhost:8000/feedback|{"id":"123"}|abc123|1699123456789
```

## Implementation Details

### Security Functions (`lib/security.ts`)

- **`getJWT()`**: Retrieves JWT from env or localStorage
- **`generateNonce()`**: Creates unique nonce per request
- **`signRequest()`**: Computes HMAC-SHA256 signature
- **`createSecurityHeaders()`**: Generates all security headers
- **`handleAuthError()`**: Handles 401/403 responses

### API Integration (`lib/api.ts`)

All API functions automatically include security headers:

```typescript
const securityHeaders = await createSecurityHeaders('POST', url, body)
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...securityHeaders, // Includes JWT, Nonce, Signature
  },
  body,
})
```

## Error Handling

### 401 Unauthorized
- JWT token is missing, invalid, or expired
- Action: Clear stored token, redirect to login

### 403 Forbidden
- JWT token is valid but user lacks permissions
- Action: Show access denied message

Both errors are automatically handled by `handleAuthError()` function.

## Testing

### Test with Missing JWT

```typescript
// Temporarily remove JWT from env
// API calls should still work but may receive 401
```

### Test with Invalid HMAC Secret

```typescript
// Use wrong secret in .env.local
// Backend should reject requests with invalid signature
```

### Test Nonce Replay Protection

```typescript
// Backend should reject duplicate nonces
// Each request must have unique nonce
```

## Backend Coordination

**Critical**: Coordinate with backend teams to ensure:

1. **Sankalp** accepts and validates:
   - `Authorization: Bearer <JWT>` header
   - `X-Client-Nonce` header
   - `X-Signature` header
   - Uses same HMAC secret

2. **Noopur** accepts and validates:
   - Same headers as above
   - Same HMAC secret

3. **Seeya** accepts and validates:
   - Same headers as above
   - Same HMAC secret

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use strong HMAC secrets** (minimum 32 bytes)
3. **Rotate secrets periodically** in production
4. **Use HTTPS** in production (signatures protect integrity, not confidentiality)
5. **Implement token refresh** for long-lived sessions
6. **Validate nonce timestamps** on backend (reject old requests)

## Troubleshooting

### "HMAC_SECRET not found"
- Check `.env.local` file exists
- Verify `NEXT_PUBLIC_HMAC_SECRET` is set
- Restart dev server after adding env vars

### "Authentication failed: Invalid or expired JWT token"
- Verify `NEXT_PUBLIC_JWT_TOKEN` is set correctly
- Check token hasn't expired
- Contact backend team for new token

### "Signature validation failed"
- Verify HMAC secret matches backend
- Check signature format (should be hex string)
- Ensure request body is stringified correctly

## Next Steps

1. ✅ Security primitives implemented
2. ⏳ Coordinate with backend teams on secret sharing
3. ⏳ Test with real backend services
4. ⏳ Implement token refresh flow (if needed)
5. ⏳ Add login UI component (if not exists)

---

*Last Updated: After Day 5 Security Implementation*

