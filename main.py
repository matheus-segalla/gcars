from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, extracao, funcionarios, ordens, relatorios

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


@app.get("/")
def home():
    return {"status": "GCARS API Online"}