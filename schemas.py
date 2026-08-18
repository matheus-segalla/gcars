from typing import List, Optional
from pydantic import BaseModel


class OSCreateSchema(BaseModel):
    numero: str
    data: str
    cliente: str
    veiculo: str
    cor: Optional[str] = ""
    placa: Optional[str] = ""
    ano: Optional[str] = ""
    km: Optional[str] = ""
    pecas: float = 0.0
    mao_obra: float = 0.0
    forma_pagamento: Optional[str] = ""
    servicos: List[str] = []
    fotos: List[str] = []