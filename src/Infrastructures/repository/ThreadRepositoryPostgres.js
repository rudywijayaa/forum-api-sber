const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(owner, newThread) {
    const { title, body } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date();

    const query = {
      text: `INSERT INTO threads (id, title, body, date, owner)
             VALUES($1, $2, $3, $4, $5)
             RETURNING id, title, owner`,
      values: [id, title, body, date, owner],
    };

    const result = await this._pool.query(query);
    return new AddedThread(result.rows[0]);
  }

  async checkThreadAvailability(threadId) {
    const result = await this._pool.query({
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    });
    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async getThreadById(threadId) {
    const result = await this._pool.query({
      text: `
        SELECT t.id,
               t.title,
               t.body,
               t.date,
               u.username
        FROM threads t
        JOIN users u ON t.owner = u.id
        WHERE t.id = $1
      `,
      values: [threadId],
    });
    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      body: row.body,
      date: row.date,
      username: row.username,
    };
  }

  async getCommentsByThreadId(threadId) {
    const result = await this._pool.query({
      text: `
        SELECT c.id,
               u.username,
               c.date,
               c.content,
               c.is_delete
        FROM comments c
        JOIN users u ON c.owner = u.id
        WHERE c.thread_id = $1
        ORDER BY c.date ASC
      `,
      values: [threadId],
    });
    return result.rows.map((r) => ({
      id: r.id,
      username: r.username,
      date: r.date,
      content: r.content,
      is_delete: r.is_delete,
    }));
  }
}

module.exports = ThreadRepositoryPostgres;
