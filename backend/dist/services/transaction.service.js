"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostForSale = void 0;
const mongoose_1 = require("../models/mongoose");
const database_1 = require("../config/database");
const createPostForSale = async (postData, saleData, userId) => {
    let post;
    try {
        // Create post in MongoDB
        post = new mongoose_1.Post(postData);
        await post.save();
        // Create store item in PostgreSQL
        await database_1.pgPool.query(`
            INSERT INTO store_items (
                id, seller_id, name, description, price, category, condition, size,
                images, payment_methods, meetup_location, seller_phone
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
            post._id.toString(),
            userId,
            saleData.name || postData.caption.substring(0, 100),
            saleData.description || postData.caption,
            saleData.price,
            saleData.category,
            saleData.condition,
            saleData.size,
            [postData.media.image || postData.media.images[0]],
            saleData.paymentMethods || [],
            saleData.meetupLocation,
            saleData.contactPhone
        ]);
        // Update user's post count in PostgreSQL
        await database_1.pgPool.query('UPDATE users SET posts_count = posts_count + 1 WHERE id = $1', [userId]);
        return post;
    }
    catch (error) {
        // Rollback
        if (post) {
            await mongoose_1.Post.deleteOne({ _id: post._id });
        }
        throw error;
    }
};
exports.createPostForSale = createPostForSale;
