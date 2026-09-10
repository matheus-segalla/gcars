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

        # Acumuladores Financeiros
        faturamento_total = 0.0
        total_recebido = 0.0
        total_a_receber = 0.0
        total_descontos = 0.0
        total_pecas = 0.0
        total_mao_obra = 0.0
        custo_total = 0.0

        ordens_pendentes = []

        for o in ordens_filtradas:
            tot = float(o.total or 0.0)
            pec = float(o.pecas or 0.0)
            mo = float(o.mao_obra or 0.0)
            desc = float(getattr(o, "desconto", 0.0) or 0.0)
            cst = float(o.custo or 0.0)
            pago = float(getattr(o, "valor_pago", 0.0) or 0.0)

            # Fallback caso a ordem antiga não tenha o total com desconto calculado
            if tot == 0.0 and (pec + mo) > 0:
                tot = max(0.0, (pec + mo) - desc)

            saldo_restante = max(0.0, tot - pago)

            faturamento_total += tot
            total_recebido += pago
            total_a_receber += saldo_restante
            total_descontos += desc
            total_pecas += pec
            total_mao_obra += mo
            custo_total += cst

            # Captura ordens com saldo devedor para cobrança rápida
            if saldo_restante > 0.01:
                cliente_obj = o.veiculo.cliente if (o.veiculo and o.veiculo.cliente) else None
                veiculo_obj = o.veiculo if o.veiculo else None

                ordens_pendentes.append({
                    "id": o.id,
                    "numero_orcamento": o.numero_orcamento,
                    "data": o.data_os,
                    "cliente": cliente_obj.nome if cliente_obj else "Não informado",
                    "telefone": cliente_obj.telefone if cliente_obj else None,
                    "veiculo": (
                        f"{veiculo_obj.modelo} ({veiculo_obj.placa or 'Sem placa'})"
                        if veiculo_obj
                        else "Não informado"
                    ),
                    "total": tot,
                    "valor_pago": pago,
                    "restante": saldo_restante,
                    "status_pagamento": getattr(o, "status_pagamento", "pendente") or "pendente",
                    "forma_pagamento": o.forma_pagamento or "N/A"
                })

        # Ordena as pendências pelo maior valor a receber primeiro
        ordens_pendentes.sort(key=lambda x: x["restante"], reverse=True)

        # Lucro líquido projetado (total faturado - custo de peças/despesas)
        lucro_previsto = faturamento_total - custo_total

        # Lucro real em caixa (dinheiro efetivamente recebido - custos)
        lucro_real = total_recebido - custo_total

        margem_lucro = (
            (lucro_previsto / faturamento_total * 100)
            if faturamento_total > 0
            else 0.0
        )
        ticket_medio = (
            (faturamento_total / total_ordens) if total_ordens > 0 else 0.0
        )
        taxa_inadimplencia = (
            (total_a_receber / faturamento_total * 100)
            if faturamento_total > 0
            else 0.0
        )

        # Formas de Pagamento
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

        # Top Serviços Mais Realizados
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
            "total_recebido": total_recebido,
            "total_a_receber": total_a_receber,
            "total_descontos": total_descontos,
            "taxa_inadimplencia": round(taxa_inadimplencia, 1),
            "total_pecas": total_pecas,
            "total_mao_obra": total_mao_obra,
            "custo_total": custo_total,
            "lucro_previsto": lucro_previsto,
            "lucro_real": lucro_real,
            "margem_lucro": margem_lucro,
            "ticket_medio": ticket_medio,
            "formas_pagamento": formas_pagamento,
            "top_servicos": top_servicos,
            "pendencias": ordens_pendentes,
        }

    except Exception as e:
        print("❌ Erro no cálculo de estatísticas:", e)
        raise HTTPException(status_code=500, detail=str(e))