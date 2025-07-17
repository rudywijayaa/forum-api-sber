const DetailComment = require('../DetailComment');

describe('DetailComment entity', () => {
  it('should throw error when missing required properties', () => {
    // is_delete false artinya content wajib ada
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: new Date().toISOString(),
      is_delete: false,
      // content intentionally missing
    };

    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when data types do not match', () => {
    const payload = {
      id: 123, // bukan string
      username: true, // bukan string
      content: {}, // bukan string
      date: [], // bukan string atau Date
      is_delete: false, // salah tipe boolean tapi doesn't matter here
    };

    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create DetailComment correctly if not deleted', () => {
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      content: 'Ini komentar aktif',
      date: new Date().toISOString(),
      is_delete: false,
    };

    const comment = new DetailComment(payload);

    expect(comment.id).toEqual(payload.id);
    expect(comment.username).toEqual(payload.username);
    expect(comment.content).toEqual(payload.content);
    expect(comment.date).toEqual(payload.date);
    expect(comment.replies).toEqual([]);
  });

  it('should mask content when comment is deleted', () => {
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      content: 'Ini komentar yang dihapus',
      date: new Date().toISOString(),
      is_delete: true, // deleted flag
    };

    const comment = new DetailComment(payload);

    expect(comment.content).toEqual('**komentar telah dihapus**');
  });

  it('should throw error when date is neither string nor instance of Date', () => {
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      content: 'isi komentar',
      date: 12345, // salah tipe
      is_delete: false, // content wajib ada, tapi date salah
    };

    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });
});
