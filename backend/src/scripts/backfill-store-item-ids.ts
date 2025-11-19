import 'dotenv/config';
import { Pool } from 'pg';
import mongoose from 'mongoose';
import { Post } from '../models/mongoose/post.model';
import { CONFIG } from '../config';

/**
 * Backfill saleDetails.storeItemId for sale posts without the link.
 * Strategy:
 * 1. Find posts where isForSale=true and saleDetails.storeItemId is missing.
 * 2. Query Postgres store_items by seller_id and match on name (caption or saleDetails.itemName)
 *    and (optionally) price. Prefer newest item. Fallback: ILIKE name partial.
 * 3. Update Post document with saleDetails.storeItemId.
 */
async function main() {
  const pg = new Pool({ connectionString: CONFIG.POSTGRES_URL });
  await mongoose.connect(CONFIG.MONGODB_URL);

  const batchSize = 200;
  let updated = 0;
  let scanned = 0;

  // @ts-ignore - dynamic path query
  const cursor = Post.find({ isForSale: true, $or: [ { 'saleDetails.storeItemId': { $exists: false } }, { 'saleDetails.storeItemId': null } ] })
    .cursor({ batchSize });

  for await (const post of cursor as any) {
    scanned++;
    const userId = post.userId;
    const name = (post.saleDetails?.itemName) || post.caption || '';
    const price = post.saleDetails?.price || null;

    if (!userId || !name) continue;

    try {
      // Exact match: seller + (name) + (optional price)
      const params: any[] = [userId, 'active'];
      const clauses: string[] = ['seller_id = $1', "status = $2", 'deleted_at IS NULL'];
      let idx = params.length + 1;
      clauses.push(`name = $${idx++}`); params.push(name);
      if (price) { clauses.push(`price = $${idx++}`); params.push(price); }
      const exactSql = `SELECT id FROM store_items WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC LIMIT 1`;
      const exact = await pg.query(exactSql, params);

      let itemId: string | undefined = exact.rows?.[0]?.id;
      if (!itemId) {
        // Fallback: partial ILIKE
        const fallback = await pg.query(
          `SELECT id FROM store_items WHERE seller_id = $1 AND status = 'active' AND deleted_at IS NULL AND name ILIKE $2 ORDER BY created_at DESC LIMIT 1`,
          [userId, `%${name.slice(0, 32)}%`]
        );
        itemId = fallback.rows?.[0]?.id;
      }

      if (itemId) {
        await Post.updateOne({ _id: post._id }, { $set: { 'saleDetails.storeItemId': itemId } });
        updated++;
        if (updated % 25 === 0) console.log(`Updated ${updated} posts (scanned ${scanned})`);
      }
    } catch (e: any) {
      console.warn('Backfill error for post', post._id?.toString?.(), e?.message || e);
    }
  }

  console.log(`Backfill done: scanned=${scanned} updated=${updated}`);
  await pg.end();
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('Backfill fatal error', e);
  process.exit(1);
});
