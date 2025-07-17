const CommentRepository = require('../CommentRepository');

describe('CommentRepository interface', () => {
  it('should throw error when invoking unimplemented method: addComment', async () => {
    const commentRepository = new CommentRepository();

    await expect(commentRepository.addComment({}, {}, {})).rejects.toThrowError(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
  });

  it('should throw error when invoking unimplemented method: deleteCommentById', async () => {
    const commentRepository = new CommentRepository();

    await expect(
      commentRepository.deleteCommentById('comment-123')
    ).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking unimplemented method: checkCommentAvailability', async () => {
    const commentRepository = new CommentRepository();

    await expect(
      commentRepository.checkCommentAvailability('comment-123', 'thread-123')
    ).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking unimplemented method: verifyCommentOwner', async () => {
    const commentRepository = new CommentRepository();

    await expect(
      commentRepository.verifyCommentOwner('comment-123', 'user-123')
    ).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking unimplemented method: getCommentsByThreadId', async () => {
    const commentRepository = new CommentRepository();

    await expect(
      commentRepository.getCommentsByThreadId('thread-123')
    ).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
