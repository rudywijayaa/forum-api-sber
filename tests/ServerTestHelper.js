/* istanbul ignore file */
class ServerTestHelper {
  constructor(server) {
    this._server = server;
  }

  async getAccessTokenAndUserId(
    payload = {
      username: 'test',
      password: 'secret',
      fullname: 'Test User',
    }
  ) {
    // register user
    const registerResponse = await this._server.inject({
      method: 'POST',
      url: '/users',
      payload,
    });

    // login to get token
    const loginResponse = await this._server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: payload.username,
        password: payload.password,
      },
    });

    return {
      userId: JSON.parse(registerResponse.payload).data.addedUser.id,
      accessToken: JSON.parse(loginResponse.payload).data.accessToken,
    };
  }
}

module.exports = ServerTestHelper;
