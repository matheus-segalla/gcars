from typing import Optional
from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models import FuncionarioModel, OrdemServicoModel
from schemas import FuncionarioCreate
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/funcionarios", tags=["Funcionários"])


@router.get("")
def listar_funcionarios(
    apenas_ativos: bool = True, db: Session = Depends(get_db)
):
    query = db.query(FuncionarioModel)
    if apenas_ativos:
        query = query.filter(FuncionarioModel.ativo == True)
    return query.order_by(FuncionarioModel.nome.asc()).all()


@router.post("")
def criar_funcionario(dados: FuncionarioCreate, db: Session = Depends(get_db)):
    if not dados.nome.strip():
        raise HTTPException(status_code=400, detail="Nome é obrigatório.")
    novo = FuncionarioModel(
        nome=dados.nome.strip(),
        cargo=dados.cargo.strip() or "Mecânico",
        ativo=True,
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


@router.patch("/{func_id}/toggle-status")
def alternar_status(func_id: int, db: Session = Depends(get_db)):
    func_item = (
        db.query(FuncionarioModel)
        .filter(FuncionarioModel.id == func_id)
        .first()
    )
    if not func_item:
        raise HTTPException(
            status_code=404, detail="Funcionário não encontrado."
        )
    func_item.ativo = not func_item.ativo
    db.commit()
    return {"sucesso": True, "ativo": func_item.ativo}


@router.get("/relatorio-desempenho")
def relatorio_desempenho(db: Session = Depends(get_db)):
    try:
        funcionarios = db.query(FuncionarioModel).all()
        resultado = []

        for f in funcionarios:
            ordens = (
                db.query(OrdemServicoModel)
                .filter(OrdemServicoModel.funcionario_id == f.id)
                .all()
            )
            total_servicos = len(ordens)
            total_mao_obra = sum(o.mao_obra or 0.0 for o in ordens)
            total_faturamento = sum(o.total or 0.0 for o in ordens)

            resultado.append({
                "id": f.id,
                "nome": f.nome,
                "cargo": f.cargo,
                "ativo": f.ativo,
                "total_ordens": total_servicos,
                "total_mao_obra": total_mao_obra,
                "total_faturamento": total_faturamento,
                "ticket_medio": (
                    (total_faturamento / total_servicos)
                    if total_servicos > 0
                    else 0.0
                ),
            })

        return sorted(
            resultado, key=lambda x: x["total_ordens"], reverse=True
        )
    except Exception as e:
        print("❌ Erro ao gerar relatório de equipe:", e)
        raise HTTPException(status_code=500, detail=str(e))