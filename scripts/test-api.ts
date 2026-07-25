import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

async function testAPIs() {
  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test 1: Route Generation API
    console.log('=' .repeat(60));
    console.log('Test 1: POST /api/generate-route');
    console.log('='.repeat(60));

    const routeResponse = await axios.post(`${API_BASE_URL}/generate-route`, {
      query: '1-day productivity route for CS student',
      persona: 'CS Student',
      preferences: ['quiet', 'wifi', 'cheap'],
    });

    console.log('✅ Response:', JSON.stringify(routeResponse.data, null, 2));

    // Test 2: Subgraph API
    console.log('\n' + '='.repeat(60));
    console.log('Test 2: POST /api/graph/subgraph');
    console.log('='.repeat(60));

    const subgraphResponse = await axios.post(`${API_BASE_URL}/graph/subgraph`, {
      placeIds: ['1', '2', '3'],
      maxDepth: 2,
    });

    console.log('✅ Response:', JSON.stringify(subgraphResponse.data, null, 2));

    console.log('\n🎉 All API tests passed!');
  } catch (error: any) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused. Make sure Next.js dev server is running:');
      console.error('   Run: npm run dev');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

testAPIs();