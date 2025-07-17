/* eslint-disable camelcase */
class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, username, content, date, is_delete } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = is_delete ? '**komentar telah dihapus**' : content;
    this.replies = [];
  }

  _verifyPayload({ id, username, content, date, is_delete }) {
    if (!id || !username || !date || (is_delete === false && !content)) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      (is_delete === false && typeof content !== 'string') ||
      (typeof date !== 'string' && !(date instanceof Date))
    ) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailComment;
