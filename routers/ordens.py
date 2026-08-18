import json
import math
from typing import Optional

from database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query
from models import (
    ClienteModel,
    ItemServicoModel,
    OrdemServicoModel,
    VeiculoModel,
)
from schemas import OSCreateSchema
from sqlalchemy import or_
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/ordens-servico", tags=["Ordens de Serviço"])


# 1. Salvar OS
@router.post("")
def salvar_ordem_servico(dados: OSCreateSchema, db: Session = Depends(get_db)):
    try:
        # Cliente
        cliente = (
            db.query(ClienteModel)
            .filter(ClienteModel.nome == dados.cliente)
            .first()
        )
        if not cliente:
            cliente = ClienteModel(nome=dados.cliente)
            db.add(cliente)
            db.flush()

        # Veículo
        veiculo = None
        if dados.placa:
            veiculo = (
                db.query(VeiculoModel)
                .filter(VeiculoModel.placa == dados.placa)
                .first()
            )

        if not veiculo:
            veiculo = VeiculoModel(
                placa=dados.placa,
                modelo=dados.veiculo,
                cor=dados.cor,
                ano=dados.ano,
                cliente_id=cliente.id,
            )
            db.add(veiculo)
            db.flush()

        # OS
        total_calculado = dados.pecas + dados.mao_obra
        nova_os = OrdemServicoModel(
            numero_orcamento=dados.numero,
            data_os=dados.data,
            km=dados.km,
            pecas=dados.pecas,
            mao_obra=dados.mao_obra,
            total=total_calculado,
            forma_pagamento=dados.forma_pagamento,
            fotos_json=json.dumps(dados.fotos),
            veiculo_id=veiculo.id,
        )
        db.add(nova_os)
        db.flush()

        # Itens
        for item in dados.servicos:
            if item.strip():
                servico = ItemServicoModel(
                    descricao=item.strip(), ordem_id=nova_os.id
                )
                db.add(servico)

        db.commit()
        return {
            "sucesso": True,
            "os_id": nova_os.id,
            "mensagem": "OS salva com sucesso!",
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# 2. Buscar Ordens
@router.get("/buscar")
def buscar_ordens(
    q: Optional[str] = Query(None, description="Termo de busca"),
    pagina: int = Query(1, ge=1, description="Número da página"),
    limite: int = Query(10, ge=1, le=100, description="Itens por página"),
    db: Session = Depends(get_db),
):
    query = db.query(OrdemServicoModel).join(VeiculoModel).join(ClienteModel)

    if q:
        termo = f"%{q}%"
        query = query.filter(
            or_(
                OrdemServicoModel.numero_orcamento.ilike(termo),
                ClienteModel.nome.ilike(termo),
                VeiculoModel.placa.ilike(termo),
                VeiculoModel.modelo.ilike(termo),
            )
        )

    total_registros = query.count()
    total_paginas = (
        math.ceil(total_registros / limite) if total_registros > 0 else 1
    )

    ordens = (
        query.order_by(OrdemServicoModel.id.desc())
        .offset((pagina - 1) * limite)
        .limit(limite)
        .all()
    )

    resultados = []
    for os_item in ordens:
        placa_formatada = (
            os_item.veiculo.placa if os_item.veiculo.placa else "Sem placa"
        )

        fotos_lista = []
        if os_item.fotos_json:
            try:
                fotos_lista = json.loads(os_item.fotos_json)
            except Exception:
                fotos_lista = []

        resultados.append({
            "id": os_item.id,
            "numero_orcamento": os_item.numero_orcamento,
            "data": os_item.data_os,
            "cliente": os_item.veiculo.cliente.nome,
            "veiculo": f"{os_item.veiculo.modelo} ({placa_formatada})",
            "total": os_item.total,
            "pecas": os_item.pecas,
            "mao_obra": os_item.mao_obra,
            "forma_pagamento": os_item.forma_pagamento,
            "fotos": fotos_lista,
            "servicos": [s.descricao for s in os_item.servicos],
        })

    return {
        "itens": resultados,
        "total": total_registros,
        "pagina": pagina,
        "total_paginas": total_paginas,
        "limite": limite,
    }


# 3. Excluir OS
@router.delete("/{os_id}")
def excluir_ordem_servico(os_id: int, db: Session = Depends(get_db)):
    try:
        os_item = (
            db.query(OrdemServicoModel)
            .filter(OrdemServicoModel.id == os_id)
            .first()
        )
        if not os_item:
            raise HTTPException(
                status_code=404, detail="Ordem de Serviço não encontrada."
            )

        db.query(ItemServicoModel).filter(
            ItemServicoModel.ordem_id == os_id
        ).delete()
        db.delete(os_item)
        db.commit()

        return {
            "sucesso": True,
            "mensagem": f"OS #{os_id} excluída com sucesso!",
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))