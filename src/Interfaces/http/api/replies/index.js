const RepliesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'replies',
  register: async (server, { container }) => {
    const handler = new RepliesHandler(container);
    server.route(routes(handler));
  },
};
