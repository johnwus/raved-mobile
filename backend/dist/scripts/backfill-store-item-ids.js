"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const mongoose_1 = __importDefault(require("mongoose"));
const post_model_1 = require("../models/mongoose/post.model");
const config_1 = require("../config");
/**
 * Backfill saleDetails.storeItemId for sale posts without the link.
 * Strategy:
 * 1. Find posts where isForSale=true and saleDetails.storeItemId is missing.
 * 2. Query Postgres store_items by seller_id and match on name (caption or saleDetails.itemName)
 *    and (optionally) price. Prefer newest item. Fallback: ILIKE name partial.
 * 3. Update Post document with saleDetails.storeItemId.
 */
async function main() {
    const pg = new pg_1.Pool({ connectionString: config_1.CONFIG.POSTGRES_URL });
    await mongoose_1.default.connect(config_1.CONFIG.MONGODB_URL);
    const batchSize = 200;
    let updated = 0;
    let scanned = 0;
    // @ts-ignore - dynamic path query
    const cursor = post_model_1.Post.find({ isForSale: true, $or: [{ 'saleDetails.storeItemId': { $exists: false } }, { 'saleDetails.storeItemId': null }] })
        .cursor({ batchSize });
    for await (const post of cursor) {
        scanned++;
        const userId = post.userId;
        const name = (post.saleDetails?.itemName) || post.caption || '';
        const price = post.saleDetails?.price || null;
        if (!userId || !name)
            continue;
        try {
            // Exact match: seller + (name) + (optional price)
            const params = [userId, 'active'];
            const clauses = ['seller_id = $1', "status = $2", 'deleted_at IS NULL'];
            let idx = params.length + 1;
            clauses.push(`name = $${idx++}`);
            params.push(name);
            if (price) {
                clauses.push(`price = $${idx++}`);
                params.push(price);
            }
            const exactSql = `SELECT id FROM store_items WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC LIMIT 1`;
            const exact = await pg.query(exactSql, params);
            let itemId = exact.rows?.[0]?.id;
            if (!itemId) {
                // Fallback: partial ILIKE
                const fallback = await pg.query(`SELECT id FROM store_items WHERE seller_id = $1 AND status = 'active' AND deleted_at IS NULL AND name ILIKE $2 ORDER BY created_at DESC LIMIT 1`, [userId, `%${name.slice(0, 32)}%`]);
                itemId = fallback.rows?.[0]?.id;
            }
            if (itemId) {
                await post_model_1.Post.updateOne({ _id: post._id }, { $set: { 'saleDetails.storeItemId': itemId } });
                updated++;
                if (updated % 25 === 0)
                    console.log(`Updated ${updated} posts (scanned ${scanned})`);
            }
        }
        catch (e) {
            console.warn('Backfill error for post', post._id?.toString?.(), e?.message || e);
        }
    }
    console.log(`Backfill done: scanned=${scanned} updated=${updated}`);
    await pg.end();
    await mongoose_1.default.disconnect();
}
main().catch((e) => {
    console.error('Backfill fatal error', e);
    process.exit(1);
});
