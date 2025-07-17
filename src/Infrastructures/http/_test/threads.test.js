const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
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
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should respond 201 and return added thread', async () => {
      // Arrange
      const payload = {
        title: 'Thread Title',
        body: 'This is the content of the thread',
      };

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(payload.title);
    });

    it('should respond 400 when missing required property', async () => {
      // Arrange
      const payload = {
        title: 'Thread without body',
      };

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'
      );
    });

    it('should respond 400 when property has invalid data type', async () => {
      // Arrange
      const payload = {
        title: 123,
        body: 'Invalid title type',
      };

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena tipe data tidak sesuai'
      );
    });

    it('should respond 401 when no access token is provided', async () => {
      // Arrange
      const payload = {
        title: 'No token thread',
        body: 'Should be unauthorized',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should respond 200 and return thread detail with comments & replies', async () => {
      // Arrange: buat user + login
      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      // Buat thread
      const threadRes = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'My Thread', body: 'Thread body' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const threadId = JSON.parse(threadRes.payload).data.addedThread.id;

      // Buat komentar
      const commentRes = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'First comment' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const commentId = JSON.parse(commentRes.payload).data.addedComment.id;

      // Buat balasan
      const replyRes = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: { content: 'Reply to comment' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const replyId = JSON.parse(replyRes.payload).data.addedReply.id;

      // Action: ambil detail
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toMatchObject({
        id: threadId,
        title: 'My Thread',
        body: 'Thread body',
        username: expect.any(String),
        comments: [
          {
            id: commentId,
            username: expect.any(String),
            date: expect.any(String),
            content: expect.any(String),
            replies: [
              {
                id: replyId,
                username: expect.any(String),
                date: expect.any(String),
                content: expect.any(String),
              },
            ],
          },
        ],
      });
    });

    it('should respond 404 when thread does not exist', async () => {
      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/nonexistent-thread',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});
