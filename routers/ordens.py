import json
import math
from typing import Optional

from database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query
from models import ClienteModel, ItemServicoModel, OrdemServicoModel, VeiculoModel
from schemas import OrdemServicoCreate
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/ordens-servico", tags=["Ordens de Serviço"])


@router.post("")
def criar_ordem_servico(os_in: OrdemServicoCreate, db: Session = Depends(get_db)):
    try:
        # 1. Cliente
        cliente = (
            db.query(ClienteModel)
            .filter(ClienteModel.nome.ilike(os_in.cliente.strip()))
            .first()
        )
        if not cliente:
            cliente = ClienteModel(nome=os_in.cliente.strip())
            db.add(cliente)
            db.flush()

        # 2. Veículo
        placa_limpa = os_in.placa.strip().upper() if os_in.placa else None
        veiculo = None
        if placa_limpa:
            veiculo = (
                db.query(VeiculoModel)
                .filter(VeiculoModel.placa == placa_limpa)
                .first()
            )

        if not veiculo:
            veiculo = VeiculoModel(
                modelo=os_in.veiculo.strip(),
                placa=placa_limpa,
                cor=os_in.cor,
                ano=os_in.ano,
                cliente_id=cliente.id,
            )
            db.add(veiculo)
            db.flush()

        # 3. Serializar lista de URLs de fotos para JSON
        fotos_json_str = json.dumps(os_in.fotos or [])

        # 4. Ordem de Serviço
        nova_os = OrdemServicoModel(
            numero_orcamento=os_in.numero.strip(),
            data_os=os_in.data.strip(),
            km=os_in.km,
            forma_pagamento=os_in.forma_pagamento,
            pecas=os_in.pecas or 0.0,
            mao_obra=os_in.mao_obra or 0.0,
            total=(os_in.pecas or 0.0) + (os_in.mao_obra or 0.0),
            fotos_json=fotos_json_str,
            veiculo_id=veiculo.id,
        )
        db.add(nova_os)
        db.flush()

        # 5. Itens de Serviços (sem o argumento 'valor')
        if os_in.servicos:
            for s_desc in os_in.servicos:
                if s_desc.strip():
                    try:
                        servico = ItemServicoModel(
                            descricao=s_desc.strip(),
                            ordem_id=nova_os.id,
                        )
                    except TypeError:
                        servico = ItemServicoModel(
                            descricao=s_desc.strip(),
                            ordem_servico_id=nova_os.id,
                        )
                    db.add(servico)

        db.commit()
        db.refresh(nova_os)
        return {"sucesso": True, "id": nova_os.id, "numero": nova_os.numero_orcamento}
    except Exception as e:
        db.rollback()
        print("❌ Erro ao salvar OS:", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/buscar")
def buscar_ordens(
    q: Optional[str] = Query("", description="Termo de busca"),
    pagina: int = Query(1, ge=1),
    limite: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = (
        db.query(OrdemServicoModel)
        .join(VeiculoModel, OrdemServicoModel.veiculo_id == VeiculoModel.id)
        .join(ClienteModel, VeiculoModel.cliente_id == ClienteModel.id)
    )

    if q and q.strip():
        termo = f"%{q.strip()}%"
        query = query.filter(
            (ClienteModel.nome.ilike(termo))
            | (VeiculoModel.placa.ilike(termo))
            | (VeiculoModel.modelo.ilike(termo))
            | (OrdemServicoModel.numero_orcamento.ilike(termo))
        )

    total = query.count()
    total_paginas = math.ceil(total / limite) if total > 0 else 1
    ordens = (
        query.order_by(OrdemServicoModel.id.desc())
        .offset((pagina - 1) * limite)
        .limit(limite)
        .all()
    )

    itens = []
    for o in ordens:
        fotos_lista = []
        if getattr(o, "fotos_json", None):
            try:
                fotos_lista = json.loads(o.fotos_json)
            except Exception:
                fotos_lista = []

        servicos_lista = getattr(o, "servicos", None) or getattr(o, "itens", [])
        servicos_nomes = [getattr(s, "descricao", str(s)) for s in servicos_lista]

        itens.append({
            "id": o.id,
            "numero_orcamento": o.numero_orcamento,
            "data": o.data_os,
            "cliente": o.veiculo.cliente.nome if o.veiculo and o.veiculo.cliente else "Não informado",
            "veiculo": f"{o.veiculo.modelo} ({o.veiculo.placa or 'Sem placa'})" if o.veiculo else "Não informado",
            "total": o.total,
            "pecas": o.pecas,
            "mao_obra": o.mao_obra,
            "forma_pagamento": o.forma_pagamento,
            "fotos": fotos_lista,
            "servicos": servicos_nomes,
        })

    return {
        "itens": itens,
        "total": total,
        "pagina": pagina,
        "total_paginas": total_paginas,
        "limite": limite,
    }


@router.delete("/{os_id}")
def excluir_ordem(os_id: int, db: Session = Depends(get_db)):
    os_item = db.query(OrdemServicoModel).filter(OrdemServicoModel.id == os_id).first()
    if not os_item:
        raise HTTPException(status_code=404, detail="Ordem de serviço não encontrada.")
    try:
        db.delete(os_item)
        db.commit()
        return {"sucesso": True, "mensagem": "OS excluída com sucesso."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))