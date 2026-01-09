// Test Supabase Connection
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('🔍 Testing Supabase Connection...\n');
  console.log('URL:', SUPABASE_URL);
  console.log('Anon Key:', SUPABASE_ANON_KEY ? '✓ Found' : '✗ Missing');

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('\n❌ Missing environment variables!');
    return;
  }

  try {
    // Test basic API endpoint
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (response.ok) {
      console.log('\n✅ Connection successful!');
      console.log('Status:', response.status);
    } else {
      console.log('\n⚠️  Connection failed');
      console.log('Status:', response.status);
      console.log('Response:', await response.text());
    }
  } catch (error) {
    console.error('\n❌ Connection error:', error.message);
  }
}

testConnection();
