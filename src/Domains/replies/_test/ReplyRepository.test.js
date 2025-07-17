const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository interface', () => {
  it('should throw error when invoking unimplemented method: addReply', async () => {
    const repository = new ReplyRepository();
    await expect(repository.addReply({}, {}, {})).rejects.toThrowError(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
  });

  it('should throw error when invoking unimplemented method: getRepliesByCommentId', async () => {
    const repository = new ReplyRepository();
    await expect(
      repository.getRepliesByCommentId('comment-123')
    ).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking unimplemented method: getRepliesByThreadId', async () => {
    const repository = new ReplyRepository();
    await expect(
      repository.getRepliesByThreadId('thread-123')
    ).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking unimplemented method: deleteReplyById', async () => {
    const repository = new ReplyRepository();
    await expect(repository.deleteReplyById('reply-123')).rejects.toThrowError(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
  });

  it('should throw error when invoking unimplemented method: checkReplyAvailability', async () => {
    const repository = new ReplyRepository();
    await expect(
      repository.checkReplyAvailability('reply-123', 'comment-123')
    ).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking unimplemented method: verifyReplyOwner', async () => {
    const repository = new ReplyRepository();
    await expect(
      repository.verifyReplyOwner('reply-123', 'user-123')
    ).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
