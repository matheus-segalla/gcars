import os
import secrets
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@gcars.com.br")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "gcars@2026")


class LoginSchema(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(dados: LoginSchema):
    if dados.email.strip().lower() != ADMIN_EMAIL.lower() or dados.password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos.",
        )

    # Gera um token de sessão simples
    token = secrets.token_hex(24)
    return {
        "sucesso": True,
        "token": token,
        "usuario": {"email": ADMIN_EMAIL, "nome": "Equipe GCARS"}
    }