const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('Replies endpoint', () => {
  let server;
  let serverTestHelper;

  beforeAll(async () => {
    server = await createServer(container);
    serverTestHelper = new ServerTestHelper(server);
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  const dummyThread = {
    id: 'thread-123',
    title: 'A New Thread',
    body: 'Thread body',
    date: new Date().toISOString(),
  };

  const dummyComment = {
    id: 'comment-123',
    content: 'A comment',
    date: new Date().toISOString(),
    threadId: dummyThread.id,
  };

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and added reply', async () => {
      // Arrange
      const requestPayload = { content: 'A reply' };
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply.content).toEqual(
        requestPayload.content
      );
      expect(responseJson.data.addedReply.owner).toEqual(userId);
    });

    it('should response 400 if payload not contain needed property', async () => {
      // Arrange
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies`,
        payload: {},
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada'
      );
    });

    it('should response 400 if payload wrong data type', async () => {
      // Arrange
      const requestPayload = { content: 4567 };
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('balasan harus berupa string');
    });

    it('should response 404 if replied comment is not exist in thread', async () => {
      // Arrange
      const requestPayload = { content: 'A reply' };
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });
      await ThreadsTableTestHelper.addThread({
        ...dummyThread,
        id: 'other-thread',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/other-thread/comments/${dummyComment.id}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'komentar dalam thread tidak ditemukan'
      );
    });

    it('should response 404 if comment is not exist', async () => {
      // Arrange
      const requestPayload = { content: 'A reply' };
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${dummyThread.id}/comments/comment-789/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 404 if comment is not valid or deleted', async () => {
      // Arrange
      const requestPayload = { content: 'A reply' };
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });
      await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak valid');
    });

    it('should response 401 if headers not contain access token', async () => {
      // Arrange
      const requestPayload = { content: 'A reply' };
      const { userId } = await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies`,
        payload: requestPayload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    const dummyReply = {
      id: 'reply-123',
      content: 'A new reply',
      date: new Date().toISOString(),
      commentId: dummyComment.id,
    };

    it('should response 200', async () => {
      // Arrange
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({ ...dummyReply, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 if reply is not exist', async () => {
      // Arrange
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/non-reply`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Reply tidak ditemukan');
    });

    it('should response 404 if reply is not valid or deleted', async () => {
      // Arrange
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({ ...dummyReply, owner: userId });
      await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('balasan tidak valid');
    });

    it('should response 404 if comment is not exist', async () => {
      // Arrange
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/non-comment/replies/reply-123`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 404 if comment is not valid or deleted', async () => {
      // Arrange
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({ ...dummyReply, owner: userId });
      await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak valid');
    });

    it('should response 404 if replied comment is not exist in thread', async () => {
      // Arrange
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({ ...dummyReply, owner: userId });
      await ThreadsTableTestHelper.addThread({
        ...dummyThread,
        id: 'other-thread',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/other-thread/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'komentar dalam thread tidak ditemukan'
      );
    });

    it('should response 403 if reply owner is not authorized', async () => {
      // Arrange
      const { userId } = await serverTestHelper.getAccessTokenAndUserId();
      const { accessToken: otherAccessToken } =
        await serverTestHelper.getAccessTokenAndUserId({
          username: 'otheruser',
          password: 'pass',
          fullname: 'Other U.',
        });
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({ ...dummyReply, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: { Authorization: `Bearer ${otherAccessToken}` },
      });

      // Assert
      expect(response.statusCode).toEqual(403);
    });

    it('should response 401 if headers not contain access token', async () => {
      // Arrange
      const { userId } = await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({ ...dummyReply, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });
});
