const AddCommentUseCase = require('../AddCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Sebuah komentar',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    // Expected result
    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    // Mock dependencies
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // thread availability check
    mockThreadRepository.checkThreadAvailability = jest
      .fn()
      .mockResolvedValue();
    // addComment returns AddedComment
    const returnedFromRepo = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });
    mockCommentRepository.addComment = jest
      .fn()
      .mockResolvedValue(returnedFromRepo);

    // Create use case instance
    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Act
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert: thread availability dipanggil tepat sekali dengan threadId
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledTimes(
      1
    );
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledWith(
      useCasePayload.threadId
    );

    // Assert: addComment dipanggil tepat sekali dengan owner, threadId, dan entitas AddComment
    expect(mockCommentRepository.addComment).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(
      useCasePayload.owner,
      useCasePayload.threadId,
      new AddComment({ content: useCasePayload.content })
    );

    // Assert: hasil return sesuai ekspektasi
    expect(addedComment).toBeInstanceOf(AddedComment);
    expect(addedComment).toStrictEqual(expectedAddedComment);
  });
});
