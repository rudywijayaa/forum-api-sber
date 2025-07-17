// src/Applications/use_case/AddThreadUseCase.js
const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  /**
   * Menjalankan proses penambahan thread baru
   * @param {string} owner - ID user pemilik thread
   * @param {object} payload - data thread ({ title, body })
   * @returns {AddedThread} - entitas thread yang baru ditambahkan
   */
  async execute(owner, payload) {
    // Validasi payload
    const addThreadEntity = new AddThread(payload);
    // Simpan thread dan kembalikan entitasnya
    const addedThread = await this._threadRepository.addThread(
      owner,
      addThreadEntity
    );
    return addedThread;
  }
}

module.exports = AddThreadUseCase;
