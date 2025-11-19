const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();
  const sql = `
    SELECT 
      u.faculty AS faculty,
      COUNT(DISTINCT u.id) as member_count,
      COUNT(DISTINCT p.id) as post_count,
      COUNT(DISTINCT e.id) as event_count
    FROM users u
    LEFT JOIN posts p ON p.user_id = u.id AND p.deleted_at IS NULL
    LEFT JOIN events e ON e.organizer_id = u.id AND e.deleted_at IS NULL
    WHERE u.faculty IS NOT NULL
      AND u.faculty != ''
      AND u.deleted_at IS NULL
    GROUP BY u.faculty
    ORDER BY member_count DESC, u.faculty ASC
  `;
  try {
    const res = await client.query(sql);
    console.log('rows', res.rows.length);
    console.log(res.rows.slice(0, 3));
  } catch (err) {
    console.error('Error executing faculties query:', err);
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('Script failure:', err);
  process.exit(1);
});


