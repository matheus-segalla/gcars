from typing import List, Optional
from pydantic import BaseModel


class ServicoItemCreate(BaseModel):
    descricao: str
    valor: Optional[float] = 0.0


class FuncionarioCreate(BaseModel):
    nome: str
    cargo: Optional[str] = "Mecânico"


class AtualizarCustoSchema(BaseModel):
    custo: float = 0.0


class OrdemServicoCreate(BaseModel):
    numero: str
    data: str
    cliente: str
    veiculo: str
    placa: Optional[str] = None
    cor: Optional[str] = None
    ano: Optional[str] = None
    km: Optional[str] = None
    forma_pagamento: Optional[str] = None
    pecas: Optional[float] = 0.0
    mao_obra: Optional[float] = 0.0
    custo: Optional[float] = 0.0
    servicos: Optional[List[str]] = []
    fotos: Optional[List[str]] = []
    funcionario_id: Optional[int] = None


class LoginSchema(BaseModel):
    email: str
    password: str