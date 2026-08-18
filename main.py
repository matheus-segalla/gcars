from database import engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from routers import auth, extracao, ordens, relatorios

# Cria as tabelas no banco de dados se não existirem
models.Base.metadata.create_all(bind=engine)

# Inicializa a API
app = FastAPI(
    title="GCARS API - Sistema de Orçamentos",
    description="Backend oficial da GCARS Reparos Automotivos",
    version="2.0.0",
)

# Configuração de CORS para permitir acesso do React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de todas as rotas modulares
app.include_router(auth.router)
app.include_router(extracao.router)
app.include_router(ordens.router)
app.include_router(relatorios.router)


# Rota de verificação de status
@app.get("/")
def health_check():
    return {"status": "online", "sistema": "GCARS API v2.0"}