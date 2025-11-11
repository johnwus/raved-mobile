import { pgPool } from '../config/database';

async function checkSeededData() {
  try {
    console.log('🔍 Checking seeded data...');

    // Check users
    const userResult = await pgPool.query('SELECT COUNT(*) FROM users WHERE username LIKE \'mock_%\'');
    console.log(`👥 Mock users: ${userResult.rows[0].count}`);

    // Check posts
    const postResult = await pgPool.query('SELECT COUNT(*) FROM posts');
    console.log(`📝 Posts: ${postResult.rows[0].count}`);

    // Check stories
    const storyResult = await pgPool.query('SELECT COUNT(*) FROM stories');
    console.log(`📖 Stories: ${storyResult.rows[0].count}`);

    // Check store items
    const storeResult = await pgPool.query('SELECT COUNT(*) FROM store_items');
    console.log(`🛍️ Store items: ${storeResult.rows[0].count}`);

    // Check connections
    const connectionResult = await pgPool.query('SELECT COUNT(*) FROM connections');
    console.log(`🤝 Connections: ${connectionResult.rows[0].count}`);

    // Check conversations
    const conversationResult = await pgPool.query('SELECT COUNT(*) FROM conversations');
    console.log(`💬 Conversations: ${conversationResult.rows[0].count}`);

    // Check events
    const eventResult = await pgPool.query('SELECT COUNT(*) FROM events');
    console.log(`📅 Events: ${eventResult.rows[0].count}`);

    // Check user scores
    const scoreResult = await pgPool.query('SELECT COUNT(*) FROM user_scores');
    console.log(`🏆 User scores: ${scoreResult.rows[0].count}`);

    console.log('✅ Data check completed');
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    process.exit(0);
  }
}

checkSeededData();