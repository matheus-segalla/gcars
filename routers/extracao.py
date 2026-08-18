import base64
import json
import os
import uuid
from typing import List

import anthropic
from fastapi import APIRouter, File, HTTPException, UploadFile
import httpx

router = APIRouter(prefix="/api", tags=["Extração IA"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = "taloes"

PROMPT_EXTRACAO = """Você está vendo foto(s) de um ORÇAMENTO / ORDEM DE SERVIÇO manuscrito da oficina mecânica (GCARS Reparos Automotivos).

INSTRUÇÕES PARA MÚLTIPLAS FOLHAS/IMAGENS:
1. Se houver mais de uma foto enviada, elas pertencem ao MESMO pedido que foi dividido em talões sequenciais (ex: 6333, 6333A, 6333B).
2. Junte e liste TODOS os itens e serviços descritos em TODAS as folhas em uma única lista contínua no campo 'servicos'.
3. Os valores de 'pecas', 'mao_obra', 'total' e 'forma_pagamento' geralmente estão na ÚLTIMA folha. Extraia os totais consolidados.
4. No campo 'numero', coloque o número do talão identificador (ex: "6333" ou "6333A/B").
5. No campo 'km', extraia apenas números.

Devolva SOMENTE um JSON válido sem marcações markdown:
{
  "numero": "número do orçamento",
  "data": "DD/MM/AAAA",
  "cliente": "nome do cliente",
  "veiculo": "modelo do veículo",
  "cor": "cor do veículo",
  "placa": "placa",
  "ano": "ano do veículo",
  "km": "quilometragem apenas números",
  "servicos": ["item 1", "item 2", "item 3"],
  "pecas": 0.0,
  "mao_obra": 0.0,
  "total": 0.0,
  "forma_pagamento": ""
}
"""


async def upload_para_supabase(file_bytes: bytes, filename: str, content_type: str) -> str:
    """Faz o upload da foto para o Supabase Storage e retorna a URL pública."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return ""
    try:
        ext = filename.split(".")[-1] if "." in filename else "jpg"
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        upload_url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{unique_name}"

        headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "apikey": SUPABASE_KEY,
            "Content-Type": content_type,
        }

        async with httpx.AsyncClient() as client:
            res = await client.post(upload_url, content=file_bytes, headers=headers)
            if res.status_code in (200, 201):
                return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{unique_name}"
    except Exception as err:
        print("Erro ao enviar imagem ao Supabase Storage:", err)
    return ""


@router.post("/extrair-nota")
async def extrair_nota(files: List[UploadFile] = File(...)):
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY não configurada no ambiente.",
        )

    if not files:
        raise HTTPException(status_code=400, detail="Nenhum arquivo enviado.")

    try:
        images_payload = []
        fotos_salvas = []

        for file in files:
            contents = await file.read()
            media_type = file.content_type or "image/jpeg"

            # 1. Upload para o Supabase Storage
            url_publica = await upload_para_supabase(contents, file.filename, media_type)
            if url_publica:
                fotos_salvas.append(url_publica)

            # 2. Prepara Base64 para Claude Vision
            image_base64 = base64.b64encode(contents).decode("utf-8")
            images_payload.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": media_type,
                    "data": image_base64,
                },
            })

        images_payload.append({"type": "text", "text": PROMPT_EXTRACAO})

        client = anthropic.Anthropic()
        resposta = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2500,
            messages=[{"role": "user", "content": images_payload}],
        )

        texto = "".join(b.text for b in resposta.content if b.type == "text").strip()
        texto = texto.replace("```json", "").replace("```", "").strip()
        dados = json.loads(texto)

        return {"sucesso": True, "dados": dados, "fotos": fotos_salvas}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))