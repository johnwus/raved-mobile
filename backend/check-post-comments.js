const mongoose = require('mongoose');
const { mongoUri } = require('./dist/config/database');

async function checkPostComments() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected\n');
    
    const db = mongoose.connection.db;
    const postsCollection = db.collection('posts');
    const commentsCollection = db.collection('comments');
    
    const postId = '6916347d7f05eace077b4cd0';
    
    // Check post
    const post = await postsCollection.findOne({ _id: new mongoose.Types.ObjectId(postId) });
    console.log(`📮 Post: ID=${postId}`);
    console.log(`   - Caption: "${post.caption}"`);
    console.log(`   - commentsCount field: ${post.commentsCount}`);
    console.log(`   - comments field: ${post.comments}`);
    
    // Check actual comments for this post
    const actualComments = await commentsCollection.find({ postId }).toArray();
    console.log(`\n💬 Actual comments in DB for this post: ${actualComments.length}`);
    actualComments.forEach(c => {
      console.log(`   - ID: ${c._id}, text: "${c.text}", by user: ${c.userId}`);
    });
    
    if (post.commentsCount !== actualComments.length) {
      console.log(`\n⚠️ MISMATCH DETECTED!`);
      console.log(`   - commentsCount: ${post.commentsCount}`);
      console.log(`   - Actual comments: ${actualComments.length}`);
      
      // Fix it
      console.log(`\n🔧 Fixing commentsCount...`);
      await postsCollection.updateOne(
        { _id: new mongoose.Types.ObjectId(postId) },
        { $set: { commentsCount: actualComments.length } }
      );
      console.log(`✅ Fixed! commentsCount now = ${actualComments.length}`);
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPostComments();
