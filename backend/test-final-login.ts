import axios from 'axios';

async function testFullLogin() {
  const tests = [
    { identifier: 'admin@raved.app', password: 'adminpassword', desc: 'Login with email' },
  ];
  
  for (const test of tests) {
    try {
      console.log(`\n🔄 Testing ${test.desc}...`);
      const response = await axios.post('http://192.168.100.28:3000/api/v1/auth/login', {
        identifier: test.identifier,    
        password: test.password
      });
      
      console.log('✅ Login successful!');
      console.log('Response:', JSON.stringify({
        success: response.data.success,
        message: response.data.message,
        token: response.data.token ? response.data.token.substring(0, 30) + '...' : null,
        user: response.data.user
      }, null, 2));
    } catch (error: any) {
      console.error('❌ Failed:');
      console.error(error.response?.data || error.message);
    }
  }
  
  // process.exit(0);
}

testFullLogin();
