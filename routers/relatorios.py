import datetime
from collections import Counter
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
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/relatorios", tags=["Relatórios & Estatísticas"])


def converter_data_segura(data_str: str) -> Optional[datetime.date]:
    if not data_str:
        return None
    data_limpa = data_str.strip()
    formatos = ["%d/%m/%Y", "%d/%m/%y", "%Y-%m-%d", "%d-%m-%Y"]
    for fmt in formatos:
        try:
            return datetime.datetime.strptime(data_limpa, fmt).date()
        except ValueError:
            continue
    return None


@router.get("/estatisticas")
def obter_estatisticas(
    periodo: str = Query("mes", description="semana, mes, ano, geral"),
    db: Session = Depends(get_db),
):
    try:
        hoje = datetime.date.today()
        todas_ordens = db.query(OrdemServicoModel).all()

        ordens_filtradas = []
        for os_item in todas_ordens:
            dt = converter_data_segura(os_item.data_os)
            if not dt:
                if periodo == "geral":
                    ordens_filtradas.append(os_item)
                continue

            if periodo == "semana":
                if (hoje - dt).days <= 7:
                    ordens_filtradas.append(os_item)
            elif periodo == "mes":
                if dt.month == hoje.month and dt.year == hoje.year:
                    ordens_filtradas.append(os_item)
            elif periodo == "ano":
                if dt.year == hoje.year:
                    ordens_filtradas.append(os_item)
            else:
                ordens_filtradas.append(os_item)

        total_ordens = len(ordens_filtradas)
        faturamento_total = sum(
            float(o.total or 0.0) for o in ordens_filtradas
        )
        total_pecas = sum(float(o.pecas or 0.0) for o in ordens_filtradas)
        total_mao_obra = sum(
            float(o.mao_obra or 0.0) for o in ordens_filtradas
        )
        custo_total = sum(float(o.custo or 0.0) for o in ordens_filtradas)

        lucro_real = faturamento_total - custo_total
        margem_lucro = (
            (lucro_real / faturamento_total * 100)
            if faturamento_total > 0
            else 0.0
        )
        ticket_medio = (
            (faturamento_total / total_ordens) if total_ordens > 0 else 0.0
        )

        pagamentos_map = {}
        for o in ordens_filtradas:
            fp = o.forma_pagamento or "Não Informado"
            pagamentos_map[fp] = pagamentos_map.get(fp, 0.0) + float(
                o.total or 0.0
            )

        formas_pagamento = [
            {
                "metodo": k,
                "valor": v,
                "percentual": (
                    (v / faturamento_total * 100) if faturamento_total > 0 else 0
                ),
            }
            for k, v in pagamentos_map.items()
        ]
        formas_pagamento.sort(key=lambda x: x["valor"], reverse=True)

        contador_servicos = Counter()
        for os_item in ordens_filtradas:
            lista_itens = getattr(os_item, "itens", [])
            for item in lista_itens:
                descricao = getattr(item, "descricao", str(item))
                if descricao and descricao.strip():
                    contador_servicos[descricao.strip()] += 1

        top_servicos = [
            {"descricao": k, "total": v}
            for k, v in contador_servicos.most_common(6)
        ]

        return {
            "periodo": periodo,
            "total_ordens": total_ordens,
            "faturamento_total": faturamento_total,
            "total_pecas": total_pecas,
            "total_mao_obra": total_mao_obra,
            "custo_total": custo_total,
            "lucro_real": lucro_real,
            "margem_lucro": margem_lucro,
            "ticket_medio": ticket_medio,
            "formas_pagamento": formas_pagamento,
            "top_servicos": top_servicos,
        }

    except Exception as e:
        print("❌ Erro no cálculo de estatísticas:", e)
        raise HTTPException(status_code=500, detail=str(e))