const InvariantError = require('./InvariantError');
const NotFoundError = require('./NotFoundError');
const AuthorizationError = require('./AuthorizationError');

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  // Users
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'
  ),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'tidak dapat membuat user baru karena tipe data tidak sesuai'
  ),
  'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError(
    'tidak dapat membuat user baru karena karakter username melebihi batas limit'
  ),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError(
    'tidak dapat membuat user baru karena username mengandung karakter terlarang'
  ),

  // Authentication
  'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'harus mengirimkan username dan password'
  ),
  'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'username dan password harus string'
  ),
  'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN':
    new InvariantError('harus mengirimkan token refresh'),
  'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION':
    new InvariantError('refresh token harus string'),
  'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN':
    new InvariantError('harus mengirimkan token refresh'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION':
    new InvariantError('refresh token harus string'),

  // Threads
  'ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'
  ),
  'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'tidak dapat membuat thread baru karena tipe data tidak sesuai'
  ),
  'thread tidak ditemukan': new NotFoundError('thread tidak ditemukan'),

  // Comments
  'ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada'
  ),
  'ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'tidak dapat membuat comment baru karena tipe data tidak sesuai'
  ),
  'DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'tidak dapat menghapus comment karena properti yang dibutuhkan tidak ada'
  ),
  'DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'tidak dapat menghapus comment karena tipe data tidak sesuai'
  ),
  // Availability & validation errors from CommentRepositoryPostgres
  'Komentar tidak ditemukan': new NotFoundError('komentar tidak ditemukan'),
  'Komentar telah dihapus': new NotFoundError('komentar tidak valid'),
  'Komentar tidak ditemukan pada thread ini': new NotFoundError(
    'komentar dalam thread tidak ditemukan'
  ),
  'Anda tidak berhak mengakses komentar ini': new AuthorizationError(
    'Anda tidak berhak mengakses komentar ini'
  ),

  // Replies
  'ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada'
  ),
  'ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'balasan harus berupa string'
  ),
  'DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'tidak dapat menghapus reply karena properti yang dibutuhkan tidak ada'
  ),
  'DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'tidak dapat menghapus reply karena tipe data tidak sesuai'
  ),
  // Availability & validation errors from ReplyRepositoryPostgres
  'Reply tidak ditemukan': new NotFoundError('Reply tidak ditemukan'),
  'balasan tidak valid': new NotFoundError('balasan tidak valid'),
  'Anda tidak berhak mengakses resource ini': new AuthorizationError(
    'Anda tidak berhak mengakses resource ini'
  ),

  // Fallback for unimplemented repository methods
  'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED': new Error('Internal Server Error'),
};

module.exports = DomainErrorTranslator;
