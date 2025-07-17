const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteCommentUseCase', () => {
  const owner = 'user-123';
  const threadId = 'thread-123';
  const commentId = 'comment-123';
  const useCaseParams = { threadId, commentId };

  let mockCommentRepository;
  let mockThreadRepository;
  let deleteCommentUseCase;

  beforeEach(() => {
    mockCommentRepository = new CommentRepository();
    mockThreadRepository = new ThreadRepository();

    // default: semua check → resolve
    mockThreadRepository.checkThreadAvailability = jest
      .fn()
      .mockResolvedValue();
    mockCommentRepository.checkCommentAvailability = jest
      .fn()
      .mockResolvedValue();
    mockCommentRepository.verifyCommentOwner = jest.fn().mockResolvedValue();
    mockCommentRepository.deleteCommentById = jest.fn().mockResolvedValue();

    // buat instance use case
    deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });
  });

  it('should orchestrate the delete comment action correctly', async () => {
    // Act
    const result = await deleteCommentUseCase.execute(owner, useCaseParams);

    // Assert return value
    expect(result).toStrictEqual({ status: 'success' });

    // Assert pemanggilan repositori thread
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledTimes(
      1
    );
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledWith(
      threadId
    );

    // Assert pemanggilan repositori comment availability
    expect(
      mockCommentRepository.checkCommentAvailability
    ).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.checkCommentAvailability).toHaveBeenCalledWith(
      commentId,
      threadId
    );

    // Assert pemanggilan repositori comment owner verification
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(
      commentId,
      owner
    );

    // Assert pemanggilan repositori delete
    expect(mockCommentRepository.deleteCommentById).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.deleteCommentById).toHaveBeenCalledWith(
      commentId
    );
  });

  it('should throw error if thread is not found', async () => {
    // Arrange: thread check gagal
    mockThreadRepository.checkThreadAvailability.mockRejectedValue(
      new Error('THREAD.NOT_FOUND')
    );

    // Act & Assert
    await expect(
      deleteCommentUseCase.execute(owner, useCaseParams)
    ).rejects.toThrowError('THREAD.NOT_FOUND');

    // Pastikan thread sudah dicek sekali
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledTimes(
      1
    );
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledWith(
      threadId
    );

    // Pastikan tidak lanjut ke comment repository
    expect(
      mockCommentRepository.checkCommentAvailability
    ).not.toHaveBeenCalled();
    expect(mockCommentRepository.verifyCommentOwner).not.toHaveBeenCalled();
    expect(mockCommentRepository.deleteCommentById).not.toHaveBeenCalled();
  });

  it('should throw error if comment is not found in thread', async () => {
    // Arrange: comment availability gagal
    mockCommentRepository.checkCommentAvailability.mockRejectedValue(
      new Error('COMMENT.NOT_FOUND')
    );

    // Act & Assert
    await expect(
      deleteCommentUseCase.execute(owner, useCaseParams)
    ).rejects.toThrowError('COMMENT.NOT_FOUND');

    // Pastikan thread sudah dicek
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledTimes(
      1
    );
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledWith(
      threadId
    );

    // Pastikan cek comment availability dipanggil sekali dengan parameter yang benar
    expect(
      mockCommentRepository.checkCommentAvailability
    ).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.checkCommentAvailability).toHaveBeenCalledWith(
      commentId,
      threadId
    );

    // Pastikan tidak lanjut ke verify owner & delete
    expect(mockCommentRepository.verifyCommentOwner).not.toHaveBeenCalled();
    expect(mockCommentRepository.deleteCommentById).not.toHaveBeenCalled();
  });

  it('should throw error if user is not the owner of comment', async () => {
    // Arrange: verify owner gagal
    mockCommentRepository.verifyCommentOwner.mockRejectedValue(
      new Error('COMMENT.NOT_OWNER')
    );

    // Act & Assert
    await expect(
      deleteCommentUseCase.execute(owner, useCaseParams)
    ).rejects.toThrowError('COMMENT.NOT_OWNER');

    // Pastikan thread & availability sudah dicek
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledTimes(
      1
    );
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledWith(
      threadId
    );

    expect(
      mockCommentRepository.checkCommentAvailability
    ).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.checkCommentAvailability).toHaveBeenCalledWith(
      commentId,
      threadId
    );

    // Pastikan verify owner dipanggil sekali dengan parameter yang benar
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(
      commentId,
      owner
    );

    // Pastikan delete tidak dipanggil
    expect(mockCommentRepository.deleteCommentById).not.toHaveBeenCalled();
  });
});
