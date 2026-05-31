// Lightweight DOMPurify stub used ONLY in Jest tests.
// The real isomorphic-dompurify loads jsdom, which pulls in ESM-only deps
// (@exodus/bytes) that Jest cannot parse. Production code is unaffected.
const DOMPurify = {
  sanitize: (dirty = '') => {
    if (typeof dirty !== 'string') return '';
    return dirty
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/ on\w+="[^"]*"/gi, '');
  },
};
module.exports = DOMPurify;
module.exports.default = DOMPurify;
