#!/usr/bin/env python3
"""
Script utilitário para pingar a API do Supabase e o banco de dados.
Evita que o projeto do Supabase (plano gratuito) entre em hibernação / pausa após 7 dias de inatividade.

Pode ser executado:
  1. Manualmente: python scripts/ping_supabase.py
  2. No Agendador de Tarefas do Windows (Task Scheduler)
  3. Em qualquer serviço de automação ou cron
"""

import os
import sys
import datetime
import urllib.request
import urllib.error
from dotenv import load_dotenv

# Carrega variáveis do .env na raiz do projeto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
dotenv_path = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path)

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY") or ""
DATABASE_URL = os.getenv("DATABASE_URL", "")


def ping_rest_api():
    print("==================================================")
    print("📡 [1/2] Testando REST API do Supabase...")
    print(f"Data/Hora: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("==================================================")

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("⚠️ AVISO: SUPABASE_URL ou SUPABASE_KEY não encontradas no .env!")
        return False

    url = f"{SUPABASE_URL}/rest/v1/clientes?select=id&limit=1"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "User-Agent": "GCARS-KeepAlive/1.0",
    }

    req = urllib.request.Request(url, headers=headers, method="GET")

    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            status = response.getcode()
            body = response.read().decode("utf-8")
            print(f"✅ Sucesso na API REST! Código HTTP: {status}")
            print(f"📦 Resposta: {body[:120]}")
            return True
    except urllib.error.HTTPError as e:
        print(f"⚠️ Resposta HTTP: {e.code} - {e.reason}")
        # Mesmo com 401/403/404, a requisição atingiu o servidor do Supabase e renova a atividade
        return e.code < 500
    except Exception as e:
        print(f"❌ Erro ao conectar na REST API: {e}")
        return False


def ping_database():
    print("\n==================================================")
    print("🐘 [2/2] Testando conexão direta com o banco (SQL)...")
    print("==================================================")

    if not DATABASE_URL:
        print("⚠️ DATABASE_URL não encontrada no .env!")
        return False

    try:
        from database import SessionLocal
        from sqlalchemy import text

        db = SessionLocal()
        try:
            resultado = db.execute(text("SELECT 1")).scalar()
            print(f"✅ Conexão SQL bem-sucedida! Retorno da query: {resultado}")
            return True
        finally:
            db.close()
    except Exception as e:
        print(f"⚠️ Erro na conexão direta SQL: {e}")
        return False


def main():
    print("🚀 GCARS - Rotina de Keep-Alive do Supabase\n")
    sucesso_api = ping_rest_api()
    sucesso_db = ping_database()

    print("\n--------------------------------------------------")
    if sucesso_api or sucesso_db:
        print("🎉 SUCESSO: Atividade registrada no Supabase! Projeto continuará ativo.")
        sys.exit(0)
    else:
        print("❌ ATENÇÃO: Nenhuma das tentativas de conexão obteve sucesso.")
        sys.exit(1)


if __name__ == "__main__":
    main()
