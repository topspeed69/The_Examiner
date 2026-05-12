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
      max_tokens: body.max_tokens || 1024,
      temperature: body.temperature || 0.3,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return new Response(JSON.stringify(errorData), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await response.json();
  return new Response(JSON.stringify({ content: data.choices[0].message.content }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
