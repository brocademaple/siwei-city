const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://brocademaple.github.io',
]);

export default async function handler(request: any, response: any) {
  const origin = request.headers.origin ?? '';
  if (allowedOrigins.has(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.MIMO_API_KEY;
  const baseUrl = process.env.MIMO_BASE_URL ?? 'https://token-plan-cn.xiaomimimo.com/v1';
  const model = process.env.MIMO_MODEL ?? 'mimo-v2.5-pro';

  if (!apiKey) {
    response.status(501).json({ error: 'MIMO_API_KEY is not configured' });
    return;
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    const upstream = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.72,
        response_format: { type: 'json_object' },
        messages: body.messages,
      }),
    });

    const payload = await upstream.json();
    if (!upstream.ok) {
      response.status(upstream.status).json({ error: payload.error?.message ?? 'Mimo request failed', raw: payload });
      return;
    }

    response.status(200).json(payload);
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : 'Unknown Mimo proxy error' });
  }
}
