const AddReply = require('../AddReply');

describe('AddReply entity', () => {
  it('should throw error when payload does not contain content', () => {
    expect(() => new AddReply({})).toThrowError(
      'ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when content is not a string', () => {
    expect(() => new AddReply({ content: 123 })).toThrowError(
      'ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create AddReply entity correctly', () => {
    const payload = { content: 'A reply' };
    const addReply = new AddReply(payload);

    expect(addReply.content).toEqual(payload.content);
  });
});
