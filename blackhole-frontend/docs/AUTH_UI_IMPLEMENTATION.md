# Authentication UI Implementation Guide

This document describes the authentication error handling UI components implemented for Day 5 Task 4.

## Components Overview

### 1. AuthErrorModal (`components/AuthErrorModal.tsx`)

A modal component that displays when authentication errors (401/403) occur.

**Features:**
- Different UI for 401 (Unauthorized) vs 403 (Forbidden)
- "Go to Login Page" button for 401 errors
- "Retry Request" button option
- Beautiful glass-effect design matching app theme
- Prevents body scroll when open
- Auto-closes on backdrop click

**Usage:**
```typescript
<AuthErrorModal
  isOpen={isOpen}
  errorType="401" | "403" | null
  onClose={() => setOpen(false)}
  onRetry={() => window.location.reload()}
/>
```

### 2. AuthToast (`components/AuthToast.tsx`)

A toast notification component for quick auth error messages.

**Features:**
- Auto-dismisses after 5 seconds (configurable)
- Supports 4 types: error, warning, info, success
- Smooth slide-in/out animations
- Positioned at top-right corner
- Click to dismiss

**Usage:**
```typescript
<AuthToast
  message="Authentication failed"
  type="error"
  isVisible={showToast}
  onClose={() => setShowToast(false)}
  duration={5000}
/>
```

### 3. AuthErrorHandler (`components/AuthErrorHandler.tsx`)

Global error handler that listens for auth error events and manages UI state.

**Features:**
- Listens for `authError` custom events
- Listens for `authToast` custom events
- Manages modal and toast visibility
- Integrated into root layout (app/layout.tsx)

**How it works:**
1. `handleAuthError()` in `lib/security.ts` dispatches custom events
2. `AuthErrorHandler` listens for these events
3. Shows appropriate UI (modal or toast)

### 4. Login Page (`app/login/page.tsx`)

Full-featured login page for entering JWT token and HMAC secret.

**Features:**
- JWT token input (with show/hide password toggle)
- HMAC secret input (optional, with show/hide toggle)
- "Test Connection" button to verify credentials
- "Save & Continue" button to store credentials
- Redirects to original page after login
- Backend health status indicator
- Beautiful UI matching app theme

**Access:**
- Navigate to `/login`
- Or click "Go to Login Page" from 401 error modal

## How It Works

### Error Flow

1. **API Call Fails with 401/403**
   ```typescript
   // In lib/api.ts
   if (!response.ok) {
     if (response.status === 401 || response.status === 403) {
       handleAuthError(response.status, response)
     }
   }
   ```

2. **handleAuthError() Dispatches Events**
   ```typescript
   // In lib/security.ts
   const event = new CustomEvent('authError', {
     detail: { type: '401', message: '...' }
   })
   window.dispatchEvent(event)
   ```

3. **AuthErrorHandler Receives Events**
   ```typescript
   // In components/AuthErrorHandler.tsx
   window.addEventListener('authError', (event) => {
     setAuthError(event.detail)
   })
   ```

4. **UI Components Display**
   - Modal shows for critical errors
   - Toast shows for quick notifications

## Customization

### Changing Toast Duration

```typescript
<AuthToast duration={10000} /> // 10 seconds
```

### Changing Modal Behavior

Edit `components/AuthErrorModal.tsx`:
- Modify button actions
- Change redirect behavior
- Customize messages

### Styling

All components use Tailwind CSS classes matching the app theme:
- `glass-effect` - Glass morphism effect
- `bg-gradient-to-r from-purple-500 to-pink-500` - Gradient buttons
- `border-white/10` - Subtle borders

## Testing

### Test 401 Error

1. Set invalid JWT token in `.env.local`
2. Make any API call
3. Modal should appear with "Go to Login Page" button

### Test 403 Error

1. Use valid JWT but insufficient permissions
2. Make API call that requires higher permissions
3. Modal should appear with "Access Denied" message

### Test Toast Notifications

1. Trigger auth error
2. Toast should appear at top-right
3. Should auto-dismiss after 5 seconds

### Test Login Page

1. Navigate to `/login`
2. Enter JWT token
3. Click "Save & Continue"
4. Should redirect to home page

## Integration Points

### Root Layout
```typescript
// app/layout.tsx
<AuthErrorHandler /> // Added to root layout
```

### Security Module
```typescript
// lib/security.ts
export function handleAuthError(status: number, response?: Response) {
  // Dispatches custom events
}
```

### API Functions
```typescript
// lib/api.ts
// All API functions call handleAuthError() on 401/403
```

## Future Enhancements

Potential improvements:
1. Token refresh mechanism
2. Remember me functionality
3. OAuth integration
4. Multi-factor authentication
5. Session timeout warnings
6. Automatic token refresh before expiry

---

*For more details, see `docs/DAY5_IMPLEMENTATION_STATUS.md`*

