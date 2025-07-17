const ThreadRepository = require('../ThreadRepository');

describe('ThreadRepository interface', () => {
  let threadRepository;

  beforeEach(() => {
    threadRepository = new ThreadRepository();
  });

  it('should throw error when invoke addThread method', async () => {
    await expect(threadRepository.addThread({})).rejects.toThrowError(
      'THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
  });

  it('should throw error when invoke checkThreadAvailability method', async () => {
    await expect(
      threadRepository.checkThreadAvailability('thread-123')
    ).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke getDetailThread method', async () => {
    await expect(
      threadRepository.getDetailThread('thread-123')
    ).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
