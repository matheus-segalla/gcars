import datetime
from typing import Optional
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query
from models import LembreteModel
from schemas import LembreteCreate, LembreteUpdate
from sqlalchemy import or_
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/lembretes", tags=["Lembretes & Avisos"])


def _calcular_urgencia(data_str: str, status: str):
    """Calcula a diferença em dias e a categoria de urgência."""
    if status == "concluido":
        return 0, "concluido"

    hoje = datetime.date.today()
    try:
        data_obj = datetime.date.fromisoformat(data_str[:10])
    except Exception:
        return 0, "futuro"

    diff = (data_obj - hoje).days
    if diff < 0:
        return diff, "vencido"
    elif diff == 0:
        return 0, "hoje"
    elif diff <= 7:
        return diff, "urgente"
    elif diff <= 30:
        return diff, "breve"
    else:
        return diff, "futuro"


def _serializar_lembrete(lembrete: LembreteModel):
    diff, urgencia = _calcular_urgencia(lembrete.data_lembrete, lembrete.status)
    return {
        "id": lembrete.id,
        "titulo": lembrete.titulo,
        "cliente_nome": lembrete.cliente_nome or "",
        "cliente_telefone": lembrete.cliente_telefone or "",
        "veiculo_info": lembrete.veiculo_info or "",
        "data_lembrete": lembrete.data_lembrete,
        "observacoes": lembrete.observacoes or "",
        "status": lembrete.status,
        "ordem_id": lembrete.ordem_id,
        "criado_em": lembrete.criado_em.isoformat() if lembrete.criado_em else None,
        "concluido_em": (
            lembrete.concluido_em.isoformat() if lembrete.concluido_em else None
        ),
        "dias_diferenca": diff,
        "urgencia": urgencia,
    }


@router.get("/contadores")
def obter_contadores_lembretes(db: Session = Depends(get_db)):
    """Retorna contadores de lembretes para o badge da Navbar e dashboard."""
    hoje_str = datetime.date.today().isoformat()
    d7_str = (datetime.date.today() + datetime.timedelta(days=7)).isoformat()
    d30_str = (datetime.date.today() + datetime.timedelta(days=30)).isoformat()

    pendentes = (
        db.query(LembreteModel)
        .filter(LembreteModel.status == "pendente")
        .all()
    )

    total_pendentes = len(pendentes)
    vencidos = sum(1 for l in pendentes if l.data_lembrete < hoje_str)
    hoje = sum(1 for l in pendentes if l.data_lembrete == hoje_str)
    proximos_7_dias = sum(
        1 for l in pendentes if hoje_str <= l.data_lembrete <= d7_str
    )
    proximos_30_dias = sum(
        1 for l in pendentes if hoje_str <= l.data_lembrete <= d30_str
    )
    total_concluidos = (
        db.query(LembreteModel)
        .filter(LembreteModel.status == "concluido")
        .count()
    )

    return {
        "total_pendentes": total_pendentes,
        "vencidos": vencidos,
        "hoje": hoje,
        "proximos_7_dias": proximos_7_dias,
        "proximos_30_dias": proximos_30_dias,
        "concluidos": total_concluidos,
        "alerta_ativo": (vencidos + hoje) > 0,
    }


@router.get("")
def listar_lembretes(
    status: Optional[str] = Query("todos", description="todos, pendente, concluido"),
    periodo: Optional[str] = Query(None, description="vencidos, hoje, proximos_30, futuros"),
    q: Optional[str] = Query(None, description="busca por texto"),
    db: Session = Depends(get_db),
):
    query = db.query(LembreteModel)

    if status and status != "todos":
        query = query.filter(LembreteModel.status == status)

    if q and q.strip():
        termo = f"%{q.strip()}%"
        query = query.filter(
            or_(
                LembreteModel.titulo.ilike(termo),
                LembreteModel.cliente_nome.ilike(termo),
                LembreteModel.veiculo_info.ilike(termo),
                LembreteModel.observacoes.ilike(termo),
            )
        )

    hoje_str = datetime.date.today().isoformat()
    d30_str = (datetime.date.today() + datetime.timedelta(days=30)).isoformat()

    if periodo == "vencidos":
        query = query.filter(
            LembreteModel.status == "pendente",
            LembreteModel.data_lembrete < hoje_str,
        )
    elif periodo == "hoje":
        query = query.filter(
            LembreteModel.status == "pendente",
            LembreteModel.data_lembrete == hoje_str,
        )
    elif periodo == "proximos_30":
        query = query.filter(
            LembreteModel.status == "pendente",
            LembreteModel.data_lembrete >= hoje_str,
            LembreteModel.data_lembrete <= d30_str,
        )
    elif periodo == "futuros":
        query = query.filter(
            LembreteModel.status == "pendente",
            LembreteModel.data_lembrete > d30_str,
        )

    # Ordenação: pendentes por data_lembrete asc (mais urgentes primeiro), concluidos por data_lembrete desc
    todos = query.all()
    serializados = [_serializar_lembrete(l) for l in todos]

    # Ordena: primeiro pendentes (pela data mais próxima), depois concluídos
    def _criterio_ordenacao(item):
        is_pendente = 0 if item["status"] == "pendente" else 1
        return (is_pendente, item["data_lembrete"])

    serializados.sort(key=_criterio_ordenacao)
    return serializados


@router.post("")
def criar_lembrete(dados: LembreteCreate, db: Session = Depends(get_db)):
    if not dados.titulo.strip():
        raise HTTPException(status_code=400, detail="Título/serviço é obrigatório.")
    if not dados.data_lembrete.strip():
        raise HTTPException(status_code=400, detail="Data do lembrete é obrigatória.")

    data_limpa = dados.data_lembrete.strip()[:10]

    novo = LembreteModel(
        titulo=dados.titulo.strip(),
        data_lembrete=data_limpa,
        cliente_nome=dados.cliente_nome.strip() if dados.cliente_nome else None,
        cliente_telefone=dados.cliente_telefone.strip() if dados.cliente_telefone else None,
        veiculo_info=dados.veiculo_info.strip() if dados.veiculo_info else None,
        observacoes=dados.observacoes.strip() if dados.observacoes else None,
        ordem_id=dados.ordem_id,
        status="pendente",
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return _serializar_lembrete(novo)


@router.put("/{lembrete_id}")
def atualizar_lembrete(
    lembrete_id: int, dados: LembreteUpdate, db: Session = Depends(get_db)
):
    item = (
        db.query(LembreteModel)
        .filter(LembreteModel.id == lembrete_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Lembrete não encontrado.")

    if dados.titulo is not None:
        item.titulo = dados.titulo.strip()
    if dados.data_lembrete is not None:
        item.data_lembrete = dados.data_lembrete.strip()[:10]
    if dados.cliente_nome is not None:
        item.cliente_nome = dados.cliente_nome.strip() or None
    if dados.cliente_telefone is not None:
        item.cliente_telefone = dados.cliente_telefone.strip() or None
    if dados.veiculo_info is not None:
        item.veiculo_info = dados.veiculo_info.strip() or None
    if dados.observacoes is not None:
        item.observacoes = dados.observacoes.strip() or None
    if dados.status is not None:
        item.status = dados.status
        if dados.status == "concluido" and not item.concluido_em:
            item.concluido_em = datetime.datetime.utcnow()
        elif dados.status == "pendente":
            item.concluido_em = None

    db.commit()
    db.refresh(item)
    return _serializar_lembrete(item)


@router.patch("/{lembrete_id}/concluir")
def concluir_lembrete(lembrete_id: int, db: Session = Depends(get_db)):
    item = (
        db.query(LembreteModel)
        .filter(LembreteModel.id == lembrete_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Lembrete não encontrado.")

    item.status = "concluido"
    item.concluido_em = datetime.datetime.utcnow()
    db.commit()
    db.refresh(item)
    return _serializar_lembrete(item)


@router.patch("/{lembrete_id}/reabrir")
def reabrir_lembrete(lembrete_id: int, db: Session = Depends(get_db)):
    item = (
        db.query(LembreteModel)
        .filter(LembreteModel.id == lembrete_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Lembrete não encontrado.")

    item.status = "pendente"
    item.concluido_em = None
    db.commit()
    db.refresh(item)
    return _serializar_lembrete(item)


@router.patch("/{lembrete_id}/reagendar")
def reagendar_lembrete(
    lembrete_id: int, payload: dict, db: Session = Depends(get_db)
):
    item = (
        db.query(LembreteModel)
        .filter(LembreteModel.id == lembrete_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Lembrete não encontrado.")

    nova_data = payload.get("nova_data")
    if not nova_data or not isinstance(nova_data, str):
        raise HTTPException(status_code=400, detail="Nova data é obrigatória.")

    item.data_lembrete = nova_data.strip()[:10]
    item.status = "pendente"
    item.concluido_em = None
    db.commit()
    db.refresh(item)
    return _serializar_lembrete(item)


@router.delete("/{lembrete_id}")
def excluir_lembrete(lembrete_id: int, db: Session = Depends(get_db)):
    item = (
        db.query(LembreteModel)
        .filter(LembreteModel.id == lembrete_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Lembrete não encontrado.")

    db.delete(item)
    db.commit()
    return {"sucesso": True, "mensagem": "Lembrete excluído com sucesso."}
