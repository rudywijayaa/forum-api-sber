// __tests__/DetailReply.test.js

const DetailReply = require('../DetailReply');

describe('DetailReply entity', () => {
  it('should throw error when missing required properties', () => {
    const payload = {
      id: 'reply-123',
      username: 'user1',
      content: 'text',
      // date missing
    };
    expect(() => new DetailReply(payload)).toThrowError(
      'REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload types are incorrect', () => {
    const payload = {
      id: 123, // not string
      username: [], // not string
      content: {}, // not string
      date: 9876, // not string or Date
    };
    expect(() => new DetailReply(payload)).toThrowError(
      'REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should accept date as Date object and not throw', () => {
    const now = new Date();
    const payload = {
      id: 'reply-789',
      username: 'user3',
      content: 'reply with Date object',
      date: now, // Date instance
      is_delete: false,
    };

    const detail = new DetailReply(payload);

    expect(detail.id).toEqual(payload.id);
    expect(detail.username).toEqual(payload.username);
    expect(detail.date).toEqual(now);
    expect(detail.content).toEqual(payload.content);
  });

  it('should show deleted message if is_delete is true', () => {
    const now = new Date().toISOString();
    const payload = {
      id: 'reply-123',
      username: 'user1',
      content: 'some content',
      date: now,
      is_delete: true,
    };

    const detail = new DetailReply(payload);

    expect(detail.id).toEqual(payload.id);
    expect(detail.username).toEqual(payload.username);
    expect(detail.date).toEqual(payload.date);
    expect(detail.content).toEqual('**balasan telah dihapus**');
  });

  it('should map content normally when not deleted', () => {
    const now = new Date().toISOString();
    const payload = {
      id: 'reply-456',
      username: 'user2',
      content: 'another reply',
      date: now,
      is_delete: false,
    };

    const detail = new DetailReply(payload);

    expect(detail.id).toEqual(payload.id);
    expect(detail.username).toEqual(payload.username);
    expect(detail.date).toEqual(payload.date);
    expect(detail.content).toEqual(payload.content);
  });
});
