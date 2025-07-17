const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
    });

    it('should persist new thread to database and return added thread', async () => {
      const addThread = new AddThread({ title: 'Thread title', body: 'Body' });
      const fakeId = () => '123';
      const repo = new ThreadRepositoryPostgres(pool, fakeId);

      // Act
      const added = await repo.addThread('user-123', addThread);
      const threads = await ThreadsTableTestHelper.findThreadsById(
        'thread-123'
      );

      // Assert
      expect(threads).toHaveLength(1);
      expect(added).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'Thread title',
          owner: 'user-123',
        })
      );
    });
  });

  describe('checkThreadAvailability', () => {
    it('should throw NotFoundError with correct message if thread not exist', async () => {
      const repo = new ThreadRepositoryPostgres(pool, () => {});
      await expect(
        repo.checkThreadAvailability('thread-xxx')
      ).rejects.toThrowError(new NotFoundError('thread tidak ditemukan'));
    });

    it('should resolve without error if thread exists', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });

      const repo = new ThreadRepositoryPostgres(pool, () => {});
      await expect(
        repo.checkThreadAvailability('thread-123')
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById', () => {
    it('should throw NotFoundError with correct message if thread not exist', async () => {
      const repo = new ThreadRepositoryPostgres(pool, () => {});
      await expect(repo.getThreadById('thread-xxx')).rejects.toThrowError(
        new NotFoundError('thread tidak ditemukan')
      );
    });

    it('should return raw thread row correctly with all properties', async () => {
      const dateString = '2025-06-10T00:00:00.000Z';
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'ti',
        body: 'bo',
        owner: 'user-123',
        date: dateString,
      });
      const repo = new ThreadRepositoryPostgres(pool, () => {});
      const thread = await repo.getThreadById('thread-123');

      expect(thread).toMatchObject({
        id: 'thread-123',
        title: 'ti',
        body: 'bo',
        username: 'dicoding',
      });
      // Assert date property exists
      expect(thread.date).toBeTruthy();
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return empty array when no comments', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      const repo = new ThreadRepositoryPostgres(pool, () => {});
      const comments = await repo.getCommentsByThreadId('thread-123');
      expect(comments).toEqual([]);
    });

    it('should return comments raw with all fields and preserve order', async () => {
      const date1String = '2025-06-01T00:00:00.000Z';
      const date2String = '2025-06-02T00:00:00.000Z';
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'alice' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-1',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        thread_id: 'thread-123',
        owner: 'user-1',
        date: date1String,
        content: 'normal comment',
        is_delete: false,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        thread_id: 'thread-123',
        owner: 'user-1',
        date: date2String,
        content: 'deleted comment',
        is_delete: true,
      });

      const repo = new ThreadRepositoryPostgres(pool, () => {});
      const comments = await repo.getCommentsByThreadId('thread-123');

      expect(comments).toHaveLength(2);
      expect(comments[0]).toMatchObject({
        id: 'comment-1',
        username: 'alice',
        content: 'normal comment',
        is_delete: false,
      });
      // Assert date property exists
      expect(comments[0].date).toBeTruthy();

      expect(comments[1]).toMatchObject({
        id: 'comment-2',
        username: 'alice',
        content: 'deleted comment',
        is_delete: true,
      });
      expect(comments[1].date).toBeTruthy();
    });
  });
});
