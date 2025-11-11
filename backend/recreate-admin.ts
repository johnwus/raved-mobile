import { hashPassword } from './src/utils/auth.utils';
import { pgPool } from './src/config/database';

async function recreateAdmin() {
  try {
    // Hash the password
    const hashedPassword = await hashPassword('adminpassword');
    console.log('New hash:', hashedPassword);
    
    // Update the admin user
    const result = await pgPool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2 RETURNING id, username, email;',
      [hashedPassword, 'admin']
    );
    
    if (result.rows.length === 0) {
      console.error('❌ Admin user not found');
    } else {
      console.log('✅ Admin password updated:');
      console.log(result.rows[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

recreateAdmin();
