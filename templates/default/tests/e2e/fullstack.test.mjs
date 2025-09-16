import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import http from 'node:http';

const ROOT = new URL('../..', import.meta.url).pathname.replace(/\/$/, '');
const SERVER_CWD = ROOT + '/server';
const CLIENT_CWD = ROOT + '/client';

async function waitForOk(url, { timeoutMs = 120_000, intervalMs = 500 } = {}) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < timeoutMs) {
    try {
      const ok = await new Promise((resolve) => {
        const req = http.get(url, (res) => {
          resolve(res.statusCode && res.statusCode >= 200 && res.statusCode < 300);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(5_000, () => {
          req.destroy(new Error('timeout'));
          resolve(false);
        });
      });
      if (ok) return true;
    } catch (e) {
      lastErr = e;
    }
    await delay(intervalMs);
  }
  throw new Error(`Timed out waiting for ${url} to be ready: ${lastErr || 'unknown error'}`);
}

function startServer() {
  // Start backend directly with node so we can kill it cleanly.
  const child = spawn(process.execPath, ['src/index.js'], {
    cwd: SERVER_CWD,
    env: { ...process.env, NODE_ENV: 'development' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return child;
}

function startClient() {
  // Start Next.js dev directly via its CLI entry point.
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--turbopack'], {
    cwd: CLIENT_CWD,
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return child;
}

async function kill(proc) {
  if (!proc || proc.killed) return;
  return new Promise((resolve) => {
    proc.once('exit', () => resolve());
    try {
      proc.kill('SIGINT');
      // Fallback: force kill after grace period
      setTimeout(() => {
        if (!proc.killed) {
          try { proc.kill('SIGTERM'); } catch {}
        }
      }, 5_000);
    } catch {
      resolve();
    }
  });
}

// End-to-end: start client and server, call client route that fetches backend, then shutdown.
test('fullstack: client calls backend and both shut down', async (t) => {
  t.timeout(180_000); // allow ample time on Windows

  const server = startServer();
  t.after(async () => { await kill(server); });
  await waitForOk('http://127.0.0.1:5000/api/health');

  const client = startClient();
  t.after(async () => { await kill(client); });
  await waitForOk('http://127.0.0.1:3000');

  const res = await fetch('http://127.0.0.1:3000/api/backend-health');
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.ok, true);
  assert.equal(json.backend.status, 'ok');
  assert.ok(typeof json.backend.uptime === 'number');
});
