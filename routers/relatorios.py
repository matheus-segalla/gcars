from datetime import datetime, timedelta
import json
import math
from typing import Optional

from database import get_db
from fastapi import APIRouter, Depends, Query
from models import OrdemServicoModel
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/relatorios", tags=["Relatórios"])


@router.get("/estatisticas")
def relatorios_estatisticas(
    periodo: str = Query("mes", description="semana, mes, ano, todos"),
    pagina: int = Query(1, ge=1, description="Número da página"),
    limite: int = Query(10, ge=1, le=100, description="Itens por página"),
    db: Session = Depends(get_db),
):
    ordens = db.query(OrdemServicoModel).all()
    agora = datetime.utcnow()
    ordens_filtradas = []

    def parse_data_os(data_str):
        if not data_str:
            return None
        for fmt in ("%d/%m/%Y", "%d/%m/%y", "%Y-%m-%d", "%d-%m-%Y"):
            try:
                return datetime.strptime(data_str.strip(), fmt)
            except ValueError:
                pass
        return None

    inicio_semana = (agora - timedelta(days=agora.weekday())).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    fim_semana = inicio_semana + timedelta(
        days=6, hours=23, minutes=59, seconds=59
    )

    for o in ordens:
        dt = parse_data_os(o.data_os)
        if not dt:
            dt = o.criado_em or agora

        if periodo in ("semana", "7d"):
            if not (inicio_semana <= dt <= fim_semana):
                continue
        elif periodo in ("mes", "30d"):
            if not (dt.month == agora.month and dt.year == agora.year):
                continue
        elif periodo == "ano":
            if dt.year != agora.year:
                continue

        ordens_filtradas.append((o, dt))

    # 1. Cálculos de Totais e KPIs
    total_faturado = sum(o[0].total for o in ordens_filtradas)
    total_pecas = sum(o[0].pecas for o in ordens_filtradas)
    total_mao_obra = sum(o[0].mao_obra for o in ordens_filtradas)
    qtd_ordens = len(ordens_filtradas)
    ticket_medio = total_faturado / qtd_ordens if qtd_ordens > 0 else 0.0

    # 2. Dados do Gráfico de Evolução (Ordem cronológica crescente)
    ordens_grafico = sorted(ordens_filtradas, key=lambda item: item[1])
    agrupamento_data = {}
    dias_semana_nome = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

    for o, dt in ordens_grafico:
        if periodo in ("semana", "7d"):
            chave = f"{dias_semana_nome[dt.weekday()]} ({dt.strftime('%d/%m')})"
        elif periodo in ("mes", "30d"):
            chave = dt.strftime("%d/%m")
        elif periodo == "ano":
            meses = [
                "Jan",
                "Fev",
                "Mar",
                "Abr",
                "Mai",
                "Jun",
                "Jul",
                "Ago",
                "Set",
                "Out",
                "Nov",
                "Dez",
            ]
            chave = meses[dt.month - 1]
        else:
            chave = dt.strftime("%m/%Y")

        if chave not in agrupamento_data:
            agrupamento_data[chave] = {
                "periodo": chave,
                "total": 0.0,
                "pecas": 0.0,
                "mao_obra": 0.0,
                "ordens": 0,
            }

        agrupamento_data[chave]["total"] += o.total
        agrupamento_data[chave]["pecas"] += o.pecas
        agrupamento_data[chave]["mao_obra"] += o.mao_obra
        agrupamento_data[chave]["ordens"] += 1

    evolucao_temporal = list(agrupamento_data.values())

    # 3. Formas de Pagamento
    pagamentos_dict = {}
    for o, _ in ordens_filtradas:
        forma = (o.forma_pagamento or "Não informado").strip().upper()
        pagamentos_dict[forma] = pagamentos_dict.get(forma, 0.0) + o.total

    distribuicao_pagamentos = [
        {"name": k, "value": round(v, 2)} for k, v in pagamentos_dict.items()
    ]

    # 4. Paginação da Tabela (Mais recentes primeiro)
    ordens_tabela = sorted(ordens_filtradas, key=lambda item: item[0].id, reverse=True)
    total_paginas = math.ceil(qtd_ordens / limite) if qtd_ordens > 0 else 1
    inicio_slice = (pagina - 1) * limite
    fim_slice = inicio_slice + limite
    ordens_paginadas = ordens_tabela[inicio_slice:fim_slice]

    itens_tabela = []
    for os_item, _ in ordens_paginadas:
        placa_formatada = (
            os_item.veiculo.placa if os_item.veiculo and os_item.veiculo.placa else "Sem placa"
        )
        cliente_nome = (
            os_item.veiculo.cliente.nome if os_item.veiculo and os_item.veiculo.cliente else "Não informado"
        )
        veiculo_modelo = os_item.veiculo.modelo if os_item.veiculo else "Não informado"

        fotos_lista = []
        if os_item.fotos_json:
            try:
                fotos_lista = json.loads(os_item.fotos_json)
            except Exception:
                fotos_lista = []

        itens_tabela.append({
            "id": os_item.id,
            "numero_orcamento": os_item.numero_orcamento,
            "data": os_item.data_os,
            "cliente": cliente_nome,
            "veiculo": f"{veiculo_modelo} ({placa_formatada})",
            "total": os_item.total,
            "pecas": os_item.pecas,
            "mao_obra": os_item.mao_obra,
            "forma_pagamento": os_item.forma_pagamento,
            "fotos": fotos_lista,
            "servicos": [s.descricao for s in os_item.servicos],
        })

    return {
        "periodo_selecionado": periodo,
        "quantidade_os": qtd_ordens,
        "faturamento_total": total_faturado,
        "total_pecas": total_pecas,
        "total_mao_obra": total_mao_obra,
        "ticket_medio": ticket_medio,
        "evolucao_temporal": evolucao_temporal,
        "distribuicao_pagamentos": distribuicao_pagamentos,
        "tabela": {
            "itens": itens_tabela,
            "total": qtd_ordens,
            "pagina": pagina,
            "total_paginas": total_paginas,
            "limite": limite,
        },
    }