/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'sebuah balasan',
    date = new Date().toISOString(),
    commentId = 'comment-123',
    owner = 'user-123',
    is_delete = false, // ✅ gunakan is_delete
  }) {
    const query = {
      text: `
        INSERT INTO replies (id, content, date, comment_id, owner, is_delete)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      values: [id, content, date, commentId, owner, is_delete],
    };

    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies');
  },
};

module.exports = RepliesTableTestHelper;
