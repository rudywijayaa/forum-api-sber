const { nanoid } = require('nanoid');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator = nanoid) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(owner, commentId, addReply) {
    const { content } = addReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: `
        INSERT INTO replies (id, content, comment_id, owner)
        VALUES ($1, $2, $3, $4)
        RETURNING id, content, owner
      `,
      values: [id, content, commentId, owner],
    };

    const result = await this._pool.query(query);
    return new AddedReply(result.rows[0]);
  }

  async checkReplyAvailability(replyId, commentId) {
    const result = await this._pool.query({
      text: `
        SELECT is_delete
        FROM replies
        WHERE id = $1 AND comment_id = $2
      `,
      values: [replyId, commentId],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Reply tidak ditemukan');
    }

    if (result.rows[0].is_delete) {
      throw new NotFoundError('balasan tidak valid');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const result = await this._pool.query({
      text: `
        SELECT owner
        FROM replies
        WHERE id = $1
      `,
      values: [replyId],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Reply tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async deleteReplyById(replyId) {
    await this._pool.query({
      text: `
        UPDATE replies
        SET is_delete = TRUE
        WHERE id = $1
      `,
      values: [replyId],
    });
  }

  async getRepliesByThreadId(threadId) {
    const result = await this._pool.query({
      text: `
        SELECT r.id, r.content, r.date, r.comment_id, r.is_delete, u.username
        FROM replies r
        JOIN comments c ON r.comment_id = c.id
        JOIN threads t  ON c.thread_id = t.id
        JOIN users u    ON r.owner = u.id
        WHERE t.id = $1
        ORDER BY r.date ASC
      `,
      values: [threadId],
    });

    return result.rows.map((row) => ({
      id: row.id,
      content: row.content, // mentah
      date: row.date.toISOString(),
      username: row.username,
      comment_id: row.comment_id,
      is_delete: row.is_delete, // biarkan entity yang masking nanti
    }));
  }

  async getRepliesByCommentId(commentId) {
    const result = await this._pool.query({
      text: `
        SELECT r.id,
               r.content,
               r.date,
               r.comment_id,
               r.is_delete,
               u.username
        FROM replies r
        JOIN users u ON r.owner = u.id
        WHERE r.comment_id = $1
        ORDER BY r.date ASC
      `,
      values: [commentId],
    });

    return result.rows.map((row) => ({
      id: row.id,
      content: row.content,
      date: row.date.toISOString(),
      username: row.username,
      comment_id: row.comment_id,
      is_delete: row.is_delete,
    }));
  }
}

module.exports = ReplyRepositoryPostgres;
