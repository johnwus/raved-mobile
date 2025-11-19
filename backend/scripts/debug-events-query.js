const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();

  const userId = process.env.DEBUG_USER_ID || '99a5025e-c83b-467c-a215-682c547deaf2';
  const sql = `
    SELECT e.*, u.username, u.first_name, u.last_name, u.avatar_url,
           CASE WHEN ea.user_id IS NOT NULL THEN true ELSE false END as is_attending,
           ea.registered_at as joined_at
    FROM events e
    JOIN users u ON e.organizer_id = u.id
    LEFT JOIN event_attendees ea ON e.id = ea.event_id AND ea.user_id = $1
    WHERE e.deleted_at IS NULL
    ORDER BY e.event_date ASC, e.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  try {
    const res = await client.query(sql, [userId, 20, 0]);
    console.log('rows', res.rows.length);
    console.log(res.rows.slice(0, 3));
  } catch (err) {
    console.error('Error executing events query:', err);
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('Script failure:', err);
  process.exit(1);
});


