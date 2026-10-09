import datetime
from database import Base, engine, get_db
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, extracao, funcionarios, lembretes, ordens, relatorios
from sqlalchemy import text
from sqlalchemy.orm import Session

# Garante criação de tabelas novas caso ainda não existam no banco
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"⚠️ Aviso ao verificar tabelas no banco: {e}")

app = FastAPI(title="GCARS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(extracao.router)
app.include_router(ordens.router)
app.include_router(relatorios.router)
app.include_router(funcionarios.router)
app.include_router(lembretes.router)


@app.get("/")
def home():
    return {"status": "GCARS API Online"}


@app.get("/api/health")
@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Endpoint de health check e keep-alive.
    Executa uma query no banco de dados para manter conexões e projetos Supabase ativos.
    """
    timestamp = datetime.datetime.utcnow().isoformat()
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "online",
            "database": "conectado",
            "timestamp": timestamp,
            "mensagem": "Servidor e banco de dados operacionais.",
        }
    except Exception as e:
        return {
            "status": "online",
            "database": f"erro: {str(e)}",
            "timestamp": timestamp,
            "mensagem": "Servidor ativo, mas houve falha na consulta ao banco.",
        }