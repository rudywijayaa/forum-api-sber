class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { title, body } = request.payload;

    const addThreadUseCase = this._container.getInstance('AddThreadUseCase');
    const addedThread = await addThreadUseCase.execute(owner, { title, body });

    return h
      .response({
        status: 'success',
        data: { addedThread },
      })
      .code(201);
  }

  async getThreadHandler(request, h) {
    const { threadId } = request.params;

    const detailThreadUseCase = this._container.getInstance(
      'DetailThreadUseCase'
    );
    const thread = await detailThreadUseCase.execute(threadId);

    return h
      .response({
        status: 'success',
        data: { thread },
      })
      .code(200);
  }
}

module.exports = ThreadsHandler;
