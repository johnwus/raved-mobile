import axios from 'axios';

async function testLogin() {
  const tests = [
    { identifier: '@admin', password: 'adminpassword', desc: 'Username with @' },
    { identifier: 'admin@raved.app', password: 'adminpassword', desc: 'Email' },
  ];
  
  for (const test of tests) {
    try {
      console.log(`\n🔄 Testing ${test.desc}...`);
      const response = await axios.post('http://192.168.100.28:3000/api/v1/auth/login', {
        identifier: test.identifier,
        password: test.password
      });
      
      console.log('✅ Login successful!');
      console.log('Token:', response.data.token?.substring(0, 20) + '...');
      console.log('User:', response.data.user);
    } catch (error: any) {
      console.log('❌ Failed:', error.response?.data?.error || error.message);
    }
  }
  
  process.exit(0);
}

testLogin();
