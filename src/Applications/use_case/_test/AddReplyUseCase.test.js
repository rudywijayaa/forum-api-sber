const AddReplyUseCase = require('../AddReplyUseCase');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const useCasePayload = { content: 'sebuah balasan' };
    const owner = 'user-123';

    // Expected result
    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner,
    });

    // Mock repositories
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkThreadAvailability = jest
      .fn()
      .mockResolvedValue();
    mockCommentRepository.checkCommentAvailability = jest
      .fn()
      .mockResolvedValue();
    mockReplyRepository.addReply = jest.fn(
      (replyOwner, commentId, addReplyEntity) =>
        Promise.resolve(
          new AddedReply({
            id: 'reply-123',
            content: addReplyEntity.content,
            owner: replyOwner,
          })
        )
    );

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    const addedReply = await addReplyUseCase.execute(
      owner,
      useCaseParams,
      useCasePayload
    );

    // Assert return value
    expect(addedReply).toStrictEqual(expectedAddedReply);

    // Assert threadRepository was called exactly once
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledTimes(
      1
    );
    expect(mockThreadRepository.checkThreadAvailability).toHaveBeenCalledWith(
      useCaseParams.threadId
    );

    // Assert commentRepository was called exactly once
    expect(
      mockCommentRepository.checkCommentAvailability
    ).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.checkCommentAvailability).toHaveBeenCalledWith(
      useCaseParams.commentId,
      useCaseParams.threadId
    );

    // Assert replyRepository.addReply was called exactly once
    expect(mockReplyRepository.addReply).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(
      owner,
      useCaseParams.commentId,
      new AddReply(useCasePayload)
    );
  });
});
