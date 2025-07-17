// src/Interfaces/http/api/comments/handler.js

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  /**
   * Handler untuk menambahkan komentar pada thread
   */
  async postCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;
    const { content } = request.payload;
    const addCommentUseCase = this._container.getInstance('AddCommentUseCase');

    // Jalankan use case dengan payload yang sesuai
    const addedComment = await addCommentUseCase.execute({
      owner,
      threadId,
      content,
    });

    return h
      .response({
        status: 'success',
        data: { addedComment },
      })
      .code(201);
  }

  /**
   * Handler untuk menghapus komentar pada thread
   */
  async deleteCommentHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;
    const deleteCommentUseCase = this._container.getInstance(
      'DeleteCommentUseCase'
    );

    await deleteCommentUseCase.execute(owner, { threadId, commentId });

    return h
      .response({
        status: 'success',
      })
      .code(200);
  }
}

module.exports = CommentsHandler;
