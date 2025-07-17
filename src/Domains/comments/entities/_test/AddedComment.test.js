const AddedComment = require('../AddedComment');

describe('AddedComment entity', () => {
  it('should throw error when payload is missing required properties', () => {
    const payload = {
      content: 'komentar',
      owner: 'user-123',
      // id is missing
    };

    expect(() => new AddedComment(payload)).toThrowError(
      'ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when data types do not match', () => {
    const payload = {
      id: 'comment-123',
      content: 'komentar',
      owner: 456, // should be string
    };

    expect(() => new AddedComment(payload)).toThrowError(
      'ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create AddedComment entity properly', () => {
    const payload = {
      id: 'comment-123',
      content: 'komentar',
      owner: 'user-123',
    };

    const addedComment = new AddedComment(payload);

    expect(addedComment).toBeInstanceOf(AddedComment);
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});
