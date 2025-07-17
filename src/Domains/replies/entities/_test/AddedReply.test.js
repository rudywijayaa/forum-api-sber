const AddedReply = require('../AddedReply');

describe('AddedReply entity', () => {
  it('should throw error when payload missing required properties', () => {
    const payload = { id: 'reply-123', content: 'content only' };
    expect(() => new AddedReply(payload)).toThrowError(
      'ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload has incorrect types', () => {
    const payload = { id: 123, content: true, owner: {} };
    expect(() => new AddedReply(payload)).toThrowError(
      'ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create AddedReply entity correctly', () => {
    const payload = {
      id: 'reply-123',
      content: 'some reply',
      owner: 'user-123',
    };
    const addedReply = new AddedReply(payload);

    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.owner).toEqual(payload.owner);
  });
});
