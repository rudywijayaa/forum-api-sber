const DetailThreadUseCase = require('../DetailThreadUseCase');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('DetailThreadUseCase', () => {
  const threadId = 'thread-123';

  const mockThread = {
    id: threadId,
    title: 'Judul Thread',
    body: 'Isi Thread',
    date: '2025-06-09T00:00:00Z',
    username: 'johndoe',
  };
  const mockComments = [
    {
      id: 'comment-2',
      username: 'alice',
      date: '2025-06-10T00:00:00Z',
      content: 'X',
      is_delete: true,
    },
    {
      id: 'comment-1',
      username: 'bob',
      date: '2025-06-09T12:00:00Z',
      content: 'Y',
      is_delete: false,
    },
  ];
  const mockReplies = [
    {
      id: 'reply-1',
      comment_id: 'comment-1',
      username: 'charlie',
      date: '2025-06-10T01:00:00Z',
      content: 'A',
      is_delete: false,
    },
    {
      id: 'reply-2',
      comment_id: 'comment-1',
      username: 'daniel',
      date: '2025-06-10T02:00:00Z',
      content: 'B',
      is_delete: true,
    },
  ];

  const expectedComments = [
    {
      id: 'comment-1',
      username: 'bob',
      date: '2025-06-09T12:00:00Z',
      content: 'Y',
      replies: [
        {
          id: 'reply-1',
          username: 'charlie',
          date: '2025-06-10T01:00:00Z',
          content: 'A',
        },
        {
          id: 'reply-2',
          username: 'daniel',
          date: '2025-06-10T02:00:00Z',
          content: '**balasan telah dihapus**',
        },
      ],
    },
    {
      id: 'comment-2',
      username: 'alice',
      date: '2025-06-10T00:00:00Z',
      content: '**komentar telah dihapus**',
      replies: [],
    },
  ];

  it('should return thread detail with all fields and sorted comments & replies', async () => {
    // Arrange
    const mockThreadRepo = {
      getThreadById: jest.fn().mockResolvedValue(mockThread),
    };
    const mockCommentRepo = {
      getCommentsByThreadId: jest.fn().mockResolvedValue(mockComments),
    };
    const mockReplyRepo = {
      getRepliesByThreadId: jest.fn().mockResolvedValue(mockReplies),
    };

    const useCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepo,
      commentRepository: mockCommentRepo,
      replyRepository: mockReplyRepo,
    });

    // Act
    const result = await useCase.execute(threadId);

    // Assert: semua repos telah dipanggil sekali dengan argumen benar
    expect(mockThreadRepo.getThreadById).toHaveBeenCalledTimes(1);
    expect(mockThreadRepo.getThreadById).toHaveBeenCalledWith(threadId);

    expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledTimes(1);
    expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledWith(
      threadId
    );

    expect(mockReplyRepo.getRepliesByThreadId).toHaveBeenCalledTimes(1);
    expect(mockReplyRepo.getRepliesByThreadId).toHaveBeenCalledWith(threadId);

    // Assert hasil transformasi
    expect(result).toEqual({
      ...mockThread,
      comments: expectedComments,
    });
  });

  it('should bubble up NotFoundError when thread does not exist', async () => {
    // Arrange
    const mockThreadRepo = {
      getThreadById: jest
        .fn()
        .mockRejectedValue(new NotFoundError('thread tidak ditemukan')),
    };
    const mockCommentRepo = {
      getCommentsByThreadId: jest.fn(),
    };
    const mockReplyRepo = {
      getRepliesByThreadId: jest.fn(),
    };

    const useCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepo,
      commentRepository: mockCommentRepo,
      replyRepository: mockReplyRepo,
    });

    // Act & Assert
    await expect(useCase.execute(threadId)).rejects.toThrowError(
      'thread tidak ditemukan'
    );

    // Hanya threadRepo yang dipanggil, comment & reply tidak
    expect(mockThreadRepo.getThreadById).toHaveBeenCalledTimes(1);
    expect(mockThreadRepo.getThreadById).toHaveBeenCalledWith(threadId);

    expect(mockCommentRepo.getCommentsByThreadId).not.toHaveBeenCalled();
    expect(mockReplyRepo.getRepliesByThreadId).not.toHaveBeenCalled();
  });
});
