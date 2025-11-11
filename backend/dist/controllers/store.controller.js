"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStoreItem = exports.getStoreItem = exports.getStoreItems = void 0;
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const utils_1 = require("../utils");
const getStoreItems = async (req, res) => {
    try {
        const { category, sort, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = 'SELECT * FROM store_items WHERE status = $1 AND deleted_at IS NULL';
        const params = ['active'];
        let paramIndex = 2;
        // Filter by category
        if (category && category !== 'all') {
            query += ` AND category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }
        // Filter by price range
        if (minPrice) {
            query += ` AND price >= $${paramIndex}`;
            params.push(parseFloat(minPrice));
            paramIndex++;
        }
        if (maxPrice) {
            query += ` AND price <= $${paramIndex}`;
            params.push(parseFloat(maxPrice));
            paramIndex++;
        }
        // Sorting
        const sortMap = {
            'newest': 'created_at DESC',
            'price-low': 'price ASC',
            'price-high': 'price DESC',
            'popular': 'likes_count DESC'
        };
        query += ` ORDER BY ${sortMap[sort] || 'created_at DESC'}`;
        // Pagination
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), offset);
        const result = await database_1.pgPool.query(query, params);
        // Get seller info for each item
        const sellerIds = [...new Set(result.rows.map(item => item.seller_id))];
        const sellers = await database_1.pgPool.query('SELECT id, username, first_name, last_name, avatar_url, faculty FROM users WHERE id = ANY($1)', [sellerIds]);
        const sellerMap = {};
        sellers.rows.forEach(s => {
            sellerMap[s.id] = {
                id: s.id,
                username: s.username,
                name: `${s.first_name} ${s.last_name}`,
                avatarUrl: s.avatar_url,
                faculty: s.faculty
            };
        });
        const items = result.rows.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: parseFloat(item.price),
            originalPrice: item.original_price ? parseFloat(item.original_price) : null,
            category: item.category,
            condition: item.condition,
            size: item.size,
            brand: item.brand,
            color: item.color,
            images: item.images || [],
            seller: sellerMap[item.seller_id],
            viewsCount: item.views_count,
            likesCount: item.likes_count,
            savesCount: item.saves_count,
            createdAt: item.created_at,
            timeAgo: (0, utils_1.getTimeAgo)(item.created_at)
        }));
        res.json({
            success: true,
            items,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                hasMore: items.length === parseInt(limit)
            }
        });
    }
    catch (error) {
        console.error('Get Store Items Error:', error);
        res.status(500).json({ error: 'Failed to get store items' });
    }
};
exports.getStoreItems = getStoreItems;
const getStoreItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const result = await database_1.pgPool.query('SELECT * FROM store_items WHERE id = $1 AND deleted_at IS NULL', [itemId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        const item = result.rows[0];
        // Increment views
        await database_1.pgPool.query('UPDATE store_items SET views_count = views_count + 1 WHERE id = $1', [itemId]);
        // Get seller info
        const seller = await database_1.pgPool.query('SELECT id, username, first_name, last_name, avatar_url, faculty FROM users WHERE id = $1', [item.seller_id]);
        res.json({
            success: true,
            item: {
                id: item.id,
                name: item.name,
                description: item.description,
                price: parseFloat(item.price),
                originalPrice: item.original_price ? parseFloat(item.original_price) : null,
                category: item.category,
                condition: item.condition,
                size: item.size,
                brand: item.brand,
                color: item.color,
                material: item.material,
                images: item.images || [],
                paymentMethods: item.payment_methods || [],
                meetupLocation: item.meetup_location,
                sellerPhone: item.seller_phone,
                seller: {
                    id: seller.rows[0].id,
                    username: seller.rows[0].username,
                    name: `${seller.rows[0].first_name} ${seller.rows[0].last_name}`,
                    avatarUrl: seller.rows[0].avatar_url,
                    faculty: seller.rows[0].faculty
                },
                viewsCount: item.views_count + 1,
                likesCount: item.likes_count,
                savesCount: item.saves_count,
                salesCount: item.sales_count,
                status: item.status,
                createdAt: item.created_at,
                timeAgo: (0, utils_1.getTimeAgo)(item.created_at)
            }
        });
    }
    catch (error) {
        console.error('Get Store Item Error:', error);
        res.status(500).json({ error: 'Failed to get item' });
    }
};
exports.getStoreItem = getStoreItem;
const createStoreItem = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { name, description, price, originalPrice, category, condition, size, brand, color, material, images, paymentMethods, meetupLocation, sellerPhone } = req.body;
        const result = await database_1.pgPool.query(`
            INSERT INTO store_items (
            seller_id, name, description, price, original_price,
            category, condition, size, brand, color, material,
            images, payment_methods, meetup_location, seller_phone
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `, [
            userId, name, description, price, originalPrice || null,
            category, condition, size, brand, color, material,
            images || [], paymentMethods || [], meetupLocation, sellerPhone
        ]);
        const item = result.rows[0];
        res.status(201).json({
            success: true,
            item
        });
    }
    catch (error) {
        console.error('Create Store Item Error:', error);
        res.status(500).json({ error: 'Failed to create store item' });
    }
};
exports.createStoreItem = createStoreItem;
