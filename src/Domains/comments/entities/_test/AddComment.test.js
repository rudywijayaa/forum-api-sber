const AddComment = require('../AddComment');

describe('AddComment entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {}; // missing 'content'

    expect(() => new AddComment(payload)).toThrowError(
      'ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when content is not a string', () => {
    const payload = { content: 123 };

    expect(() => new AddComment(payload)).toThrowError(
      'ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create AddComment entity correctly', () => {
    const payload = { content: 'sebuah komentar' };

    const addComment = new AddComment(payload);

    expect(addComment).toBeInstanceOf(AddComment);
    expect(addComment.content).toEqual(payload.content);
  });
});
