class RepliesHandler {
  constructor(container) {
    this._container = container;
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { content } = request.payload;
    const { id: owner } = request.auth.credentials;

    const addReplyUseCase = this._container.getInstance('AddReplyUseCase');
    const addedReply = await addReplyUseCase.execute(
      owner,
      { threadId, commentId },
      { content }
    );

    return h
      .response({
        status: 'success',
        data: { addedReply },
      })
      .code(201);
  }

  async deleteReplyHandler(request, h) {
    const { threadId, commentId, replyId } = request.params;
    const { id: owner } = request.auth.credentials;

    const deleteReplyUseCase =
      this._container.getInstance('DeleteReplyUseCase');
    await deleteReplyUseCase.execute(owner, { threadId, commentId, replyId });

    return h.response({ status: 'success' }).code(200);
  }
}

module.exports = RepliesHandler;
