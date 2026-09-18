const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const server = spawn('java', ['HealthWebService'], { env: { ...process.env, PORT: '3458' }, stdio: 'inherit' });
async function run() {
  try {
    let ready = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      try { if ((await fetch('http://localhost:3458/')).ok) { ready = true; break; } } catch { /* startup */ }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert(ready, 'Java server started');
    const page = await fetch('http://localhost:3458/', { headers: { 'Accept-Encoding': 'gzip' } });
    assert.equal(page.headers.get('content-encoding'), 'gzip');
    assert((await page.text()).includes('HealthBridge'));
    const topics = await fetch('http://localhost:3458/api/topics');
    assert.equal((await topics.json()).length, 5);
    assert.equal((await fetch('http://localhost:3458/api/topics', { headers: { 'If-None-Match': topics.headers.get('etag') } })).status, 304);
    for (const url of ['/server.js', '/.env.local', '/api/missing', '/%2e%2e%5cserver.js']) assert.equal((await fetch('http://localhost:3458' + url)).status, 404);
    assert.equal((await fetch('http://localhost:3458/', { method: 'HEAD' })).status, 200);
    console.log('Java compression, caching, methods, and file isolation passed.');
  } finally { server.kill(); }
}
server.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
run().catch((error) => { console.error(error); process.exitCode = 1; });
