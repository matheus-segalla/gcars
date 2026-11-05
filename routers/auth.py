import os
import secrets
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, status
import httpx
from pydantic import BaseModel

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@gcars.com.br")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "gcars@2026")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()


class LoginSchema(BaseModel):
    email: str
    password: str


class RecuperarSenhaSchema(BaseModel):
    email: str


class RedefinirSenhaSchema(BaseModel):
    access_token: str
    nova_senha: str


@router.post("/login")
def login(dados: LoginSchema):
    email_clean = dados.email.strip().lower()

    # 1. Tenta autenticar pelo Supabase Auth
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            headers = {
                "apikey": SUPABASE_KEY,
                "Content-Type": "application/json",
            }
            res = httpx.post(
                f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
                headers=headers,
                json={"email": email_clean, "password": dados.password},
                timeout=10.0,
            )
            if res.status_code == 200:
                payload = res.json()
                user_info = payload.get("user", {})
                nome_user = (
                    user_info.get("user_metadata", {}).get("nome")
                    or email_clean.split("@")[0].capitalize()
                )
                return {
                    "sucesso": True,
                    "token": payload.get("access_token"),
                    "usuario": {
                        "email": user_info.get("email", email_clean),
                        "nome": nome_user,
                    },
                }
        except Exception as e:
            print("⚠️ Erro ao consultar Supabase Auth:", e)

    # 2. Fallback para administrador legado do .env
    if email_clean == ADMIN_EMAIL.lower() and dados.password == ADMIN_PASSWORD:
        token = secrets.token_hex(24)
        return {
            "sucesso": True,
            "token": token,
            "usuario": {"email": ADMIN_EMAIL, "nome": "Equipe GCARS"},
        }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Email ou senha incorretos.",
    )


@router.post("/recuperar-senha")
def recuperar_senha(dados: RecuperarSenhaSchema):
    email_clean = dados.email.strip().lower()

    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(
            status_code=500, detail="Serviço de autenticação não configurado."
        )

    try:
        headers = {
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json",
        }
        res = httpx.post(
            f"{SUPABASE_URL}/auth/v1/recover",
            headers=headers,
            json={"email": email_clean},
            timeout=10.0,
        )
        if res.status_code in [200, 201, 204]:
            return {
                "sucesso": True,
                "mensagem": f"Enviamos uma confirmação com instruções para redefinição de senha para {email_clean}.",
            }
        else:
            raise HTTPException(
                status_code=400,
                detail="Não foi possível enviar o e-mail de recuperação. Verifique o endereço e tente novamente.",
            )
    except HTTPException:
        raise
    except Exception as e:
        print("❌ Erro ao solicitar recuperação de senha:", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/redefinir-senha")
def redefinir_senha(dados: RedefinirSenhaSchema):
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(
            status_code=500, detail="Serviço de autenticação não configurado."
        )

    if not dados.access_token:
        raise HTTPException(
            status_code=400,
            detail="Token de recuperação ausente ou expirado.",
        )

    if len(dados.nova_senha) < 6:
        raise HTTPException(
            status_code=400,
            detail="A nova senha deve ter no mínimo 6 caracteres.",
        )

    try:
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {dados.access_token.strip()}",
            "Content-Type": "application/json",
        }
        res = httpx.put(
            f"{SUPABASE_URL}/auth/v1/user",
            headers=headers,
            json={"password": dados.nova_senha},
            timeout=10.0,
        )
        if res.status_code == 200:
            return {
                "sucesso": True,
                "mensagem": "Sua senha foi redefinida com sucesso! Faça login com a nova senha.",
            }
        else:
            raise HTTPException(
                status_code=400,
                detail="Link ou token de recuperação inválido/expirado. Solicite outro link.",
            )
    except HTTPException:
        raise
    except Exception as e:
        print("❌ Erro ao redefinir senha:", e)
        raise HTTPException(status_code=500, detail=str(e))
