const { pgPool } = require('./src/config/database');
const mongoose = require('mongoose');
const { Post } = require('./src/models/mongoose/post.model');

async function setupAdmin() {
  try {
    console.log('Setting up admin data...');

    // Get admin user ID
    const adminResult = await pgPool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    if (adminResult.rows.length === 0) {
      console.log('Admin user not found');
      return;
    }
    const adminId = adminResult.rows[0].id;
    console.log('Admin ID:', adminId);

    // Get some mock user IDs
    const mockUsers = await pgPool.query('SELECT id FROM users WHERE username LIKE $1 LIMIT 3', ['mock_%']);
    const mockUserIds = mockUsers.rows.map(r => r.id);
    console.log('Mock user IDs:', mockUserIds);

    if (mockUserIds.length === 0) {
      console.log('No mock users found');
      return;
    }

    // Add connections
    for (const mockUserId of mockUserIds) {
      await pgPool.query(
        'INSERT INTO connections (follower_id, following_id, status, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) ON CONFLICT (follower_id, following_id) DO NOTHING',
        [adminId, mockUserId, 'accepted']
      );
    }
    console.log('Added connections');

    // Update counts
    const followingCount = mockUserIds.length;
    await pgPool.query('UPDATE users SET following_count = $1 WHERE id = $2', [followingCount, adminId]);
    console.log('Updated following count');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb+srv://idnqnzt_db_user:00DcA5rr2LDDCots@raved-mongodb.c7kgll2.mongodb.net/raved?appName=raved-mongodb');

    // Create posts for admin
    const posts = [
      {
        userId: adminId,
        type: 'text',
        caption: 'Welcome to Raved! 🎉 #CampusLife',
        tags: ['Welcome', 'CampusLife'],
        visibility: 'public',
        faculty: 'Administration',
        likesCount: 5,
        commentsCount: 2,
        sharesCount: 1,
        viewsCount: 25
      },
      {
        userId: adminId,
        type: 'text',
        caption: 'Excited to launch our new social platform for students! 📚✨',
        tags: ['Launch', 'Students'],
        visibility: 'public',
        faculty: 'Administration',
        likesCount: 3,
        commentsCount: 1,
        sharesCount: 0,
        viewsCount: 15
      }
    ];

    for (const postData of posts) {
      const post = new Post(postData);
      await post.save();
    }
    console.log('Created posts');

    // Update post count
    await pgPool.query('UPDATE users SET posts_count = posts_count + 2 WHERE id = $1', [adminId]);
    console.log('Updated post count');

    await mongoose.disconnect();
    console.log('Admin setup completed successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

setupAdmin();