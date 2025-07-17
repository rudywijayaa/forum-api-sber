const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(owner, params, payload) {
    const { threadId, commentId } = params;

    // Pastikan thread dan comment tersedia
    await this._threadRepository.checkThreadAvailability(threadId);
    await this._commentRepository.checkCommentAvailability(commentId, threadId);

    const newReply = new AddReply(payload);
    return this._replyRepository.addReply(owner, commentId, newReply);
  }
}

module.exports = AddReplyUseCase;
