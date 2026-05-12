export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const API_KEY = process.env.NIM_API_KEY;
  const BASE_URL = process.env.NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  const MODEL = process.env.NIM_MODEL || 'meta/llama-4-maverick-17b-128e-instruct';

  const body = await req.json();

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: body.model || MODEL,
      messages: body.messages,
      max_tokens: body.max_tokens || 2048,
      temperature: body.temperature || 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return new Response(JSON.stringify(errorData), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Forward the stream
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
