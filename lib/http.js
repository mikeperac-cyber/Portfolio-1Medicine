const { createHash } = require('node:crypto');
const helmet = require('helmet');
const compression = require('compression');

const security = helmet({
  contentSecurityPolicy: { directives: {
    'script-src': ["'self'"], 'script-src-attr': ["'none'"],
    'style-src': ["'self'", "'unsafe-inline'"], 'img-src': ["'self'", 'data:'],
    'connect-src': ["'self'"], 'object-src': ["'none'"], 'base-uri': ["'self'"],
    'form-action': ["'self'"], 'upgrade-insecure-requests': null,
  } },
  strictTransportSecurity: process.env.NODE_ENV === 'production' ? undefined : false,
});
const compress = compression({ threshold: 512 });
const middleware = (fn, req, res) => new Promise((resolve, reject) => fn(req, res, (error) => error ? reject(error) : resolve()));
const error = (status, message) => Object.assign(new Error(message), { status });

function send(req, res, status, body, type = 'application/json; charset=utf-8', cache = 'no-store') {
  const content = Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', cache);
  if (status === 200 && ['GET', 'HEAD'].includes(req.method) && cache !== 'no-store') {
    const etag = 'W/"' + createHash('sha256').update(content).digest('hex') + '"';
    res.setHeader('ETag', etag);
    const tags = (req.headers['if-none-match'] || '').split(',').map((tag) => tag.trim().replace(/^W\//, ''));
    if (tags.includes('*') || tags.includes(etag.slice(2))) { res.writeHead(304); res.end(); return; }
  }
  res.setHeader('Content-Length', content.length);
  res.writeHead(status);
  res.end(req.method === 'HEAD' ? undefined : content);
}

async function parseBody(req) {
  if (!(req.headers['content-type'] || '').match(/^application\/json(?:\s*;|$)/i)) throw error(415, 'Content-Type must be application/json');
  if (Number(req.headers['content-length']) > 32768) throw error(413, 'Request body is too large');
  // Vercel can pre-parse JSON before invoking a function handler.
  if (req.body !== undefined) {
    if (Buffer.byteLength(JSON.stringify(req.body)) > 32768) throw error(413, 'Request body is too large');
    return validateObject(req.body);
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 32768) throw error(413, 'Request body is too large');
    chunks.push(chunk);
  }
  let body;
  try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw error(400, 'Invalid JSON'); }
  return validateObject(body);
}
function validateObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw error(400, 'Expected a JSON object');
  return body;
}
function checkOrigin(req) {
  if (req.headers['sec-fetch-site'] === 'cross-site') throw error(403, 'Cross-site submissions are not allowed');
  const origin = req.headers.origin;
  if (origin) {
    let host;
    try { host = new URL(origin).host; } catch { throw error(403, 'Invalid origin'); }
    // On Vercel, Host is the deployment domain. Never trust client-supplied forwarded hosts.
    if (host !== req.headers.host) throw error(403, 'Cross-site submissions are not allowed');
  }
}
function textField(body, key, max, required = false) {
  if (body[key] === undefined && !required) return '';
  if (typeof body[key] !== 'string' || body[key].length > max || (required && !body[key].trim())) throw error(400, `Invalid ${key}`);
  return body[key].trim();
}
module.exports = { security, compress, middleware, send, error, parseBody, checkOrigin, textField };
