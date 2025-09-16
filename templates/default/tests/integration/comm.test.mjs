import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../../server/src/index.js';

function listen(app) {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
  });
}

// This test simulates client->server communication by performing an HTTP fetch
// to the server's /api/health endpoint via an in-memory server instance.
// It does not require the Next.js dev server to run.

test('client-server communication: /api/health responds', async (t) => {
  process.env.NODE_ENV = 'test';
  const { server, url } = await listen(app);
  t.after(() => server.close());

  const res = await fetch(`${url}/api/health`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.status, 'ok');
  assert.ok(typeof json.uptime === 'number');
});
