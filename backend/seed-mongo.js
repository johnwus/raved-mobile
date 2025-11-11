const mongoose = require('mongoose');

// Connect to MongoDB and seed data
async function seedMongoDB() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect('mongodb+srv://idnqnzt_db_user:00DcA5rr2LDDCots@raved-mongodb.c7kgll2.mongodb.net/?appName=raved-mongodb');
    console.log('✅ MongoDB connected successfully');

    // Define schemas
    const postSchema = new mongoose.Schema({
      userId: String,
      type: { type: String, enum: ['image', 'video', 'carousel', 'text'] },
      caption: String,
      media: {
        image: String,
        video: String,
        thumbnail: String,
        images: [String]
      },
      location: String,
      tags: [String],
      brand: String,
      occasion: String,
      visibility: { type: String, enum: ['public', 'faculty', 'connections', 'private'], default: 'public' },
      isForSale: { type: Boolean, default: false },
      saleDetails: {
        itemName: String,
        price: Number,
        originalPrice: Number,
        category: String,
        condition: String,
        size: String,
        brand: String,
        color: String,
        material: String,
        paymentMethods: [String],
        meetupLocation: String,
        sellerPhone: String,
        negotiable: Boolean
      },
      likesCount: { type: Number, default: 0 },
      commentsCount: { type: Number, default: 0 },
      sharesCount: { type: Number, default: 0 },
      savesCount: { type: Number, default: 0 },
      viewsCount: { type: Number, default: 0 },
      isFeatured: { type: Boolean, default: false },
      featuredAt: Date,
      faculty: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      deletedAt: Date
    });

    const storySchema = new mongoose.Schema({
      userId: String,
      type: { type: String, enum: ['image', 'video'] },
      media: {
        image: String,
        video: String,
        thumbnail: String
      },
      caption: String,
      location: String,
      viewsCount: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      expiresAt: Date,
      deletedAt: Date
    });

    const commentSchema = new mongoose.Schema({
      postId: String,
      userId: String,
      content: String,
      likesCount: { type: Number, default: 0 },
      repliesCount: { type: Number, default: 0 },
      parentCommentId: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      deletedAt: Date
    });

    const likeSchema = new mongoose.Schema({
      userId: String,
      targetId: String,
      targetType: { type: String, enum: ['post', 'comment'] },
      createdAt: { type: Date, default: Date.now }
    });

    // Create models
    const Post = mongoose.model('Post', postSchema);
    const Story = mongoose.model('Story', storySchema);
    const Comment = mongoose.model('Comment', commentSchema);
    const Like = mongoose.model('Like', likeSchema);

    // Mock data
    const mockUsers = [
      { id: 'u1', name: 'Sophie Parker', faculty: 'Science' },
      { id: 'u2', name: 'Emily White', faculty: 'Arts' },
      { id: 'u3', name: 'Marcus Stevens', faculty: 'Business' },
      { id: 'u4', name: 'Anna Reynolds', faculty: 'Medicine' },
      { id: 'u5', name: 'David Chen', faculty: 'Engineering' },
      { id: 'u6', name: 'Jason Miller', faculty: 'Law' },
    ];

    const mockImages = [
      'https://i.imgur.com/Ynh9LMX.jpg',
      'https://i.imgur.com/D3CYJcL.jpg',
      'https://i.imgur.com/JObkVPV.jpg',
      'https://i.imgur.com/KnZQY6W.jpg',
      'https://i.imgur.com/IigY4Hm.jpg',
      'https://i.imgur.com/nV6fsQh.jpg',
    ];

    const mockCaptions = [
      'Perfect outfit for today\'s presentation! 💼 #CampusStyle',
      'Sustainable fashion vibes 🌿 #EcoFriendly',
      'Weekend casuals ✨ #Relaxed',
      'Library chic 📚 #AcademicFashion',
      'Date night look 💕 #Elegant',
      'Comfort meets style 😊 #CampusLife',
      'Bold colors today 🎨 #Creative',
      'Vintage vibes 🎭 #VintageStyle',
    ];

    // Seed posts
    console.log('📝 Seeding posts...');
    let postCount = 0;
    for (const user of mockUsers) {
      const numPosts = Math.floor(Math.random() * 4) + 2;

      for (let i = 0; i < numPosts; i++) {
        const postTypes = ['image', 'video', 'carousel'];
        const postType = postTypes[Math.floor(Math.random() * postTypes.length)];

        let media = {};
        if (postType === 'image') {
          media = { image: mockImages[Math.floor(Math.random() * mockImages.length)] };
        } else if (postType === 'video') {
          media = {
            video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            thumbnail: mockImages[Math.floor(Math.random() * mockImages.length)]
          };
        } else if (postType === 'carousel') {
          const numImages = Math.floor(Math.random() * 3) + 2;
          media = { images: mockImages.slice(0, numImages) };
        }

        const caption = mockCaptions[Math.floor(Math.random() * mockCaptions.length)];
        const isForSale = Math.random() < 0.2;

        let saleDetails = null;
        if (isForSale) {
          saleDetails = {
            itemName: 'Fashion Item',
            price: Math.floor(Math.random() * 100) + 20,
            condition: ['new', 'like-new', 'good'][Math.floor(Math.random() * 3)],
            category: 'clothing',
            paymentMethods: ['Mobile Money', 'Cash'],
            meetupLocation: 'Campus Library'
          };
        }

        const visibilities = ['public', 'faculty', 'connections'];
        const visibility = visibilities[Math.floor(Math.random() * visibilities.length)];

        await Post.create({
          userId: user.id,
          type: postType,
          caption,
          media,
          location: 'Campus Library',
          tags: ['OOTD', 'CampusStyle'],
          visibility,
          isForSale,
          saleDetails,
          likesCount: Math.floor(Math.random() * 50) + 5,
          commentsCount: Math.floor(Math.random() * 20) + 2,
          sharesCount: Math.floor(Math.random() * 10),
          savesCount: Math.floor(Math.random() * 15),
          viewsCount: Math.floor(Math.random() * 200) + 20,
          faculty: user.faculty,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });

        postCount++;
      }
    }

    // Seed stories
    console.log('📖 Seeding stories...');
    let storyCount = 0;
    for (const user of mockUsers) {
      if (Math.random() < 0.7) {
        const numStories = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < numStories; i++) {
          const storyTypes = ['image', 'video'];
          const storyType = storyTypes[Math.floor(Math.random() * storyTypes.length)];

          let media = {};
          if (storyType === 'image') {
            media = { image: mockImages[Math.floor(Math.random() * mockImages.length)] };
          } else {
            media = {
              video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
              thumbnail: mockImages[Math.floor(Math.random() * mockImages.length)]
            };
          }

          await Story.create({
            userId: user.id,
            type: storyType,
            media,
            caption: 'Daily update! 📸',
            location: 'Campus',
            viewsCount: Math.floor(Math.random() * 50) + 5,
            createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
          });

          storyCount++;
        }
      }
    }

    // Seed some likes and comments
    console.log('❤️ Seeding likes and comments...');
    const posts = await Post.find();
    for (const post of posts.slice(0, 10)) { // Just for first 10 posts
      // Add some likes
      const numLikes = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < numLikes; i++) {
        const liker = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        await Like.create({
          userId: liker.id,
          targetId: post._id.toString(),
          targetType: 'post'
        });
      }

      // Add some comments
      const numComments = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numComments; i++) {
        const commenter = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const comment = await Comment.create({
          postId: post._id.toString(),
          userId: commenter.id,
          content: 'Love this! 🔥',
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });

        // Add likes to comments
        if (Math.random() < 0.5) {
          const commentLiker = mockUsers[Math.floor(Math.random() * mockUsers.length)];
          await Like.create({
            userId: commentLiker.id,
            targetId: comment._id.toString(),
            targetType: 'comment'
          });
        }
      }
    }

    console.log('✅ Seeded MongoDB data:');
    console.log('📝 Posts:', postCount);
    console.log('📖 Stories:', storyCount);
    console.log('💬 Comments:', await Comment.countDocuments());
    console.log('❤️ Likes:', await Like.countDocuments());

    await mongoose.disconnect();
    console.log('✅ MongoDB seeding completed');

  } catch (error) {
    console.error('❌ MongoDB seeding failed:', error.message);
  }
}

seedMongoDB();