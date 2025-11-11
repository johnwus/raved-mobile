import axios from 'axios';

async function testLogin() {
  try {
    const response = await axios.post('http://192.168.100.28:3000/api/v1/auth/login', {
      identifier: 'admin',
      password: 'adminpassword'
    });
    
    console.log('✅ Login successful!');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
  
  process.exit(0);
}

testLogin();
