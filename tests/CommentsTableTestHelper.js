/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  // tests/CommentsTableTestHelper.js
  async addComment({
    id = 'comment-123',
    content = 'A new comment',
    date = new Date().toISOString(),
    thread_id = 'thread-123', // snake_case default
    threadId, // camelCase alias
    owner = 'user-123',
    is_delete = false,
    isDelete, // alias camelCase
  }) {
    const thread = threadId ?? thread_id;
    const deleted = isDelete ?? is_delete;

    const query = {
      text: `INSERT INTO comments (id, content, date, thread_id, owner, is_delete)
           VALUES ($1, $2, $3, $4, $5, $6)`,
      values: [id, content, date, thread, owner, deleted],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows; // <-- pastikan return array, bukan rows[0]
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments');
  },
};

module.exports = CommentsTableTestHelper;
