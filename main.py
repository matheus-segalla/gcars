from database import Base, engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, extracao, funcionarios, lembretes, ordens, relatorios

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