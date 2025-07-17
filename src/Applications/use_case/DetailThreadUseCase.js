class DetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepo = threadRepository;
    this._commentRepo = commentRepository;
    this._replyRepo = replyRepository;
  }

  async execute(threadId) {
    const threadData = await this._threadRepo.getThreadById(threadId);
    const commentsRaw = await this._commentRepo.getCommentsByThreadId(threadId);
    const repliesRaw = await this._replyRepo.getRepliesByThreadId(threadId);

    const comments = commentsRaw
      .map((c) => {
        const replies = repliesRaw
          .filter((r) => r.comment_id === c.id)
          .map((r) => ({
            id: r.id,
            username: r.username,
            date: r.date,
            content: r.is_delete ? '**balasan telah dihapus**' : r.content,
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        return {
          id: c.id,
          username: c.username,
          date: c.date,
          content: c.is_delete ? '**komentar telah dihapus**' : c.content,
          replies,
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      id: threadData.id,
      title: threadData.title,
      body: threadData.body,
      date: threadData.date,
      username: threadData.username,
      comments,
    };
  }
}

module.exports = DetailThreadUseCase;
