const mongoose = require('mongoose');
const { mongoUri } = require('./dist/config/database');

async function checkComments() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Check comments collection
    const commentsCollection = db.collection('comments');
    const commentCount = await commentsCollection.countDocuments();
    console.log('📊 Total comments in DB:', commentCount);
    
    if (commentCount > 0) {
      const sampleComments = await commentsCollection.find().limit(5).toArray();
      console.log('\n📝 Sample comments:');
      sampleComments.forEach(c => {
        console.log(`- ID: ${c._id}, postId: ${c.postId}, text: "${c.text.substring(0, 50)}..."`);
      });
    } else {
      console.log('❌ No comments found in database!');
    }
    
    // Check posts collection for comment counts
    const postsCollection = db.collection('posts');
    const postsWithComments = await postsCollection.find({ commentsCount: { $gt: 0 } }).limit(10).toArray();
    console.log('\n📮 Posts with comments (>0):', postsWithComments.length);
    postsWithComments.forEach(p => {
      console.log(`- PostID: ${p._id}, Comments: ${p.commentsCount || 0}, Caption: "${p.caption.substring(0, 50)}..."`);
    });
    
    // Check all posts and their comment counts
    const allPosts = await postsCollection.find({}).limit(20).toArray();
    console.log('\n📋 All posts and their comment counts (first 20):');
    allPosts.forEach(p => {
      console.log(`- PostID: ${p._id}, Comments field: ${p.commentsCount || 'undefined'}, Comments property: ${p.comments || 'undefined'}`);
    });
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkComments();
