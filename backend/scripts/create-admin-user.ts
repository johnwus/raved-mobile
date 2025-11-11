import { pgPool } from '../src/config/database';

async function createAdminUser() {
  const client = await pgPool.connect();
  try {
    const adminUser = {
      username: 'admin',
      email: 'admin@raved.app',
      password_hash: '$2a$12$xYs0uF8ipVEnhxcpzQ5r..4oJLhu5GrlSheeTU1KnBM2D2LLPF17a',
      first_name: 'Admin',
      last_name: 'User',
      email_verified: true,
      phone_verified: false,
      is_private: false,
      show_activity: true,
      read_receipts: true,
      allow_downloads: true,
      allow_story_sharing: true,
      subscription_tier: 'admin',
    };

    const query = `
      INSERT INTO users (username, email, password_hash, first_name, last_name, email_verified, phone_verified, is_private, show_activity, read_receipts, allow_downloads, allow_story_sharing, subscription_tier)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (username) DO NOTHING
      RETURNING id, username, email;
    `;

    const result = await client.query(query, [
      adminUser.username,
      adminUser.email,
      adminUser.password_hash,
      adminUser.first_name,
      adminUser.last_name,
      adminUser.email_verified,
      adminUser.phone_verified,
      adminUser.is_private,
      adminUser.show_activity,
      adminUser.read_receipts,
      adminUser.allow_downloads,
      adminUser.allow_story_sharing,
      adminUser.subscription_tier,
    ]);

    if (result.rows.length > 0) {
      console.log('✅ Admin user created successfully:');
      console.log(result.rows[0]);
    } else {
      console.log('⚠️  Admin user already exists or not created.');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

createAdminUser();
