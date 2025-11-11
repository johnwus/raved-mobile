import { pgPool } from './src/config/database';

async function addOfflineQueueColumns() {
  try {
    // Add retry_count column
    await pgPool.query(`
      ALTER TABLE offline_queues
      ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
    `);
    console.log('✅ Column retry_count added to offline_queues table successfully');

    // Add max_retries column
    await pgPool.query(`
      ALTER TABLE offline_queues
      ADD COLUMN IF NOT EXISTS max_retries INTEGER DEFAULT 3;
    `);
    console.log('✅ Column max_retries added to offline_queues table successfully');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns to offline_queues table:', error);
    process.exit(1);
  }
}

addOfflineQueueColumns();
