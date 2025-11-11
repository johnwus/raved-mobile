import axios from 'axios';

const token = process.env.REFRESH_TOKEN || '';

async function run(){
  if(!token) {
    console.error('Pass REFRESH_TOKEN env var');
    process.exit(1);
  }
  try{
    const res = await axios.post('http://192.168.100.28:3000/api/v1/auth/refresh', {refreshToken: token});
    console.log(JSON.stringify(res.data, null, 2));
  }catch(e:any){
    console.error(e.response?.data || e.message);
  }
  process.exit(0);
}

run();
