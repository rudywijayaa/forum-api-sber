const AddThreadUseCase = require('../AddThreadUseCase');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Thread title',
      body: 'This is the thread body',
    };
    const owner = 'user-123';

    const mockReturnThread = {
      id: 'thread-123',
      title: 'Thread title',
      owner,
    };

    // Mocking dependencies
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = jest.fn(() =>
      Promise.resolve(new AddedThread(mockReturnThread))
    );

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Act
    const result = await addThreadUseCase.execute(owner, useCasePayload);

    // Assert: return value
    expect(result).toBeInstanceOf(AddedThread);
    expect(result).toEqual(new AddedThread(mockReturnThread));

    // Assert: repository interaction
    expect(mockThreadRepository.addThread).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      owner,
      new AddThread(useCasePayload)
    );
  });
});
