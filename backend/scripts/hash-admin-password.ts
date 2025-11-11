import { hashPassword } from '../src/utils/auth.utils';

async function main() {
  const password = 'adminpassword'; // Change as needed
  const hash = await hashPassword(password);
  console.log('Hashed password:', hash);
}

main();
