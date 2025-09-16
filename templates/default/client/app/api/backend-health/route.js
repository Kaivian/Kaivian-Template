export async function GET() {
  const origin = process.env.SERVER_ORIGIN || 'http://localhost:5000';
  try {
    const res = await fetch(`${origin}/api/health`);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'backend not ok', status: res.status }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      });
    }
    const data = await res.json();
    return new Response(
      JSON.stringify({ ok: true, backend: data }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
