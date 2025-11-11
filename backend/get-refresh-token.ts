import axios from 'axios';

async function run(){
  try{
    const res = await axios.post('http://192.168.100.28:3000/api/v1/auth/login', {identifier: 'admin@raved.app', password: 'adminpassword'});
    console.log(JSON.stringify(res.data, null, 2));
  }catch(e:any){
    console.error(e.response?.data || e.message);
  }
  process.exit(0);
}
run();
