import { Post } from '../models/mongoose';
import { pgPool } from '../config/database';

export const createPostForSale = async (postData: any, saleData: any, userId: string) => {
    let post;
    try {
        // Create post in MongoDB
        post = new Post(postData);
        await post.save();

        // Create store item in PostgreSQL
        await pgPool.query(`
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
        await pgPool.query(
            'UPDATE users SET posts_count = posts_count + 1 WHERE id = $1',
            [userId]
        );

        return post;
    } catch (error) {
        // Rollback
        if (post) {
            await Post.deleteOne({ _id: post._id });
        }
        throw error;
    }
};
