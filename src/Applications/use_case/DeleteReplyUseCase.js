// src/Applications/use_case/DeleteReplyUseCase.js
class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(owner, { threadId, commentId, replyId }) {
    // Pastikan thread, comment, dan reply tersedia
    await this._threadRepository.checkThreadAvailability(threadId);
    await this._commentRepository.checkCommentAvailability(commentId, threadId);
    await this._replyRepository.checkReplyAvailability(replyId, commentId);

    // Verifikasi kepemilikan reply
    await this._replyRepository.verifyReplyOwner(replyId, owner);

    // Hapus reply
    await this._replyRepository.deleteReplyById(replyId);

    // KEMBALIAN SUKSES
    return { status: 'success' };
  }
}

module.exports = DeleteReplyUseCase;
