import { comparePassword } from './src/utils/auth.utils';

async function testPassword() {
  const hash = '$2a$12$xYs0uF8ipVEnhxcpzQ5r..4oJLhu5GrlSheeTU1KnBM2D2LLPF17a';
  const password = 'adminpassword';
  
  const isValid = await comparePassword(password, hash);
  console.log('Password valid:', isValid);
  
  process.exit(0);
}

testPassword().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
