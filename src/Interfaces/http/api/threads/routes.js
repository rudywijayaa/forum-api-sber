// src/Interfaces/http/api/threads/routes.js

const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: { auth: 'forum_jwt' },
  },
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.getThreadHandler,
    options: { auth: false },
  },
];

module.exports = routes;
