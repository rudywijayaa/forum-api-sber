const { nanoid } = require('nanoid');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  async addComment(owner, threadId, addComment) {
    const { content } = addComment;
    const id = `comment-${nanoid(16)}`;
    const date = new Date().toISOString();

    const query = {
      text: `
        INSERT INTO comments (id, content, date, thread_id, owner)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, content, owner
      `,
      values: [id, content, date, threadId, owner],
    };

    const result = await this._pool.query(query);
    return new AddedComment(result.rows[0]);
  }

  async deleteCommentById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = TRUE WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async checkCommentAvailability(commentId, threadId) {
    const query = {
      text: `
        SELECT id, thread_id, is_delete
        FROM comments
        WHERE id = $1
      `,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }

    const comment = result.rows[0];

    if (comment.is_delete) {
      throw new NotFoundError('Komentar telah dihapus');
    }

    if (comment.thread_id !== threadId) {
      throw new NotFoundError('Komentar tidak ditemukan pada thread ini');
    }
  }

  async verifyCommentOwner(commentId, userId) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }

    const { owner } = result.rows[0];

    if (owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses komentar ini');
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `
        SELECT comments.id, comments.content, comments.date, comments.is_delete, users.username
        FROM comments
        JOIN users ON comments.owner = users.id
        WHERE comments.thread_id = $1
        ORDER BY comments.date ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      date: row.date,
      content: row.content,
      is_delete: row.is_delete,
    }));
  }
}

module.exports = CommentRepositoryPostgres;
