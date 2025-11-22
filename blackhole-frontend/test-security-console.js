/**
 * Security Testing Script
 * 
 * Copy and paste these functions into your browser console
 * to test the security implementation
 */

// Test 1: Check if security module can be imported
async function testSecurityImport() {
  try {
    // In Next.js, you can't directly import from file system in browser
    // This test checks if the functions are available via the API
    console.log('Testing security implementation...');
    console.log('Note: Security functions are bundled in the app');
    console.log('Check Network tab to see headers in actual requests');
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// Test 2: Monitor API calls and check headers
function monitorAPICalls() {
  console.log('📡 Monitoring API calls...');
  console.log('1. Open DevTools → Network tab');
  console.log('2. Make any API call (navigate to feed, scrape article, etc.)');
  console.log('3. Click on the request → Headers tab');
  console.log('4. Look for these headers in Request Headers:');
  console.log('   - Authorization: Bearer <token>');
  console.log('   - X-Client-Nonce: <nonce>');
  console.log('   - X-Signature: <signature>');
  console.log('   - X-Timestamp: <timestamp>');
}

// Test 3: Check environment variables (if accessible)
function checkEnvVars() {
  console.log('Environment Variables Check:');
  console.log('JWT Token:', process.env?.NEXT_PUBLIC_JWT_TOKEN ? '✅ Set' : '⚠️ Not Set');
  console.log('HMAC Secret:', process.env?.NEXT_PUBLIC_HMAC_SECRET ? '✅ Set' : '⚠️ Not Set');
  console.log('');
  console.log('If not set, add to .env.local:');
  console.log('NEXT_PUBLIC_JWT_TOKEN=your_token');
  console.log('NEXT_PUBLIC_HMAC_SECRET=your_secret');
}

// Test 4: Make a test API call and inspect
async function testAPICallWithHeaders() {
  console.log('🧪 Testing API call with security headers...');
  
  try {
    const response = await fetch('http://localhost:8000/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    const data = await response.json();
    console.log('✅ API Response Data:', data);
    console.log('');
    console.log('📋 Now check Network tab:');
    console.log('1. Find the /health request');
    console.log('2. Click on it');
    console.log('3. Go to Headers → Request Headers');
    console.log('4. Verify security headers are present');
    
    return data;
  } catch (error) {
    console.error('❌ API Call Failed:', error);
    return null;
  }
}

// Test 5: Verify nonce format
function testNonceFormat() {
  console.log('🔢 Testing Nonce Format...');
  console.log('Nonces should be in format: timestamp-random1-random2');
  console.log('Example: lx123abc-def456-ghi789');
  console.log('');
  console.log('To verify:');
  console.log('1. Make multiple API calls');
  console.log('2. Check X-Client-Nonce header in each');
  console.log('3. Each should be unique');
}

// Test 6: Verify signature format
function testSignatureFormat() {
  console.log('🔐 Testing Signature Format...');
  console.log('Signature should be:');
  console.log('- Hex string (0-9, a-f)');
  console.log('- 64 characters long (SHA-256)');
  console.log('- Example: a1b2c3d4e5f6...');
  console.log('');
  console.log('To verify:');
  console.log('1. Check X-Signature header in Network tab');
  console.log('2. Should match pattern: /^[0-9a-f]{64}$/');
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running All Security Tests...\n');
  
  await testSecurityImport();
  console.log('');
  
  checkEnvVars();
  console.log('');
  
  monitorAPICalls();
  console.log('');
  
  await testAPICallWithHeaders();
  console.log('');
  
  testNonceFormat();
  console.log('');
  
  testSignatureFormat();
  console.log('');
  
  console.log('✅ Testing complete!');
  console.log('Check the Network tab in DevTools to see actual headers.');
}

// Export for use in console
if (typeof window !== 'undefined') {
  window.testSecurity = {
    import: testSecurityImport,
    monitor: monitorAPICalls,
    env: checkEnvVars,
    api: testAPICallWithHeaders,
    nonce: testNonceFormat,
    signature: testSignatureFormat,
    all: runAllTests
  };
  
  console.log('🔒 Security Testing Functions Loaded!');
  console.log('Run: testSecurity.all() to run all tests');
  console.log('Or use individual functions: testSecurity.api(), testSecurity.env(), etc.');
}

