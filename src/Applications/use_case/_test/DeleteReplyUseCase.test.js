const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteReplyUseCase', () => {
  const owner = 'user-123';
  const threadId = 'thread-123';
  const commentId = 'comment-123';
  const replyId = 'reply-123';
  const useCaseParams = { threadId, commentId, replyId };

  let mockThreadRepository;
  let mockCommentRepository;
  let mockReplyRepository;
  let deleteReplyUseCase;

  beforeEach(() => {
    mockThreadRepository = new ThreadRepository();
    mockCommentRepository = new CommentRepository();
    mockReplyRepository = new ReplyRepository();

    // default: semua check → resolve
    mockThreadRepository.checkThreadAvailability = jest
      .fn()
      .mockResolvedValue();
    mockCommentRepository.checkCommentAvailability = jest
      .fn()
      .mockResolvedValue();
    mockReplyRepository.checkReplyAvailability = jest.fn().mockResolvedValue();
    mockReplyRepository.verifyReplyOwner = jest.fn().mockResolvedValue();
    mockReplyRepository.deleteReplyById = jest.fn().mockResolvedValue();

    deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });
  });

  it('should orchestrate the delete reply action correctly', async () => {
    // Act
    const result = await deleteReplyUseCase.execute(owner, useCaseParams);

    // Assert return value
    expect(result).toStrictEqual({ status: 'success' });

    // Assert thread check
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledTimes(
      1
    );
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledWith(
      threadId
    );

    // Assert comment check
    expect(
      mockCommentRepository.checkCommentAvailability
    ).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.checkCommentAvailability).toHaveBeenCalledWith(
      commentId,
      threadId
    );

    // Assert reply check
    expect(mockReplyRepository.checkReplyAvailability).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.checkReplyAvailability).toHaveBeenCalledWith(
      replyId,
      commentId
    );

    // Assert owner verification
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(
      replyId,
      owner
    );

    // Assert delete
    expect(mockReplyRepository.deleteReplyById).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.deleteReplyById).toHaveBeenCalledWith(replyId);
  });

  it('should throw error if thread is not found', async () => {
    // Arrange
    mockThreadRepository.checkThreadAvailability.mockRejectedValue(
      new Error('THREAD.NOT_FOUND')
    );

    // Act & Assert
    await expect(
      deleteReplyUseCase.execute(owner, useCaseParams)
    ).rejects.toThrowError('THREAD.NOT_FOUND');

    // thread checked once
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledTimes(
      1
    );
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledWith(
      threadId
    );

    // no further calls
    expect(
      mockCommentRepository.checkCommentAvailability
    ).not.toHaveBeenCalled();
    expect(mockReplyRepository.checkReplyAvailability).not.toHaveBeenCalled();
    expect(mockReplyRepository.verifyReplyOwner).not.toHaveBeenCalled();
    expect(mockReplyRepository.deleteReplyById).not.toHaveBeenCalled();
  });

  it('should throw error if comment is not found in thread', async () => {
    // Arrange
    mockCommentRepository.checkCommentAvailability.mockRejectedValue(
      new Error('COMMENT.NOT_FOUND')
    );

    // Act & Assert
    await expect(
      deleteReplyUseCase.execute(owner, useCaseParams)
    ).rejects.toThrowError('COMMENT.NOT_FOUND');

    // thread checked
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledTimes(
      1
    );
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledWith(
      threadId
    );

    // comment checked once
    expect(
      mockCommentRepository.checkCommentAvailability
    ).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.checkCommentAvailability).toHaveBeenCalledWith(
      commentId,
      threadId
    );

    // no further calls
    expect(mockReplyRepository.checkReplyAvailability).not.toHaveBeenCalled();
    expect(mockReplyRepository.verifyReplyOwner).not.toHaveBeenCalled();
    expect(mockReplyRepository.deleteReplyById).not.toHaveBeenCalled();
  });

  it('should throw error if reply is not found under comment', async () => {
    // Arrange
    mockReplyRepository.checkReplyAvailability.mockRejectedValue(
      new Error('REPLY.NOT_FOUND')
    );

    // Act & Assert
    await expect(
      deleteReplyUseCase.execute(owner, useCaseParams)
    ).rejects.toThrowError('REPLY.NOT_FOUND');

    // thread & comment checked
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledTimes(
      1
    );
    expect(
      mockCommentRepository.checkCommentAvailability
    ).toHaveBeenCalledTimes(1);

    // reply checked once
    expect(mockReplyRepository.checkReplyAvailability).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.checkReplyAvailability).toHaveBeenCalledWith(
      replyId,
      commentId
    );

    // no further calls
    expect(mockReplyRepository.verifyReplyOwner).not.toHaveBeenCalled();
    expect(mockReplyRepository.deleteReplyById).not.toHaveBeenCalled();
  });

  it('should throw error if user is not the owner of reply', async () => {
    // Arrange
    mockReplyRepository.verifyReplyOwner.mockRejectedValue(
      new Error('REPLY.NOT_OWNER')
    );

    // Act & Assert
    await expect(
      deleteReplyUseCase.execute(owner, useCaseParams)
    ).rejects.toThrowError('REPLY.NOT_OWNER');

    // thread, comment & reply checked
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledTimes(
      1
    );
    expect(
      mockCommentRepository.checkCommentAvailability
    ).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.checkReplyAvailability).toHaveBeenCalledTimes(1);

    // owner verification once
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(
      replyId,
      owner
    );

    // delete not called
    expect(mockReplyRepository.deleteReplyById).not.toHaveBeenCalled();
  });
});
