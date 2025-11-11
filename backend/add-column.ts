import { pgPool } from './src/config/database';

async function addColumn() {
  try {
    const result = await pgPool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_two_factor_enabled BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ Column added successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addColumn();
