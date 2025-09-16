import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/index.js';

function listen(app) {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
  });
}

test('health endpoint returns ok', async (t) => {
  process.env.NODE_ENV = 'test';
  const { server, url } = await listen(app);
  t.after(() => server.close());

  const res = await fetch(`${url}/api/health`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.status, 'ok');
  assert.ok(typeof json.uptime === 'number');
});
