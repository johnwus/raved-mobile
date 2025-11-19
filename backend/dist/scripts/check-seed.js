"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const mongoose_1 = __importDefault(require("mongoose"));
const post_model_1 = require("../models/mongoose/post.model");
const story_model_1 = require("../models/mongoose/story.model");
async function checkSeededData() {
    try {
        console.log('🔍 Checking seeded data...');
        // Connect to MongoDB
        await mongoose_1.default.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/raved', {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });
        console.log('✅ Connected to MongoDB');
        // Check users
        const userResult = await database_1.pgPool.query('SELECT COUNT(*) FROM users WHERE username LIKE \'mock_%\'');
        console.log(`👥 Mock users: ${userResult.rows[0].count}`);
        // Check admin user
        const adminResult = await database_1.pgPool.query('SELECT COUNT(*) FROM users WHERE username = \'admin\'');
        console.log(`👑 Admin users: ${adminResult.rows[0].count}`);
        // Check posts (MongoDB)
        const postCount = await post_model_1.Post.countDocuments({ deletedAt: null });
        console.log(`📝 Posts (MongoDB): ${postCount}`);
        // Check stories (MongoDB)
        const storyCount = await story_model_1.Story.countDocuments({ deletedAt: null });
        console.log(`📖 Stories (MongoDB): ${storyCount}`);
        // Check store items
        const storeResult = await database_1.pgPool.query('SELECT COUNT(*) FROM store_items');
        console.log(`🛍️ Store items: ${storeResult.rows[0].count}`);
        // Check connections
        const connectionResult = await database_1.pgPool.query('SELECT COUNT(*) FROM connections');
        console.log(`🤝 Connections: ${connectionResult.rows[0].count}`);
        // Check conversations
        const conversationResult = await database_1.pgPool.query('SELECT COUNT(*) FROM conversations');
        console.log(`💬 Conversations: ${conversationResult.rows[0].count}`);
        // Check events
        const eventResult = await database_1.pgPool.query('SELECT COUNT(*) FROM events');
        console.log(`📅 Events: ${eventResult.rows[0].count}`);
        // Check user scores
        const scoreResult = await database_1.pgPool.query('SELECT COUNT(*) FROM user_scores');
        console.log(`🏆 User scores: ${scoreResult.rows[0].count}`);
        console.log('✅ Data check completed');
        // Disconnect from MongoDB
        await mongoose_1.default.disconnect();
    }
    catch (error) {
        console.error('❌ Error checking data:', error);
    }
    finally {
        await mongoose_1.default.disconnect().catch(() => { });
        process.exit(0);
    }
}
checkSeededData();
