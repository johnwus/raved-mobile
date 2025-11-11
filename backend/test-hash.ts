import { comparePassword, hashPassword } from './src/utils/auth.utils';

async function testHashComparison() {
  try {
    const password = 'adminpassword';
    const hash1 = await hashPassword(password);
    console.log('Generated hash:', hash1);
    
    const isValid = await comparePassword(password, hash1);
    console.log('Does it match? ', isValid);
    
    // Now test with the actual DB hash
    const actualHash = '$2a$12$m2MyeWqpLFulGfCiLQR5lOLfBUPIIkqOcLiC2y8TO6K5bQEfKp1sy';
    const isValidActual = await comparePassword(password, actualHash);
    console.log('Does it match the DB hash?', isValidActual);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testHashComparison();
