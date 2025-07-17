const { nanoid } = require('nanoid');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('constructor', () => {
    it('should use nanoid as default idGenerator when none provided', () => {
      const repo = new ReplyRepositoryPostgres(pool);
      expect(repo._idGenerator).toBe(nanoid);
    });
  });

  describe('addReply', () => {
    it('should persist and return added reply correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        thread_id: 'thread-123',
        owner: 'user-123',
      });

      const addReply = new AddReply({ content: 'sebuah balasan' });
      const fakeId = () => '123';
      const repo = new ReplyRepositoryPostgres(pool, fakeId);

      const addedReply = await repo.addReply(
        'user-123',
        'comment-123',
        addReply
      );

      const rows = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(rows).toHaveLength(1);
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: 'sebuah balasan',
          owner: 'user-123',
        })
      );
    });
  });

  describe('checkReplyAvailability', () => {
    it('should throw NotFoundError if reply does not exist', async () => {
      const repo = new ReplyRepositoryPostgres(pool, {});
      await expect(
        repo.checkReplyAvailability('reply-xxx', 'comment-xxx')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if reply is soft-deleted', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        thread_id: 'thread-123',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'should be invalid',
        commentId: 'comment-123',
        owner: 'user-123',
        is_delete: true,
      });
      const repo = new ReplyRepositoryPostgres(pool, {});

      await expect(
        repo.checkReplyAvailability('reply-123', 'comment-123')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if reply does not belong to given comment', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        thread_id: 'thread-123',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'belongs elsewhere',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const repo = new ReplyRepositoryPostgres(pool, {});

      await expect(
        repo.checkReplyAvailability('reply-123', 'other-comment')
      ).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if reply exists and valid', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        thread_id: 'thread-123',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'valid reply',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const repo = new ReplyRepositoryPostgres(pool, {});

      await expect(
        repo.checkReplyAvailability('reply-123', 'comment-123')
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw NotFoundError if reply does not exist', async () => {
      const repo = new ReplyRepositoryPostgres(pool, {});
      await expect(
        repo.verifyReplyOwner('reply-xxx', 'user-123')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if user is not the owner', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        thread_id: 'thread-123',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'owner test',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const repo = new ReplyRepositoryPostgres(pool, {});

      await expect(
        repo.verifyReplyOwner('reply-123', 'user-other')
      ).rejects.toThrow(AuthorizationError);
    });

    it('should not throw NotFoundError and AuthorizationError if owner matches and reply exists', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        thread_id: 'thread-123',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'owner test',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const repo = new ReplyRepositoryPostgres(pool, {});

      await expect(
        repo.verifyReplyOwner('reply-123', 'user-123')
      ).resolves.not.toThrow(NotFoundError);
      await expect(
        repo.verifyReplyOwner('reply-123', 'user-123')
      ).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteReplyById', () => {
    it('should soft-delete reply and not throw NotFoundError', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        thread_id: 'thread-123',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'delete test',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const repo = new ReplyRepositoryPostgres(pool, {});

      await expect(repo.deleteReplyById('reply-123')).resolves.not.toThrow(
        NotFoundError
      );
      const rows = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(rows[0].is_delete).toBe(true);
    });
  });

  describe('getRepliesByThreadId', () => {
    it('should return replies for a thread with correct shape (POJO)', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        thread_id: 'thread-123',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'sebuah balasan',
        commentId: 'comment-123',
        owner: 'user-123',
        date: '2025-06-09T12:00:00.000Z',
      });

      const repo = new ReplyRepositoryPostgres(pool, {});
      const replies = await repo.getRepliesByThreadId('thread-123');

      expect(replies).toHaveLength(1);
      expect(replies[0]).toMatchObject({
        id: 'reply-123',
        content: 'sebuah balasan',
        username: 'dicoding',
        comment_id: 'comment-123',
        is_delete: false,
      });
      expect(typeof replies[0].date).toBe('string');
      expect(replies[0].date).toBeTruthy();
    });
  });

  describe('getRepliesByCommentId', () => {
    it('should return all replies for a comment with full fields and correct order', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'alice' });
      await UsersTableTestHelper.addUser({ id: 'user-2', username: 'bob' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-1',
        owner: 'user-1',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        thread_id: 'thread-1',
        owner: 'user-1',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-1',
        content: 'first',
        commentId: 'comment-1',
        owner: 'user-1',
        date: '2025-06-01T00:00:00.000Z',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-2',
        content: 'second',
        commentId: 'comment-1',
        owner: 'user-2',
        date: '2025-06-02T00:00:00.000Z',
        is_delete: true,
      });

      const repo = new ReplyRepositoryPostgres(pool, {});
      const replies = await repo.getRepliesByCommentId('comment-1');

      expect(replies).toHaveLength(2);
      expect(replies[0]).toMatchObject({
        id: 'reply-1',
        content: 'first',
        username: 'alice',
        comment_id: 'comment-1',
        is_delete: false,
      });
      expect(typeof replies[0].date).toBe('string');
      expect(replies[0].date).toBeTruthy();

      expect(replies[1]).toMatchObject({
        id: 'reply-2',
        content: 'second',
        username: 'bob',
        comment_id: 'comment-1',
        is_delete: true,
      });
      expect(typeof replies[1].date).toBe('string');
      expect(replies[1].date).toBeTruthy();
    });

    it('should return empty array if no replies', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'alice' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-1',
        owner: 'user-1',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        thread_id: 'thread-1',
        owner: 'user-1',
      });
      const repo = new ReplyRepositoryPostgres(pool, {});
      const replies = await repo.getRepliesByCommentId('comment-1');
      expect(replies).toEqual([]);
    });
  });
});
