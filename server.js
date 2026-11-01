// Vercel entrypoint. The Express app lives in backend/server.js so the
// existing local development workflow (`npm --prefix backend run dev`) still works.
module.exports = require('./backend/server')
