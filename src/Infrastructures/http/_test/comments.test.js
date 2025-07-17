// src/Infrastructures/http/_test/comments.test.js
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const createServer = require('../createServer');
const container = require('../../container');

describe('/threads/{threadId}/comments endpoint', () => {
  let server;
  let serverTestHelper;

  const threadPayload = {
    id: 'thread-001',
    title: 'Thread Example',
    body: 'This is a thread',
    date: new Date().toISOString(),
  };

  beforeAll(async () => {
    server = await createServer(container);
    serverTestHelper = new ServerTestHelper(server);
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('POST /threads/{threadId}/comments', () => {
    it('should respond 201 and return added comment correctly', async () => {
      // Arrange
      const commentPayload = { content: 'This is a comment' };
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({
        ...threadPayload,
        owner: userId,
      });

      // Act
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(
        commentPayload.content
      );
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.owner).toEqual(userId);
    });

    it('should respond 400 when payload is missing required property', async () => {
      // Arrange
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({
        ...threadPayload,
        owner: userId,
      });

      // Act
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: {}, // missing content
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBeTruthy();
      expect(responseJson.message).toEqual(
        'tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada'
      );
    });

    it('should respond 400 when content is not a string', async () => {
      // Arrange
      const invalidPayload = { content: 999 };
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({
        ...threadPayload,
        owner: userId,
      });

      // Act
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: invalidPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBeTruthy();
      expect(responseJson.message).toEqual(
        'tidak dapat membuat comment baru karena tipe data tidak sesuai'
      );
    });

    it('should respond 404 if thread not found', async () => {
      // Arrange
      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();
      const fakeThreadId = 'thread-not-exist';

      // Act
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${fakeThreadId}/comments`,
        payload: { content: 'some content' },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBeTruthy();
    });

    it('should respond 401 if access token is not provided', async () => {
      // Arrange
      const { userId } = await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({
        ...threadPayload,
        owner: userId,
      });

      // Act
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: { content: 'unauthenticated comment' },
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
    const commentPayload = {
      id: 'comment-001',
      content: 'A comment to delete',
      threadId: threadPayload.id,
      owner: null,
    };

    it('should respond 200 and success when deletion is valid', async () => {
      // Arrange
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      commentPayload.owner = userId;
      await ThreadsTableTestHelper.addThread({
        ...threadPayload,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentPayload.id,
        content: commentPayload.content,
        thread_id: commentPayload.threadId,
        owner: commentPayload.owner,
      });

      // Act
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const resJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(resJson.status).toBe('success');
    });

    it('should respond 404 if comment does not exist', async () => {
      // Arrange
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({
        ...threadPayload,
        owner: userId,
      });

      // Act
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/non-existent-comment`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const resJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(resJson.status).toBe('fail');
      expect(resJson.message).toBeTruthy();
    });

    it('should respond 404 if thread does not exist', async () => {
      // Arrange
      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      // Act
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/non-existent-thread/comments/${commentPayload.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const resJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(resJson.status).toBe('fail');
      expect(resJson.message).toBeTruthy();
    });

    it('should respond 403 if user is not comment owner', async () => {
      // Arrange
      const { userId: ownerId } =
        await serverTestHelper.getAccessTokenAndUserId();
      const { accessToken: otherToken } =
        await serverTestHelper.getAccessTokenAndUserId({
          username: 'other',
          password: 'pass',
          fullname: 'Other User',
        });
      await ThreadsTableTestHelper.addThread({
        ...threadPayload,
        owner: ownerId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentPayload.id,
        content: commentPayload.content,
        thread_id: threadPayload.id,
        owner: ownerId,
      });

      // Act
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}`,
        headers: { Authorization: `Bearer ${otherToken}` },
      });

      // Assert
      expect(response.statusCode).toEqual(403);
    });

    it('should respond 401 when no access token provided', async () => {
      // Arrange
      const { userId } = await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({
        ...threadPayload,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentPayload.id,
        content: commentPayload.content,
        thread_id: threadPayload.id,
        owner: userId,
      });

      // Act
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}`,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });
});
