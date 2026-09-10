import json
import math
from typing import Optional

from database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query
from models import (
    ClienteModel,
    FuncionarioModel,
    ItemServicoModel,
    OrdemServicoModel,
    VeiculoModel,
)
from schemas import AtualizarCustoSchema, OrdemServicoCreate, OrdemServicoUpdate
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/ordens-servico", tags=["Ordens de Serviço"])


@router.post("")
def criar_ordem_servico(
    os_in: OrdemServicoCreate, db: Session = Depends(get_db)
):
    try:
        cliente = (
            db.query(ClienteModel)
            .filter(ClienteModel.nome.ilike(os_in.cliente.strip()))
            .first()
        )
        if not cliente:
            cliente = ClienteModel(nome=os_in.cliente.strip())
            db.add(cliente)
            db.flush()

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

        fotos_json_str = json.dumps(os_in.fotos or [])

        nova_os = OrdemServicoModel(
            numero_orcamento=os_in.numero.strip(),
            data_os=os_in.data.strip(),
            km=os_in.km,
            forma_pagamento=os_in.forma_pagamento,
            pecas=os_in.pecas or 0.0,
            mao_obra=os_in.mao_obra or 0.0,
            custo=os_in.custo or 0.0,
            total=(os_in.pecas or 0.0) + (os_in.mao_obra or 0.0),
            fotos_json=fotos_json_str,
            veiculo_id=veiculo.id,
            funcionario_id=os_in.funcionario_id,
        )
        db.add(nova_os)
        db.flush()

        if os_in.servicos:
            for s_desc in os_in.servicos:
                if s_desc.strip():
                    servico = ItemServicoModel(
                        descricao=s_desc.strip(),
                        ordem_id=nova_os.id,
                    )
                    db.add(servico)

        db.commit()
        db.refresh(nova_os)
        return {
            "sucesso": True,
            "id": nova_os.id,
            "numero": nova_os.numero_orcamento,
        }
    except Exception as e:
        db.rollback()
        print("❌ Erro ao salvar OS:", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{os_id}/custo")
def atualizar_custo_os(
    os_id: int, payload: AtualizarCustoSchema, db: Session = Depends(get_db)
):
    os_item = (
        db.query(OrdemServicoModel)
        .filter(OrdemServicoModel.id == os_id)
        .first()
    )
    if not os_item:
        raise HTTPException(
            status_code=404, detail="Ordem de serviço não encontrada."
        )
    try:
        os_item.custo = float(payload.custo or 0.0)
        db.commit()
        db.refresh(os_item)
        return {
            "sucesso": True,
            "id": os_item.id,
            "custo": os_item.custo,
            "lucro": (os_item.total or 0.0) - os_item.custo,
        }
    except Exception as e:
        db.rollback()
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
        .outerjoin(
            FuncionarioModel,
            OrdemServicoModel.funcionario_id == FuncionarioModel.id,
        )
    )

    if q and q.strip():
        termo = f"%{q.strip()}%"
        query = query.filter(
            (ClienteModel.nome.ilike(termo))
            | (VeiculoModel.placa.ilike(termo))
            | (VeiculoModel.modelo.ilike(termo))
            | (OrdemServicoModel.numero_orcamento.ilike(termo))
            | (FuncionarioModel.nome.ilike(termo))
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

        servicos_lista = getattr(o, "itens", [])
        servicos_nomes = [s.descricao for s in servicos_lista]

        pecas_val = float(o.pecas or 0.0)
        mao_obra_val = float(o.mao_obra or 0.0)
        desconto_val = float(getattr(o, "desconto", 0.0) or 0.0)
        custo_val = float(o.custo or 0.0)

        total_val = float(o.total or 0.0)
        if total_val == 0.0 and (pecas_val + mao_obra_val) > 0:
            total_val = max(0.0, (pecas_val + mao_obra_val) - desconto_val)

        valor_pago_val = float(getattr(o, "valor_pago", 0.0) or 0.0)
        restante_val = max(0.0, total_val - valor_pago_val)
        lucro_val = total_val - custo_val

        status_pag = getattr(o, "status_pagamento", None)
        if not status_pag:
            if valor_pago_val >= total_val and total_val > 0:
                status_pag = "pago"
            elif valor_pago_val > 0:
                status_pag = "parcial"
            else:
                status_pag = "pendente"

        modelo_puro = o.veiculo.modelo if o.veiculo else ""
        placa_pura = o.veiculo.placa if (o.veiculo and o.veiculo.placa) else ""

        itens.append({
            "id": o.id,
            "numero_orcamento": o.numero_orcamento,
            "data": o.data_os,
            "km": o.km or "",
            "cliente": (
                o.veiculo.cliente.nome
                if o.veiculo and o.veiculo.cliente
                else "Não informado"
            ),
            # String formatada mantida para não quebrar a tabela visual
            "veiculo": (
                f"{modelo_puro} ({placa_pura or 'Sem placa'})"
                if o.veiculo
                else "Não informado"
            ),
            # Campos limpos adicionados para preencher o formulário do modal
            "veiculo_modelo": modelo_puro,
            "placa": placa_pura,
            "total": total_val,
            "pecas": pecas_val,
            "mao_obra": mao_obra_val,
            "desconto": desconto_val,
            "valor_pago": valor_pago_val,
            "restante": restante_val,
            "status_pagamento": status_pag,
            "custo": custo_val,
            "lucro": lucro_val,
            "forma_pagamento": o.forma_pagamento,
            "funcionario_id": o.funcionario_id,
            "mecanico": (
                o.funcionario.nome if o.funcionario else "Não atribuído"
            ),
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
    os_item = (
        db.query(OrdemServicoModel)
        .filter(OrdemServicoModel.id == os_id)
        .first()
    )
    if not os_item:
        raise HTTPException(
            status_code=404, detail="Ordem de serviço não encontrada."
        )
    try:
        db.delete(os_item)
        db.commit()
        return {"sucesso": True, "mensagem": "OS excluída com sucesso."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{os_id}")
def atualizar_ordem_servico(
    os_id: int, payload: OrdemServicoUpdate, db: Session = Depends(get_db)
):
    os_item = (
        db.query(OrdemServicoModel)
        .filter(OrdemServicoModel.id == os_id)
        .first()
    )
    if not os_item:
        raise HTTPException(
            status_code=404, detail="Ordem de serviço não encontrada."
        )

    try:
        # Atualiza Cliente e Veículo se informados
        if payload.cliente and os_item.veiculo and os_item.veiculo.cliente:
            os_item.veiculo.cliente.nome = payload.cliente.strip()

        if payload.veiculo and os_item.veiculo:
            os_item.veiculo.modelo = payload.veiculo.strip()
            if payload.placa is not None:
                os_item.veiculo.placa = payload.placa.strip().upper()

        # Cálculos de Total e Status
        pecas = float(payload.pecas or 0.0)
        mao_obra = float(payload.mao_obra or 0.0)
        desconto = float(payload.desconto or 0.0)
        total_liquido = max(0.0, (pecas + mao_obra) - desconto)
        valor_pago = float(payload.valor_pago or 0.0)

        if valor_pago >= total_liquido and total_liquido > 0:
            status = "pago"
        elif valor_pago > 0:
            status = "parcial"
        else:
            status = "pendente"

        # Atualiza dados da OS
        if payload.numero:
            os_item.numero_orcamento = payload.numero.strip()
        if payload.data:
            os_item.data_os = payload.data.strip()
        os_item.km = payload.km
        os_item.forma_pagamento = payload.forma_pagamento
        os_item.funcionario_id = payload.funcionario_id
        os_item.pecas = pecas
        os_item.mao_obra = mao_obra
        os_item.desconto = desconto
        os_item.total = total_liquido
        os_item.valor_pago = valor_pago
        os_item.status_pagamento = status

        # Atualiza Serviços
        if payload.servicos is not None:
            db.query(ItemServicoModel).filter(
                ItemServicoModel.ordem_id == os_id
            ).delete()
            for s_desc in payload.servicos:
                if s_desc.strip():
                    db.add(
                        ItemServicoModel(
                            descricao=s_desc.strip(), ordem_id=os_id
                        )
                    )

        db.commit()
        db.refresh(os_item)
        return {"sucesso": True, "mensagem": "Ordem atualizada com sucesso!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))