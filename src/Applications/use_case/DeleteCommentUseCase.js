class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(owner, { threadId, commentId }) {
    // Pastikan thread tersedia
    await this._threadRepository.checkThreadAvailability(threadId);

    // Pastikan komentar tersedia di thread itu
    await this._commentRepository.checkCommentAvailability(commentId, threadId);

    // Verifikasi kepemilikan komentar
    await this._commentRepository.verifyCommentOwner(commentId, owner);

    // Soft delete komentar
    await this._commentRepository.deleteCommentById(commentId);

    // Kembalikan status sukses
    return { status: 'success' };
  }
}

module.exports = DeleteCommentUseCase;
