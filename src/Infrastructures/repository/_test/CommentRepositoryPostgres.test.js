const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  const userId = 'user-123';
  const threadId = 'thread-123';
  const commentId = 'comment-123';

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: userId, username: 'johndoe' });
    await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment', () => {
    it('should persist comment and return added comment correctly', async () => {
      const repo = new CommentRepositoryPostgres(pool);
      const added = await repo.addComment(userId, threadId, {
        content: 'a comment',
      });

      // Assert return value
      expect(added).toBeInstanceOf(AddedComment);
      expect(added).toStrictEqual(
        new AddedComment({ id: added.id, content: 'a comment', owner: userId })
      );

      // Assert persisted row
      const [row] = await CommentsTableTestHelper.findCommentById(added.id);
      expect(row.content).toBe('a comment');
      expect(row.owner).toBe(userId);
      expect(row.thread_id).toBe(threadId);
      expect(row.is_delete).toBe(false);
      // Assert date property exists
      expect(row.date).toBeTruthy();
    });
  });

  describe('deleteCommentById', () => {
    it('should soft delete comment and not throw NotFoundError', async () => {
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: 'to delete',
        date: '2025-06-05T00:00:00.000Z',
        thread_id: threadId,
        owner: userId,
      });

      const repo = new CommentRepositoryPostgres(pool);
      // Assert no NotFoundError
      await expect(repo.deleteCommentById(commentId)).resolves.not.toThrowError(
        NotFoundError
      );

      const [row] = await CommentsTableTestHelper.findCommentById(commentId);
      expect(row.is_delete).toBe(true);
    });
  });

  describe('checkCommentAvailability', () => {
    it('should resolve if comment exists and not deleted', async () => {
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: 'exists',
        date: '2025-06-05T00:00:00.000Z',
        thread_id: threadId,
        owner: userId,
      });
      const repo = new CommentRepositoryPostgres(pool);
      // Assert no NotFoundError
      await expect(
        repo.checkCommentAvailability(commentId, threadId)
      ).resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError if comment does not exist', async () => {
      const repo = new CommentRepositoryPostgres(pool);
      await expect(
        repo.checkCommentAvailability('nonexistent', threadId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if comment is deleted', async () => {
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: 'deleted',
        date: '2025-06-05T00:00:00.000Z',
        thread_id: threadId,
        owner: userId,
        is_delete: true,
      });
      const repo = new CommentRepositoryPostgres(pool);
      await expect(
        repo.checkCommentAvailability(commentId, threadId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if threadId mismatches', async () => {
      const wrongThread = 'thread-456';
      await UsersTableTestHelper.addUser({ id: 'user-456' });
      await ThreadsTableTestHelper.addThread({
        id: wrongThread,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: 'wrong thread',
        date: '2025-06-05T00:00:00.000Z',
        thread_id: wrongThread,
        owner: userId,
      });
      const repo = new CommentRepositoryPostgres(pool);
      await expect(
        repo.checkCommentAvailability(commentId, threadId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('verifyCommentOwner', () => {
    it('should resolve if owner matches', async () => {
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: 'owner',
        date: '2025-06-05T00:00:00.000Z',
        thread_id: threadId,
        owner: userId,
      });
      const repo = new CommentRepositoryPostgres(pool);
      // Assert no AuthorizationError or NotFoundError
      await expect(
        repo.verifyCommentOwner(commentId, userId)
      ).resolves.not.toThrowError(AuthorizationError);
    });

    it('should throw AuthorizationError if owner mismatches', async () => {
      const otherUser = 'user-999';
      await UsersTableTestHelper.addUser({ id: otherUser });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: 'owner',
        date: '2025-06-05T00:00:00.000Z',
        thread_id: threadId,
        owner: userId,
      });
      const repo = new CommentRepositoryPostgres(pool);
      await expect(
        repo.verifyCommentOwner(commentId, otherUser)
      ).rejects.toThrow(AuthorizationError);
    });

    it('should throw NotFoundError if comment not exist', async () => {
      const repo = new CommentRepositoryPostgres(pool);
      await expect(
        repo.verifyCommentOwner('nonexistent', userId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return comments with full fields and correct order', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'alice' });
      await UsersTableTestHelper.addUser({ id: 'user-2', username: 'bob' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-1',
        owner: 'user-1',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        content: 'first',
        date: '2025-06-01T00:00:00.000Z',
        thread_id: 'thread-1',
        owner: 'user-1',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        content: 'second',
        date: '2025-06-02T00:00:00.000Z',
        thread_id: 'thread-1',
        owner: 'user-2',
        is_delete: true,
      });

      const repo = new CommentRepositoryPostgres(pool);
      const comments = await repo.getCommentsByThreadId('thread-1');

      expect(comments).toHaveLength(2);
      expect(comments[0]).toMatchObject({
        id: 'comment-1',
        username: 'alice',
        content: 'first',
        is_delete: false,
      });
      // Assert date exists
      expect(comments[0].date).toBeTruthy();

      expect(comments[1]).toMatchObject({
        id: 'comment-2',
        username: 'bob',
        content: 'second',
        is_delete: true,
      });
      expect(comments[1].date).toBeTruthy();
    });

    it('should return empty array when no comments', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'alice' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-1',
        owner: 'user-1',
      });
      const repo = new CommentRepositoryPostgres(pool);
      const comments = await repo.getCommentsByThreadId('thread-1');
      expect(comments).toEqual([]);
    });
  });
});
