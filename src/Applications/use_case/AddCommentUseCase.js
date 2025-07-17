// src/Applications/use_case/AddCommentUseCase.js

const AddComment = require('../../Domains/comments/entities/AddComment');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  /**
   * @param {{ owner: string, threadId: string, content: string }} param0
   */
  async execute({ owner, threadId, content }) {
    // Pastikan thread tersedia
    await this._threadRepository.checkThreadAvailability(threadId);

    // Buat entitas komentar (akan validasi content)
    const addComment = new AddComment({ content });

    // Simpan komentar, dapatkan plain object { id, content, owner }
    const addedCommentData = await this._commentRepository.addComment(
      owner,
      threadId,
      addComment
    );

    // Bungkus ke dalam entity AddedComment sebelum return
    return new AddedComment(addedCommentData);
  }
}

module.exports = AddCommentUseCase;
