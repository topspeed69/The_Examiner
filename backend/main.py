"""
The Examiner — FastAPI Streaming Proxy
Routes LLM requests through NVIDIA NIM (OpenAI-compatible API).
Single-file, stateless proxy. All session logic lives client-side.
"""

from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
import os
import json

load_dotenv()

app = FastAPI(title="The Examiner Proxy")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    base_url=os.getenv("NIM_BASE_URL", "https://integrate.api.nvidia.com/v1"),
    api_key=os.getenv("NIM_API_KEY", ""),
)

MODEL = os.getenv("NIM_MODEL", "meta/llama-3.1-70b-instruct")


@app.post("/examine")
async def examine(request: Request):
    """Stream an examination response from the LLM."""
    body = await request.json()

    def stream():
        response = client.chat.completions.create(
            model=body.get("model", MODEL),
            messages=body["messages"],
            max_tokens=body.get("max_tokens", 2048),
            temperature=body.get("temperature", 0.7),
            stream=True,
        )
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                text = chunk.choices[0].delta.content
                yield f"data: {json.dumps({'text': text})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")


@app.post("/classify")
async def classify(request: Request):
    """Classify an artefact type (non-streaming)."""
    body = await request.json()

    response = client.chat.completions.create(
        model=body.get("model", MODEL),
        messages=body["messages"],
        max_tokens=body.get("max_tokens", 1024),
        temperature=0.3,
        stream=False,
    )

    return {"content": response.choices[0].message.content}


@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL}
