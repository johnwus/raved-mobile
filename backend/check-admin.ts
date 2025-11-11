import { pgPool } from './src/config/database';

async function checkAdmin() {
  try {
    const result = await pgPool.query(
      'SELECT id, username, email, password_hash FROM users WHERE username = $1',
      ['admin']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Admin user not found in database');
    } else {
      console.log('✅ Admin user found:');
      console.log(result.rows[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking admin user:', error);
    process.exit(1);
  }
}

checkAdmin();
